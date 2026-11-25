'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import HeroSection from '@/components/hero-section';
import ArticleCard from '@/components/article-card';
import CategoryFilter from '@/components/category-filter';
import NewsletterBanner from '@/components/newsletter-banner';
import ArticleThumbnail from '@/components/article-thumbnail';
import { Stagger, StaggerItem, FadeIn } from '@/components/ui/animate';
import { ArticleDTO, CATEGORIES } from '@/lib/article-utils';
import { Newspaper, Trophy, Star, ArrowRight, ArrowUpDown, SearchX, PenSquare } from 'lucide-react';

interface HomeContentProps {
  initialArticles: ArticleDTO[];
  initialCategory?: string;
  initialSearch?: string;
}

export default function HomeContent({
  initialArticles,
  initialCategory = 'すべて',
  initialSearch = '',
}: HomeContentProps) {
  const { data: session } = useSession();
  const [allArticles] = useState<ArticleDTO[]>(initialArticles ?? []);
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory && (initialCategory === 'すべて' || CATEGORIES.includes(initialCategory as any))
      ? initialCategory
      : 'すべて'
  );
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<'latest' | 'score'>('latest');

  // Sync URL query params cleanly without full reload
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'すべて') params.set('category', selectedCategory);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    const qs = params.toString();
    const nextUrl = qs ? `/?${qs}` : '/';
    window.history.replaceState(null, '', nextUrl);
  }, [selectedCategory, searchQuery]);

  // Compute category counts from all articles
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { すべて: allArticles.length };
    for (const cat of CATEGORIES) {
      counts[cat] = allArticles.filter((a) => a.category === cat).length;
    }
    return counts;
  }, [allArticles]);

  const heroArticle = useMemo(
    () => allArticles.find((a) => a.isHero) ?? allArticles[0] ?? null,
    [allArticles]
  );

  const showHero = Boolean(heroArticle && !searchQuery.trim() && selectedCategory === 'すべて' && sortBy === 'latest');

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = allArticles.filter((a) => {
      if (selectedCategory !== 'すべて' && a.category !== selectedCategory) return false;
      if (q) {
        const hay = [
          a.title,
          a.summary ?? '',
          a.category,
          a.author,
          a.content ?? '',
          Object.entries(a.specs)
            .map(([k, v]) => `${k} ${v}`)
            .join(' '),
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'score') {
      list = [...list].sort((a, b) => b.score - a.score || b.publishedAt.localeCompare(a.publishedAt));
    } else {
      list = [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    }

    // Only exclude heroArticle from the grid when HeroSection is actually rendered
    if (showHero && heroArticle) {
      list = list.filter((a) => a.id !== heroArticle.id);
    }

    return list;
  }, [allArticles, selectedCategory, searchQuery, sortBy, showHero, heroArticle]);

  const topRanked = useMemo(
    () => [...allArticles].sort((a, b) => b.score - a.score || b.publishedAt.localeCompare(a.publishedAt)).slice(0, 4),
    [allArticles]
  );

  const resetFilters = () => {
    setSelectedCategory('すべて');
    setSearchQuery('');
    setSortBy('latest');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onSearch={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        activeCategory={selectedCategory}
        searchValue={searchQuery}
      />

      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4">
        {/* Hero Spotlight */}
        {showHero && (
          <div className="mt-8">
            <HeroSection article={heroArticle} />
          </div>
        )}

        {/* Filter & Sort Toolbar */}
        <FadeIn>
          <section id="articles-section" className="mt-12 mb-7 scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Newspaper className="w-5 h-5 text-[#00b4d8] dark:text-[#00d4ff]" />
                  {showHero ? (
                    <h2 className="font-display text-2xl font-bold tracking-tight">
                      最新レビュー＆検証記事
                    </h2>
                  ) : (
                    <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                      {searchQuery.trim()
                        ? `「${searchQuery.trim()}」の検索結果`
                        : selectedCategory === 'すべて'
                        ? '最新レビュー＆検証記事'
                        : `${selectedCategory}のレビュー一覧`}
                    </h1>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {filteredArticles.length}件の記事を表示中
                  {showHero ? '（注目レビューを除く）' : ''}
                </p>
              </div>

              {/* Sort & Write Toolbar */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {session?.user && (
                  <Link
                    href="/admin/articles/new"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#00d4ff] text-[#0a1628] hover:bg-[#33ddff] transition-colors shadow-sm"
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    新規記事を投稿
                  </Link>
                )}
                <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted/70 border border-border/60">
                  <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground ml-2 mr-1" />
                  <button
                    type="button"
                    onClick={() => setSortBy('latest')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      sortBy === 'latest'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    新着順
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('score')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      sortBy === 'score'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    高評価順
                  </button>
                </div>
              </div>
            </div>

            <CategoryFilter
              selected={selectedCategory}
              onChange={setSelectedCategory}
              counts={categoryCounts}
            />
          </section>
        </FadeIn>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <Stagger
            key={`${selectedCategory}-${sortBy}-${searchQuery}`}
            staggerDelay={0.05}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredArticles.map((article) => (
              <StaggerItem key={article.id} className="h-full">
                <ArticleCard article={article} headingLevel={showHero ? 'h3' : 'h2'} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-muted/20">
            <SearchX className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-display font-semibold text-base mb-1">
              条件に一致する記事が見つかりませんでした
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              別のキーワードやカテゴリをお試しください。
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              絞り込みをリセット
            </button>
          </div>
        )}

        {/* Editors' Top Score Ranking Strip */}
        {topRanked.length > 0 && !searchQuery.trim() && (
          <FadeIn>
            <section className="mt-16 pt-12 border-t border-border/70">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <h2 className="font-display text-2xl font-bold tracking-tight">
                      編集部スコアランキング TOP 4
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    実機検証の総合スコアが高い殿堂入りガジェット
                  </p>
                </div>
                <Link
                  href="/ranking"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0096c7] dark:text-[#00d4ff] hover:underline"
                >
                  全ランキング・スペック比較へ
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {topRanked.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/articles/${item.id}`}
                    className="group flex flex-col bg-card rounded-xl border border-border/70 overflow-hidden hover:border-[#00b4d8]/60 transition-all"
                    style={{ boxShadow: 'var(--shadow-sm)' }}
                  >
                    <div className="relative">
                      <ArticleThumbnail
                        thumbnail={item.thumbnail}
                        alt={item.title}
                        className="aspect-[16/9] w-full"
                        emojiClassName="text-4xl"
                        imgClassName="group-hover:scale-105"
                      />
                      <span className="absolute top-2.5 left-2.5 w-7 h-7 rounded-md bg-[#0a1628]/90 text-[#00d4ff] font-mono text-xs font-bold flex items-center justify-center border border-[#00d4ff]/30">
                        0{idx + 1}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {item.category}
                        </span>
                        <h3 className="font-display font-semibold text-sm line-clamp-2 mt-0.5 group-hover:text-[#0096c7] dark:group-hover:text-[#00d4ff] transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {item.score.toFixed(1)}
                        </span>
                        {item.priceRange && (
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {item.priceRange}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>
        )}

        {/* Newsletter Digest CTA */}
        <FadeIn>
          <NewsletterBanner />
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
