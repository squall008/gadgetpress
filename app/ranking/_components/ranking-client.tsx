'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ArticleThumbnail from '@/components/article-thumbnail';
import Breadcrumbs from '@/components/breadcrumbs';
import { FadeIn } from '@/components/ui/animate';
import { ArticleDTO, CATEGORIES, getScoreLabel } from '@/lib/article-utils';
import { Trophy, Star, GitCompare, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RankingClient({
  articles,
  initialCompareId,
}: {
  articles: ArticleDTO[];
  initialCompareId?: number;
}) {
  const [selectedCategory, setSelectedCategory] = useState('すべて');

  const defaultLeft = useMemo(() => {
    if (initialCompareId && articles.some((a) => a.id === initialCompareId)) {
      return initialCompareId;
    }
    return articles[0]?.id ?? 0;
  }, [articles, initialCompareId]);

  const defaultRight = useMemo(() => {
    const sameCat = articles.find(
      (a) => a.id !== defaultLeft && a.category === articles.find((x) => x.id === defaultLeft)?.category
    );
    return sameCat?.id ?? articles.find((a) => a.id !== defaultLeft)?.id ?? defaultLeft;
  }, [articles, defaultLeft]);

  const [leftId, setLeftId] = useState<number>(defaultLeft);
  const [rightId, setRightId] = useState<number>(defaultRight);

  const rankedArticles = useMemo(() => {
    const filtered =
      selectedCategory === 'すべて'
        ? articles
        : articles.filter((a) => a.category === selectedCategory);
    return [...filtered].sort((a, b) => b.score - a.score || b.publishedAt.localeCompare(a.publishedAt));
  }, [articles, selectedCategory]);

  const leftArticle = articles.find((a) => a.id === leftId) ?? articles[0];
  const rightArticle = articles.find((a) => a.id === rightId) ?? articles[1] ?? articles[0];

  const mergedSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    Object.keys(leftArticle?.specs ?? {}).forEach((k) => keys.add(k));
    Object.keys(rightArticle?.specs ?? {}).forEach((k) => keys.add(k));
    return Array.from(keys);
  }, [leftArticle, rightArticle]);

  const ratingKeys = ['デザイン・質感', 'パフォーマンス', '使い勝手', 'コストパフォーマンス'];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-10">
        <Breadcrumbs
          items={[
            { label: 'ホーム', href: '/' },
            { label: 'スコアランキング・スペック比較' },
          ]}
          className="mb-6"
        />
        {/* Page Header */}
        <FadeIn>
          <div className="rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0e203d] to-[#0a1628] text-white p-8 md:p-10 mb-10 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(190_100%_50%_/_0.18),_transparent_55%)] pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#00d4ff]">
                <Trophy className="w-4 h-4 text-amber-400" />
                Ranking &amp; Spec Compare
              </div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                ガジェット スコアランキング＆徹底比較
              </h1>
              <p className="text-sm sm:text-base text-white/75 leading-relaxed">
                実機検証に基づく独自スコアランキングと、気になる2製品を並べてスペック・評価を比較できるインタラクティブ比較ボード。
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Interactive Side-by-Side Spec Comparison Tool */}
        {leftArticle && rightArticle && (
          <FadeIn>
            <section className="mb-14">
              <div className="flex items-center gap-2 mb-5">
                <GitCompare className="w-5 h-5 text-[#00b4d8] dark:text-[#00d4ff]" />
                <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight">
                  インタラクティブ・ガジェット比較
                </h2>
              </div>

              <div
                className="rounded-2xl bg-card border border-border/80 overflow-hidden"
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                {/* Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border border-b border-border bg-muted/30">
                  {[
                    { label: '比較製品 A', value: leftId, setter: setLeftId, item: leftArticle },
                    { label: '比較製品 B', value: rightId, setter: setRightId, item: rightArticle },
                  ].map((slot, idx) => (
                    <div key={idx} className="p-5 space-y-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                          {slot.label}
                        </label>
                        <select
                          value={slot.value}
                          onChange={(e) => slot.setter(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 text-sm font-medium rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {articles.map((a) => (
                            <option key={a.id} value={a.id}>
                              [{a.category}] {a.title}（★{a.score.toFixed(1)}）
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-4">
                        <Link href={`/articles/${slot.item.id}`} className="w-28 shrink-0 rounded-lg overflow-hidden border border-border/70">
                          <ArticleThumbnail
                            thumbnail={slot.item.thumbnail}
                            alt={slot.item.title}
                            className="aspect-[16/10] w-full"
                            emojiClassName="text-3xl"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {slot.item.category}
                          </span>
                          <Link
                            href={`/articles/${slot.item.id}`}
                            className="block font-display font-bold text-sm sm:text-base line-clamp-2 mt-1 hover:text-[#0096c7] dark:hover:text-[#00d4ff] transition-colors"
                          >
                            {slot.item.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="inline-flex items-center gap-1 font-mono text-sm font-bold text-amber-500">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              {slot.item.score.toFixed(1)}
                            </span>
                            {slot.item.priceRange && (
                              <span className="text-xs font-mono text-muted-foreground">
                                {slot.item.priceRange}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sub-score comparison */}
                <div className="p-4 sm:p-5 md:p-6 border-b border-border">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h3 className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">
                      項目別スコア比較
                    </h3>
                    <div className="flex md:hidden items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="font-mono font-semibold text-foreground">A: 製品A</span>
                      <span>／</span>
                      <span className="font-mono font-semibold text-foreground">B: 製品B</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {ratingKeys.map((key) => {
                      const lVal = Number(leftArticle.ratings?.[key] ?? leftArticle.score);
                      const rVal = Number(rightArticle.ratings?.[key] ?? rightArticle.score);
                      return (
                        <div key={key} className="grid grid-cols-1 md:grid-cols-12 items-center gap-1.5 md:gap-4 text-sm">
                          <div className="order-2 md:order-1 md:col-span-5 flex items-center gap-2">
                            <span className="md:hidden text-[11px] font-mono text-muted-foreground w-4 shrink-0">A</span>
                            <span className="font-mono text-xs font-bold w-8 text-right shrink-0">{lVal.toFixed(1)}</span>
                            <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  lVal >= rVal ? 'bg-[#00b4d8]' : 'bg-primary/50'
                                }`}
                                style={{ width: `${(lVal / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="order-1 md:order-2 md:col-span-2 md:text-center text-xs font-semibold md:font-medium text-foreground md:text-muted-foreground">
                            {key}
                          </div>
                          <div className="order-3 md:order-3 md:col-span-5 flex items-center gap-2">
                            <span className="md:hidden text-[11px] font-mono text-muted-foreground w-4 shrink-0">B</span>
                            <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden order-2 md:order-1">
                              <div
                                className={`h-full rounded-full ${
                                  rVal >= lVal ? 'bg-[#00b4d8]' : 'bg-primary/50'
                                }`}
                                style={{ width: `${(rVal / 5) * 100}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs font-bold w-8 text-right md:text-left shrink-0 order-1 md:order-2">{rVal.toFixed(1)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pros comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border border-b border-border">
                  {[leftArticle, rightArticle].map((item, idx) => (
                    <div key={idx} className="p-5">
                      <h3 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        主な強み
                      </h3>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-foreground/85">
                        {(item.pros ?? []).slice(0, 3).map((p, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-500">✓</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Spec table */}
                {mergedSpecKeys.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[540px] text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="px-4 py-3 text-left font-semibold w-1/4">スペック項目</th>
                          <th className="px-4 py-3 text-left font-semibold w-[37.5%]">{leftArticle.title}</th>
                          <th className="px-4 py-3 text-left font-semibold w-[37.5%]">{rightArticle.title}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mergedSpecKeys.map((key, idx) => (
                          <tr
                            key={key}
                            className={`${idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'} border-b border-border/60 last:border-0`}
                          >
                            <td className="px-4 py-3 font-medium text-muted-foreground">{key}</td>
                            <td className="px-4 py-3">{leftArticle.specs?.[key] || '—'}</td>
                            <td className="px-4 py-3">{rightArticle.specs?.[key] || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </FadeIn>
        )}

        {/* Leaderboard Ranking */}
        <FadeIn>
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight">
                  総合スコアランキング
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['すべて', ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {rankedArticles.map((article, idx) => (
                <div
                  key={article.id}
                  className="bg-card rounded-xl border border-border/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 hover:border-[#00b4d8]/60 transition-colors"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  {/* Rank number */}
                  <div className="flex items-center gap-4 sm:w-auto">
                    <div
                      className={`w-10 h-10 rounded-lg font-mono text-base font-bold flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700/80 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <Link
                      href={`/articles/${article.id}`}
                      className="w-28 sm:w-36 shrink-0 rounded-lg overflow-hidden border border-border/60"
                    >
                      <ArticleThumbnail
                        thumbnail={article.thumbnail}
                        alt={article.title}
                        className="aspect-[16/10] w-full"
                        emojiClassName="text-3xl"
                      />
                    </Link>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-muted text-foreground/80">
                        {article.category}
                      </span>
                      <span className="text-[11px] font-mono text-[#0096c7] dark:text-[#00d4ff] font-semibold">
                        {getScoreLabel(article.score)}
                      </span>
                      {article.priceRange && (
                        <span className="text-xs font-mono text-muted-foreground">
                          {article.priceRange}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/articles/${article.id}`}
                      className="block font-display font-bold text-base sm:text-lg tracking-tight hover:text-[#0096c7] dark:hover:text-[#00d4ff] transition-colors"
                    >
                      {article.title}
                    </Link>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {article.summary}
                    </p>
                  </div>

                  {/* Score + actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span className="font-mono text-2xl font-bold">{article.score.toFixed(1)}</span>
                      <span className="text-xs font-mono text-muted-foreground">/5.0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRightId(article.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors"
                      >
                        比較に追加
                      </button>
                      <Link
                        href={`/articles/${article.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                      >
                        レビュー
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
