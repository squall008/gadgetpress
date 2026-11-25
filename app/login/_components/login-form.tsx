'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import GoogleSignInButton from '@/components/google-signin-button';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: 'このメールアドレスは別のログイン方法で既に登録されています。',
  AccessDenied: 'Googleアカウントでのアクセスが拒否されました。',
  Configuration: '認証プロバイダの設定に問題があります。環境変数を確認してください。',
  Default: 'ログイン中にエラーが発生しました。もう一度お試しください。',
};

interface LoginFormProps {
  isGoogleConfigured: boolean;
  initialError?: string;
  callbackUrl?: string;
}

export default function LoginForm({
  isGoogleConfigured,
  initialError,
  callbackUrl = '/',
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    initialError ? OAUTH_ERROR_MESSAGES[initialError] || OAUTH_ERROR_MESSAGES.Default : ''
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError('メールアドレスまたはパスワードが正しくありません');
      } else {
        router.replace(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          GadgetPress トップへ戻る
        </Link>

        <div
          className="bg-card border border-border/80 rounded-2xl p-8"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2.5 mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon.svg" alt="GadgetPress ロゴ" className="w-8 h-8 rounded-lg" />
              <span className="font-display text-2xl font-bold tracking-tight">
                Gadget<span className="text-[#00b4d8] dark:text-[#00d4ff]">Press</span>
              </span>
            </div>
            <h1 className="text-sm font-medium text-muted-foreground">アカウントにログイン</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          {/* Google OAuth Button */}
          <GoogleSignInButton
            isConfigured={isGoogleConfigured}
            label="Googleアカウントでログイン"
            callbackUrl={callbackUrl}
          />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2.5 text-muted-foreground">
                またはメールアドレスでログイン
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">メールアドレス</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">パスワード</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="パスワードを入力"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            アカウントをお持ちでない方は{' '}
            <Link
              href="/signup"
              className="text-[#0096c7] dark:text-[#00d4ff] hover:underline font-medium"
            >
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
