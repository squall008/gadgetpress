import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || '';
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';

export const isGoogleAuthConfigured = Boolean(
  googleClientId &&
    googleClientSecret &&
    !googleClientId.startsWith('your-') &&
    !googleClientSecret.startsWith('your-')
);

function getConfiguredAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS || '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  debug: false,
  // Required behind Render's TLS-terminating reverse proxy so Auth.js trusts X-Forwarded-* headers
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    ...(isGoogleAuthConfigured
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'メールアドレス', type: 'email' },
        password: { label: 'パスワード', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user?.password) return null;
        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        const emailVerified = (profile as { email_verified?: boolean } | undefined)?.email_verified;
        if (emailVerified === false) return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? 'user';
        token.id = user.id ?? '';
        if (user.image) token.picture = user.image;
        if (user.name) token.name = user.name;
      }
      // Keep role & id synced with DB and auto-promote emails listed in ADMIN_EMAILS
      const lookupEmail = (user?.email ?? token.email) as string | undefined;
      if (lookupEmail) {
        try {
          const normalized = lookupEmail.trim().toLowerCase();
          const adminEmails = getConfiguredAdminEmails();
          const dbUser = await prisma.user.findUnique({
            where: { email: normalized },
            select: { id: true, role: true, name: true, image: true },
          });
          if (dbUser) {
            let role = dbUser.role;
            if (adminEmails.has(normalized) && role !== 'admin') {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { role: 'admin' },
              });
              role = 'admin';
            }
            token.id = dbUser.id;
            token.role = role;
            if (dbUser.name) token.name = dbUser.name;
            if (dbUser.image) token.picture = dbUser.image;
          }
        } catch {
          // ignore transient lookup errors
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as { role?: string; id?: string }).role = (token.role as string) ?? 'user';
        (session.user as { role?: string; id?: string }).id = (token.id as string) ?? '';
        if (token.picture) session.user.image = token.picture as string;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
});
