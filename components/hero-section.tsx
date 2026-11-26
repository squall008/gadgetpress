'use client';

import Link from 'next/link';
import { Star, ArrowRight, Trophy, Clock } from 'lucide-react';
import { FadeIn } from '@/components/ui/animate';
import { SafeDate } from '@/components/safe-format';
import ArticleThumbnail from '@/components/article-thumbnail';
import { ArticleDTO, DEFAULT_VISIBILITY, estimateReadingTime, getScoreLabel } from '@/lib/article-utils';

export default function HeroSection({ article }: { article: ArticleDTO | null }) {
  if (!article) return null;

  const score = Number(article.score ?? 0);
  const readMins = estimateReadingTime(article.content);
  const vis = { ...DEFAULT_VISIBILITY, ...(article.visibility ?? {}) };

  return (
    <FadeIn>
      <section
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0e203d] to-[#081222] border border-white/10"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(190_100%_50%_/_0.18),_transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(190_100%_50%_/_0.08),_transparent_50%)] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center p-5 sm:p-8 lg:p-12">
          {/* Left Copy */}
          <div className={`${vis.thumbnail ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-5`}>
            <div className="flex flex-wrap items-center gap-2.5">
              {vis.score && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider uppercase rounded-full bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
                  {getScoreLabel(score)}
                </span>
              )}
              <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 text-white/90">
                {article.category}
              </span>
              {vis.priceRange && article.priceRange && (
                <span className="px-2.5 py-1 text-xs font-mono rounded-md bg-white/5 text-white/75 border border-white/10">
                  {article.priceRange}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-[1.2]">
              {article.title}
            </h1>

            {/* Rating + Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {vis.score && (
                <>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i <= Math.round(score) ? 'fill-amber-400 text-amber-400' : 'text-white/25'
                        }`}
                      />
                    ))}
                    <span className="ml-1.5 font-mono font-bold text-white">{score.toFixed(1)}</span>
                    <span className="font-mono text-xs text-white/50">/ 5.0</span>
                  </div>
                  <span className="text-white/25">|</span>
                </>
              )}
              <span className="text-xs text-white/65 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                約{readMins}分で読了
              </span>
              <span className="text-xs text-white/65">
                <SafeDate
                  date={article.publishedAt}
                  options={{ year: 'numeric', month: 'short', day: 'numeric' }}
                  locale="ja-JP"
                />
              </span>
            </div>

            {vis.summary && article.summary && (
              <p className="text-white/75 text-sm sm:text-base leading-relaxed">
                {article.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={`/articles/${article.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00d4ff] text-[#0a1628] font-semibold text-sm hover:bg-[#33ddff] transition-colors duration-fast shadow-md"
              >
                レビュー全文を読む
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/ranking"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 text-white font-medium text-sm hover:bg-white/15 border border-white/15 transition-colors duration-fast"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                ランキングを見る
              </Link>
            </div>
          </div>

          {/* Right Studio Photo */}
          {vis.thumbnail && (
            <div className="lg:col-span-6">
              <Link href={`/articles/${article.id}`} className="block group">
                <div className="relative rounded-xl overflow-hidden border border-white/15 shadow-2xl ring-1 ring-[#00d4ff]/20">
                  <ArticleThumbnail
                    thumbnail={article.thumbnail}
                    alt={article.title}
                    className="aspect-[16/10] w-full"
                    emojiClassName="text-[7rem] md:text-[8.5rem]"
                    imgClassName="group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/50 via-transparent to-transparent pointer-events-none" />
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>
    </FadeIn>
  );
}
