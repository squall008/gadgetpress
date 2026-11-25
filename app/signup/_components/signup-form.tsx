'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, UserPlus, ArrowLeft } from 'lucide-react';
import GoogleSignInButton from '@/components/google-signin-button';

export default function SignupForm({ isGoogleConfigured }: { isGoogleConfigured: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || '登録に失敗しました');
        return;
      }
      const signInRes = await signIn('credentials', { email, password, redirect: false });
      if (signInRes?.error) {
        setError('ログインに失敗しました');
      } else {
        router.replace('/');
        router.refresh();
      }
    } catch {
      setError('登録に失敗しました');
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
            <h1 className="text-sm font-medium text-muted-foreground">新規アカウントを作成</h1>
          </div>

          <GoogleSignInButton
            isConfigured={isGoogleConfigured}
            label="Googleアカウントで登録・ログイン"
            callbackUrl="/"
          />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2.5 text-muted-foreground">
                またはメールアドレスで登録
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">お名前</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="名前を入力"
                />
              </div>
            </div>
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
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="6文字以上"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? '登録中...' : 'アカウントを作成'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            既にアカウントをお持ちの方は{' '}
            <Link
              href="/login"
              className="text-[#0096c7] dark:text-[#00d4ff] hover:underline font-medium"
            >
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
