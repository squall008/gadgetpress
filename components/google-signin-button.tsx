'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { AlertCircle } from 'lucide-react';

interface GoogleSignInButtonProps {
  isConfigured: boolean;
  label?: string;
  callbackUrl?: string;
}

export default function GoogleSignInButton({
  isConfigured,
  label = 'Googleアカウントでログイン',
  callbackUrl = '/',
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showSetupHelp, setShowSetupHelp] = useState(false);

  const handleGoogleLogin = async () => {
    if (!isConfigured) {
      setShowSetupHelp(true);
      return;
    }
    setLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-border bg-background hover:bg-muted/70 text-foreground font-medium text-sm transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>{loading ? 'Googleへリダイレクト中...' : label}</span>
      </button>

      {showSetupHelp && (
        <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-foreground/90 space-y-2 leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Google OAuth クライアントの設定が必要です
          </div>
          <p className="text-muted-foreground">
            Google Cloud Console で OAuth 2.0 クライアント ID を作成し、承認済みリダイレクト URI に以下を登録してください：
          </p>
          <code className="block px-2.5 py-1.5 rounded bg-muted font-mono text-[11px] break-all">
            {typeof window !== 'undefined'
              ? `${window.location.origin}/api/auth/callback/google`
              : 'https://<あなたのドメイン>/api/auth/callback/google'}
          </code>
          <p className="text-muted-foreground">
            取得した値を <code className="font-mono">.env</code> の{' '}
            <code className="font-mono">GOOGLE_CLIENT_ID</code> と{' '}
            <code className="font-mono">GOOGLE_CLIENT_SECRET</code> に設定してサーバーを再起動すると有効になります。
          </p>
        </div>
      )}
    </div>
  );
}
