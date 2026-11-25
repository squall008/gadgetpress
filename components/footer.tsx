import Link from 'next/link';
import { CATEGORIES } from '@/lib/article-utils';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-20">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon.svg" alt="GadgetPress ロゴ" className="w-8 h-8 rounded-lg" />
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                Gadget<span className="text-[#00b4d8] dark:text-[#00d4ff]">Press</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              実機検証・独自ベンチマーク・長期使用の視点から、PC・スマートフォン・デスク環境・オーディオなど本当に価値のある最新ガジェットを厳選してお届けするテックオウンドメディアです。
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-muted-foreground">
              <span>Unbiased Reviews</span>
              <span>•</span>
              <span>Hands-On Testing</span>
              <span>•</span>
              <span>Spec Analysis</span>
            </div>
          </div>

          {/* Categories */}
          <div className="md:col-span-3">
            <h2 className="font-display font-semibold text-sm mb-3.5 tracking-tight">カテゴリ</h2>
            <ul className="space-y-2.5">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/?category=${encodeURIComponent(cat)}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Media Links */}
          <div className="md:col-span-4">
            <h2 className="font-display font-semibold text-sm mb-3.5 tracking-tight">メディア情報</h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  新着レビュー一覧
                </Link>
              </li>
              <li>
                <Link href="/ranking" className="text-muted-foreground hover:text-foreground transition-colors">
                  スコアランキング・ガジェットスペック比較
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  GadgetPressについて・評価基準と編集方針
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                  編集部 管理コンソール
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>&copy; 2026 GadgetPress. All rights reserved.</p>
          <p className="font-mono">Powered by Next.js &amp; Hands-On Reviews</p>
        </div>
      </div>
    </footer>
  );
}
