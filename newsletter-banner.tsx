'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NewsletterBanner() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribed(true);
        setEmail('');
        toast.success(data?.message || 'ニュースレターに登録しました');
      } else {
        toast.error(data?.error || '登録に失敗しました');
      }
    } catch {
      toast.error('通信エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a1628] via-[#102442] to-[#0a1628] border border-white/10 p-6 sm:p-8 md:p-10 mt-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,_hsl(190_100%_50%_/_0.18),_transparent_50%)] pointer-events-none" />
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#00d4ff]">
            <Mail className="w-3.5 h-3.5" />
            GadgetPress Weekly Digest
          </div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-white tracking-tight">
            週1回、編集部厳選の最新ガジェットレビューをお届け
          </h2>
          <p className="text-sm text-white/70 leading-relaxed">
            新製品の実機検証レポート、セール時の狙い目モデル、デスク環境特集を毎週金曜日にメールで配信します。
          </p>
        </div>

        <div className="w-full lg:w-auto lg:min-w-[380px]">
          {subscribed ? (
            <div className="flex items-center gap-2.5 px-5 py-3.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              ご登録ありがとうございます！次回の配信をお楽しみに。
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレスを入力..."
                className="flex-1 px-4 py-3 text-sm rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-lg bg-[#00d4ff] text-[#0a1628] font-semibold text-sm hover:bg-[#33ddff] transition-colors disabled:opacity-60 shrink-0"
              >
                {submitting ? '登録中...' : '無料で購読'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
