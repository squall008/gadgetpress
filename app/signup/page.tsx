import type { Metadata } from 'next';
import { auth, isGoogleAuthConfigured } from '@/auth';
import { redirect } from 'next/navigation';
import SignupForm from './_components/signup-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '新規アカウント登録',
  description: 'GadgetPress の新規アカウントを作成します。',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect('/');
  return <SignupForm isGoogleConfigured={isGoogleAuthConfigured} />;
}
