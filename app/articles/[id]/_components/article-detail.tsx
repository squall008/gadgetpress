'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ArticleCard from '@/components/article-card';
import ArticleThumbnail from '@/components/article-thumbnail';
import Breadcrumbs from '@/components/breadcrumbs';
import DeleteArticleDialog from '@/components/delete-article-dialog';
import { SafeDate } from '@/components/safe-format';
import { FadeIn, SlideIn, Stagger, StaggerItem } from '@/components/ui/animate';
import {
  ArticleDTO,
  DEFAULT_VISIBILITY,
  estimateReadingTime,
  extractHeadings,
  getScoreLabel,
  sanitizeExternalUrl,
} from '@/lib/article-utils';
import {
  Star,
  Calendar,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Share2,
  List,
  GitCompare,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function ArticleDetail({
  article,
  related,
  canEdit = false,
}: {
  article: ArticleDTO;
  related: ArticleDTO[];
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const score = Number(article?.score ?? 0);
  const specs = article?.specs ?? {};
  const pros = article?.pros ?? [];
  const cons = article?.cons ?? [];
  const ratings = article?.ratings ?? {};
  const vis = { ...DEFAULT_VISIBILITY, ...(article?.visibility ?? {}) };
  const readMins = estimateReadingTime(article?.content);
  const headings = extractHeadings(article?.content);
  const safeAmazonUrl = sanitizeExternalUrl(article?.amazonUrl);
  const safeOfficialUrl = sanitizeExternalUrl(article?.officialUrl);
  const showPros = vis.pros && pros.length > 0;
  const showCons = vis.cons && cons.length > 0;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/articles/${article.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('記事を削除しました');
        setDeleteOpen(false);
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || '削除に失敗しました');
      }
    } catch {
      toast.error('削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success('記事URLをコピーしました');
    } catch {
      toast.error('URLのコピーに失敗しました');
    }
  };

  // Rich Markdown-ish renderer with deterministic section IDs matching TOC
  const renderContent = (text: string | null) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let headingIdx = 0;
    let seenH2 = false;
    let listBuffer: string[] = [];

    const flushList = (keyPrefix: string) => {
      if (listBuffer.length === 0) return;
      elements.push(
        <ul
          key={`list-${keyPrefix}`}
          className="my-4 space-y-2 pl-5 list-disc marker:text-[#00b4d8] dark:marker:text-[#00d4ff] text-foreground/90"
        >
          {listBuffer.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineBold(item)}
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    };

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('・')) {
        listBuffer.push(trimmed.startsWith('- ') ? trimmed.slice(2) : trimmed.slice(1).trim());
        return;
      }

      flushList(String(i));

      if (trimmed.startsWith('### ')) {
        const id = `section-${headingIdx++}`;
        const Tag = seenH2 ? 'h3' : 'h2';
        elements.push(
          <Tag
            key={i}
            id={id}
            className="font-display text-lg md:text-xl font-bold mt-8 mb-3 tracking-tight scroll-mt-24 flex items-center gap-2"
          >
            <span className="w-1 h-5 rounded-full bg-[#00b4d8] dark:bg-[#00d4ff] inline-block shrink-0" />
            {trimmed.slice(4)}
          </Tag>
        );
      } else if (trimmed.startsWith('## ')) {
        seenH2 = true;
        const id = `section-${headingIdx++}`;
        elements.push(
          <h2
            key={i}
            id={id}
            className="font-display text-xl md:text-2xl font-bold mt-10 mb-4 pb-2 border-b border-border tracking-tight scroll-mt-24"
          >
            {trimmed.slice(3)}
          </h2>
        );
      } else if (trimmed === '') {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="text-foreground/85 text-[15px] md:text-base leading-[1.85] mb-3">
            {renderInlineBold(trimmed)}
          </p>
        );
      }
    });

    flushList('end');
    return elements;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-[920px] mx-auto w-full px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'ホーム', href: '/' },
            { label: article.category, href: `/?category=${encodeURIComponent(article.category)}` },
            { label: article.title },
          ]}
          className="mb-4"
        />
        {/* Top Breadcrumb & Share */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            記事一覧に戻る
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <>
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Edit className="w-3.5 h-3.5" />
                  編集する
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  削除
                </button>
              </>
            )}
            <Link
              href={`/ranking?compare=${article.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5 text-[#00b4d8]" />
              他製品とスペック比較
            </Link>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              URLをコピー
            </button>
          </div>
        </div>

        <FadeIn>
          {/* Editorial Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <Link
                href={`/?category=${encodeURIComponent(article.category)}`}
                className="px-3 py-1 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {article.category}
              </Link>
              {vis.score && (
                <span className="px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-md bg-[#00b4d8]/15 text-[#0077b6] dark:text-[#00d4ff]">
                  {getScoreLabel(score)}
                </span>
              )}
              {vis.priceRange && article.priceRange && (
                <span className="px-2.5 py-1 text-xs font-mono rounded-md bg-muted text-foreground/80">
                  参考価格: {article.priceRange}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.25] mb-4">
              {article.title}
            </h1>

            {vis.summary && article.summary && (
              <p className="text-base text-muted-foreground leading-relaxed mb-5">
                {article.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground pb-6 border-b border-border">
              {vis.author && (
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground/85">
                  <User className="w-4 h-4 text-[#00b4d8]" />
                  {article.author}
                </span>
              )}
              <time dateTime={article.publishedAt} className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                公開:
                <SafeDate
                  date={article.publishedAt}
                  options={{ year: 'numeric', month: 'long', day: 'numeric' }}
                  locale="ja-JP"
                />
              </time>
              {article.updatedAt &&
                article.updatedAt.slice(0, 10) !== article.publishedAt.slice(0, 10) && (
                  <time dateTime={article.updatedAt} className="inline-flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    更新:
                    <SafeDate
                      date={article.updatedAt}
                      options={{ year: 'numeric', month: 'long', day: 'numeric' }}
                      locale="ja-JP"
                    />
                  </time>
                )}
              {vis.content && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  約{readMins}分で読了
                </span>
              )}
            </div>
          </header>

          {/* Hero Cover Photograph */}
          {vis.thumbnail && (
            <div
              className="rounded-2xl overflow-hidden border border-border/80 mb-8"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              <ArticleThumbnail
                thumbnail={article.thumbnail}
                alt={article.title}
                className="aspect-[16/9] w-full"
                emojiClassName="text-8xl"
                priority
              />
            </div>
          )}
        </FadeIn>

        {/* Verdict & Score Breakdown Card */}
        {(vis.score || vis.ratings) && (
          <SlideIn from="bottom">
            <section
              className="rounded-2xl bg-card border border-border/80 p-6 md:p-7 mb-8"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Overall Score Badge */}
                {vis.score && (
                  <div className="flex md:flex-col items-center justify-between md:justify-center gap-3 md:w-44 md:shrink-0 p-4 rounded-xl bg-[#0a1628] text-white text-center">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#00d4ff]">
                      GadgetPress Score
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-4xl font-bold tracking-tight">
                        {score.toFixed(1)}
                      </span>
                      <span className="font-mono text-xs text-white/50">/ 5.0</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i <= Math.round(score) ? 'fill-amber-400 text-amber-400' : 'text-white/25'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Score Bars */}
                {vis.ratings && (
                  <div className="flex-1 space-y-3">
                    <h2 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">
                      項目別スコア内訳
                    </h2>
                    {Object.keys(ratings).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        {Object.entries(ratings).map(([label, val]) => {
                          const pct = Math.min(100, Math.max(0, (Number(val) / 5) * 100));
                          return (
                            <div key={label} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-foreground/85">{label}</span>
                                <span className="font-mono font-semibold">{Number(val).toFixed(1)}</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#0096c7] to-[#00d4ff]"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        デザイン・実用性・パフォーマンス・コストパフォーマンスを総合評価した編集部スコアです。
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>
          </SlideIn>
        )}

        {/* Pros & Cons */}
        {(showPros || showCons) && (
          <SlideIn from="bottom">
            <div className={`grid grid-cols-1 ${showPros && showCons ? 'md:grid-cols-2' : ''} gap-4 mb-8`}>
              {showPros && (
                <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/25 border border-emerald-200/70 dark:border-emerald-900/50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="font-display text-base font-bold text-emerald-800 dark:text-emerald-300">
                      良い点（Pros）
                    </h2>
                  </div>
                  <ul className="space-y-2.5">
                    {pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showCons && (
                <div className="rounded-xl bg-orange-50/80 dark:bg-orange-950/25 border border-orange-200/70 dark:border-orange-900/50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <h2 className="font-display text-base font-bold text-orange-800 dark:text-orange-300">
                      気になる点（Cons）
                    </h2>
                  </div>
                  <ul className="space-y-2.5">
                    {cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                        <span className="text-orange-600 dark:text-orange-400 font-bold mt-0.5">!</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SlideIn>
        )}

        {/* Table of Contents */}
        {vis.toc && vis.content && headings.length > 1 && (
          <FadeIn>
            <nav
              aria-label="記事の目次"
              className="rounded-xl bg-muted/40 border border-border/70 p-5 mb-8"
            >
              <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-muted-foreground mb-3">
                <List className="w-4 h-4 text-[#00b4d8]" />
                目次
              </div>
              <ol className="space-y-1.5 text-sm">
                {headings.map((h) => (
                  <li key={h.id} className={h.level === 3 ? 'pl-4' : 'font-medium'}>
                    <a
                      href={`#${h.id}`}
                      className="text-foreground/80 hover:text-[#0096c7] dark:hover:text-[#00d4ff] transition-colors"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </FadeIn>
        )}

        {/* Main Editorial Article Content */}
        {vis.content && (
          <FadeIn>
            <article className="mb-12">{renderContent(article.content)}</article>
          </FadeIn>
        )}

        {/* Product Specs Table */}
        {vis.specs && Object.keys(specs).length > 0 && (
          <SlideIn from="bottom">
            <section className="mb-10">
              <h2 className="font-display text-xl font-bold tracking-tight mb-4">
                製品スペック一覧
              </h2>
              <div className="rounded-xl overflow-x-auto border border-border">
                <table className="w-full text-xs sm:text-sm">
                  <tbody>
                    {Object.entries(specs).map(([key, value], i) => (
                      <tr
                        key={key}
                        className={`${
                          i % 2 === 0 ? 'bg-muted/35' : 'bg-card'
                        } border-b border-border/60 last:border-0`}
                      >
                        <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-left font-semibold text-foreground/80 w-[38%] sm:w-1/3 border-r border-border/60 align-top break-words">
                          {key}
                        </th>
                        <td className="px-3 sm:px-4 py-3 sm:py-3.5 text-foreground/90 break-words">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </SlideIn>
        )}

        {/* Purchase / Product CTA Card */}
        {vis.links && (safeAmazonUrl || safeOfficialUrl) && (
          <FadeIn>
            <section className="rounded-2xl bg-gradient-to-r from-[#0a1628] via-[#0f213d] to-[#0a1628] border border-white/10 p-6 md:p-8 mb-14 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <span className="text-xs font-mono text-[#00d4ff] uppercase tracking-wider">
                    Product Check
                  </span>
                  <h2 className="font-display text-lg md:text-xl font-bold tracking-tight">
                    {article.title}
                  </h2>
                  {(vis.priceRange || vis.score) && (
                    <p className="text-xs text-white/65">
                      {vis.priceRange && article.priceRange ? `参考価格: ${article.priceRange}` : ''}
                      {vis.priceRange && article.priceRange && vis.score ? ' ／ ' : ''}
                      {vis.score ? `GadgetPress総合スコア ${score.toFixed(1)} / 5.0` : ''}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                  {safeAmazonUrl && (
                    <a
                      href={safeAmazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-amber-500 text-slate-950 font-semibold text-sm hover:bg-amber-400 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Amazonでチェック
                    </a>
                  )}
                  {safeOfficialUrl && (
                    <a
                      href={safeOfficialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#00d4ff] text-[#0a1628] font-semibold text-sm hover:bg-[#33ddff] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      公式サイトを見る
                    </a>
                  )}
                </div>
              </div>
            </section>
          </FadeIn>
        )}

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="pt-8 border-t border-border">
            <h2 className="font-display text-xl font-bold tracking-tight mb-6">
              あわせて読みたい関連レビュー
            </h2>
            <Stagger staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((a) => (
                <StaggerItem key={a.id} className="h-full">
                  <ArticleCard article={a} />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        )}
      </main>

      <Footer />

      <DeleteArticleDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteOpen(false);
        }}
        articleTitle={article.title}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
