import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || '';
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';

export const isGoogleAuthConfigured = Boolean(
  googleClientId &&
    googleClientSecret &&
    !googleClientId.startsWith('your-') &&
    !googleClientSecret.startsWith('your-')
);

export function getConfiguredAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS || '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

async function isAuthorizedAdminEmail(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const configured = getConfiguredAdminEmails();
  if (configured.size > 0) {
    return configured.has(normalized);
  }

  // Fail-closed fallback: if ADMIN_EMAILS is unset, allow only existing DB admin accounts
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: normalized },
      select: { role: true },
    });
    return dbUser?.role === 'admin';
  } catch {
    return false;
  }
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
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== 'google') {
        return false;
      }
      const googleProfile = profile as { email?: string; email_verified?: boolean } | undefined;
      if (googleProfile?.email_verified !== true) {
        return false;
      }
      const email = googleProfile?.email || user?.email;
      if (!email) {
        return false;
      }
      return isAuthorizedAdminEmail(email);
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? '';
        token.role = (user as { role?: string }).role ?? 'user';
        if (user.image) token.picture = user.image;
        if (user.name) token.name = user.name;
      }

      const lookupEmail = (user?.email ?? token.email) as string | undefined;
      if (lookupEmail) {
        try {
          const normalized = lookupEmail.trim().toLowerCase();
          const authorized = await isAuthorizedAdminEmail(normalized);
          const dbUser = await prisma.user.findUnique({
            where: { email: normalized },
            select: { id: true, role: true, name: true, image: true },
          });
          if (dbUser) {
            let role = authorized ? 'admin' : 'user';
            if (dbUser.role !== role) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { role },
              });
            }
            token.id = dbUser.id;
            token.role = role;
            if (dbUser.name) token.name = dbUser.name;
            if (dbUser.image) token.picture = dbUser.image;
          } else {
            // User no longer exists in DB — clear stale credentials so deleted accounts cannot retain access
            token.id = '';
            token.role = 'user';
          }
        } catch {
          // keep previous token fields on transient DB errors
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
