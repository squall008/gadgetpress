import type { Metadata } from 'next';
import { auth, isGoogleAuthConfigured } from '@/auth';
import { redirect } from 'next/navigation';
import { sanitizeCallbackUrl } from '@/lib/article-utils';
import LoginForm from './_components/login-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ログイン',
  description: 'GadgetPress の管理者アカウントへログインします。',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const safeCallbackUrl = sanitizeCallbackUrl(params?.callbackUrl, '/admin');

  const session = await auth();
  if (session?.user) redirect(safeCallbackUrl);

  return (
    <LoginForm
      isGoogleConfigured={isGoogleAuthConfigured}
      initialError={params?.error}
      callbackUrl={safeCallbackUrl}
    />
  );
}
