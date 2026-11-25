import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { FadeIn } from '@/components/ui/animate';
import { ShieldCheck, Cpu, Scale, Award, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'GadgetPressについて・編集方針',
  description: 'GadgetPressのメディア理念、実機テストプロセス、および5段階評価スコアの明確な基準をご紹介します。',
  openGraph: {
    title: 'GadgetPressについて・編集方針 | GadgetPress',
    description: 'GadgetPressのメディア理念、実機テストプロセス、および5段階評価スコアの明確な基準をご紹介します。',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GadgetPressについて・編集方針 | GadgetPress',
    description: 'GadgetPressのメディア理念、実機テストプロセス、および5段階評価スコアの明確な基準をご紹介します。',
    images: ['/og-image.png'],
  },
};

const principles = [
  {
    icon: ShieldCheck,
    title: '忖度なしの実機検証',
    body: 'メーカーの宣伝文句やスペック表の数字だけを鵜呑みにせず、編集部が実際に数週間使い込んだ上で「良い点」と「気になる点」を対等に言語化します。',
  },
  {
    icon: Cpu,
    title: '定量データ×日常体験',
    body: 'バッテリー持続時間・ビルド速度・ノイズ低減などの実測値と、持ち運びやすさや打鍵感といった毎日の手触りをバランスよく評価します。',
  },
  {
    icon: Scale,
    title: '長期視点でのコスト評価',
    body: '単に「高い・安い」ではなく、3〜5年の使用に耐えるビルドクオリティ・OSサポート期間・買い替えコストまで含めて本当の価値を検証します。',
  },
];

const rubric = [
  { range: '4.7 – 5.0', label: 'EDITORS CHOICE', desc: '各カテゴリの新たな基準となる傑作。予算が許すなら迷わずおすすめできる完成度。' },
  { range: '4.5 – 4.6', label: 'EXCELLENT', desc: '非常に完成度が高く、細かな弱点を補って余りある明確な強みを持つ優秀なガジェット。' },
  { range: '4.0 – 4.4', label: 'RECOMMENDED', desc: '用途が合致すれば満足度の高い製品。購入前にメリット・デメリットの確認を推奨。' },
  { range: '〜 3.9', label: 'NICHE / CAUTION', desc: '特定用途には光るものの、価格や完成度に課題が残り他機種との比較検討が必要な製品。' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-[960px] mx-auto w-full px-4 py-10">
        <FadeIn>
          <section className="rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0e203d] to-[#0a1628] text-white p-8 md:p-12 mb-12 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(190_100%_50%_/_0.2),_transparent_55%)] pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="inline-block px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30">
                About GadgetPress
              </span>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                本当に長く愛せるガジェットと出会うためのテックメディア
              </h1>
              <p className="text-sm sm:text-base text-white/75 leading-relaxed">
                GadgetPressは、PC・スマートフォン・デスク環境・オーディオ分野を中心に、実機検証と徹底比較で「後悔しないガジェット選び」を支援するオウンドメディアです。
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Editorial Principles */}
        <FadeIn>
          <section className="mb-14">
            <h2 className="font-display text-2xl font-bold tracking-tight mb-6">
              3つの編集ポリシー
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {principles.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-xl bg-card border border-border/80 p-6 space-y-3"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0a1628] text-[#00d4ff] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-base">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Scoring Rubric */}
        <FadeIn>
          <section className="mb-14">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-6 h-6 text-[#00b4d8]" />
              <h2 className="font-display text-2xl font-bold tracking-tight">
                GadgetPress 評価スコア基準
              </h2>
            </div>
            <div className="rounded-xl overflow-hidden border border-border bg-card">
              <div className="divide-y divide-border">
                {rubric.map((row) => (
                  <div key={row.label} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                    <div className="sm:w-44 shrink-0 flex items-center sm:flex-col sm:items-start gap-2">
                      <span className="font-mono text-lg font-bold text-foreground">{row.range}</span>
                      <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-[#00b4d8]/15 text-[#0077b6] dark:text-[#00d4ff]">
                        {row.label}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed">{row.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* CTA */}
        <FadeIn>
          <div className="rounded-xl bg-muted/50 border border-border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-base">最新レビューとランキングをチェック</h3>
              <p className="text-sm text-muted-foreground">
                実機テスト済みのガジェット記事をカテゴリやスコアから探せます。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/ranking"
                className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-border bg-card hover:bg-muted transition-colors"
              >
                ランキング・比較
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                記事一覧へ
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
