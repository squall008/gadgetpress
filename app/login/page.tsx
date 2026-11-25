import type { Metadata } from 'next';
import { auth, isGoogleAuthConfigured } from '@/auth';
import { redirect } from 'next/navigation';
import LoginForm from './_components/login-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ログイン',
  description: 'GadgetPress のアカウントへログインします。',
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
  const session = await auth();
  if (session?.user) redirect('/');

  const params = await searchParams;
  return (
    <LoginForm
      isGoogleConfigured={isGoogleAuthConfigured}
      initialError={params?.error}
      callbackUrl={params?.callbackUrl || '/'}
    />
  );
}
