'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import GoogleSignInButton from '@/components/google-signin-button';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: 'このメールアドレスは別のログイン方法で既に登録されています。',
  AccessDenied:
    'このGoogleアカウントには管理者権限がありません。許可された管理者アカウントでログインしてください。',
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
  callbackUrl = '/admin',
}: LoginFormProps) {
  const error = initialError
    ? OAUTH_ERROR_MESSAGES[initialError] || OAUTH_ERROR_MESSAGES.Default
    : '';

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
            <h1 className="text-sm font-medium text-muted-foreground">管理者ログイン</h1>
          </div>

          {error && (
            <div className="mb-5 p-3.5 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 leading-relaxed">
              {error}
            </div>
          )}

          {/* Google OAuth Button (Admin Only) */}
          <GoogleSignInButton
            isConfigured={isGoogleConfigured}
            label="管理者Googleアカウントでログイン"
            callbackUrl={callbackUrl}
          />

          <div className="mt-6 pt-5 border-t border-border/70 flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-[#00b4d8] shrink-0 mt-0.5" />
            <p>
              記事の投稿・編集・削除は、あらかじめ許可された管理者 Google アカウントのみ利用できます。一般ユーザーの新規登録・ログインは受け付けていません。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
