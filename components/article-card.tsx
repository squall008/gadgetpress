'use client';

import Link from 'next/link';
import { Star, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { SafeDate } from '@/components/safe-format';
import { HoverLift } from '@/components/ui/animate';
import ArticleThumbnail from '@/components/article-thumbnail';
import { ArticleDTO, DEFAULT_VISIBILITY, estimateReadingTime } from '@/lib/article-utils';

export default function ArticleCard({
  article,
  headingLevel = 'h3',
}: {
  article: ArticleDTO;
  headingLevel?: 'h2' | 'h3';
}) {
  const score = Number(article?.score ?? 0);
  const readMins = estimateReadingTime(article?.content);
  const vis = { ...DEFAULT_VISIBILITY, ...(article?.visibility ?? {}) };
  const HeadingTag = headingLevel;

  return (
    <HoverLift className="h-full">
      <Link href={`/articles/${article.id}`} className="block h-full group">
        <article
          className="h-full flex flex-col bg-card rounded-xl overflow-hidden border border-border/70 transition-colors duration-fast group-hover:border-[#00b4d8]/60 dark:group-hover:border-[#00d4ff]/50"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          {vis.thumbnail ? (
            <div className="relative">
              <ArticleThumbnail
                thumbnail={article.thumbnail}
                alt={article.title}
                className="aspect-[16/10] w-full"
                emojiClassName="text-6xl"
                imgClassName="group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#0a1628]/80 text-[#00d4ff] backdrop-blur-md border border-white/10">
                  {article.category}
                </span>
              </div>
              {vis.score && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-[#0a1628]/85 text-white backdrop-blur-md border border-white/10">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {score.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="px-5 pt-5 flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#0a1628]/10 text-[#0077b6] dark:bg-[#00d4ff]/15 dark:text-[#00d4ff]">
                {article.category}
              </span>
              {vis.score && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-muted text-foreground">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {score.toFixed(1)}
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col">
            <HeadingTag className="font-display font-bold text-base tracking-tight leading-snug line-clamp-2 mb-2 text-card-foreground group-hover:text-[#0096c7] dark:group-hover:text-[#00d4ff] transition-colors">
              {article.title}
            </HeadingTag>
            {vis.summary && article.summary ? (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
                {article.summary}
              </p>
            ) : (
              <div className="flex-1" />
            )}

            {/* Footer meta */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <SafeDate
                    date={article.publishedAt}
                    options={{ year: 'numeric', month: 'short', day: 'numeric' }}
                    locale="ja-JP"
                  />
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {readMins}分
                </span>
              </div>
              <span className="inline-flex items-center gap-0.5 font-medium text-foreground/75 group-hover:text-[#0096c7] dark:group-hover:text-[#00d4ff] transition-colors">
                {vis.priceRange && article.priceRange ? (
                  <span className="font-mono text-[11px]">{article.priceRange}</span>
                ) : (
                  <>
                    読む
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </>
                )}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </HoverLift>
  );
}
