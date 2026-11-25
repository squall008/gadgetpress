'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import ArticleThumbnail from '@/components/article-thumbnail';
import DeleteArticleDialog from '@/components/delete-article-dialog';
import { SafeDate } from '@/components/safe-format';
import { FadeIn } from '@/components/ui/animate';
import { ArticleDTO } from '@/lib/article-utils';
import { Plus, Edit, Trash2, Star, Settings, ExternalLink, FileText, Mail, Award, PenSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminContent({
  initialArticles,
  subscriberCount = 0,
  isAdmin = false,
}: {
  initialArticles: ArticleDTO[];
  subscriberCount?: number;
  isAdmin?: boolean;
}) {
  const [articles, setArticles] = useState<ArticleDTO[]>(initialArticles ?? []);
  const [deleteTarget, setDeleteTarget] = useState<ArticleDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const avgScore =
    articles.length > 0
      ? (articles.reduce((acc, a) => acc + Number(a.score ?? 0), 0) / articles.length).toFixed(2)
      : '0.00';

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/articles/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== deleteTarget.id));
        toast.success('記事を削除しました');
        setDeleteTarget(null);
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-8">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <Settings className="w-6 h-6 text-[#00b4d8] dark:text-[#00d4ff]" />
                <h1 className="font-display text-2xl font-bold tracking-tight">
                  {isAdmin ? 'GadgetPress 記事管理コンソール' : 'あなたの投稿記事管理'}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isAdmin
                  ? 'すべてのレビュー記事の投稿・編集・削除・ヒーロー設定を管理します'
                  : 'あなたが投稿した記事の作成・編集・削除を管理します'}
              </p>
            </div>
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              新規記事を作成
            </Link>
          </div>

          {/* KPI Summary Cards */}
          <div className={`grid grid-cols-1 ${isAdmin ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4 mb-8`}>
            <div className="rounded-xl bg-card border border-border/80 p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary dark:text-[#00d4ff] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? '公開記事数' : 'あなたの投稿数'}
                </p>
                <p className="font-mono text-2xl font-bold">{articles.length}</p>
              </div>
            </div>
            <div className="rounded-xl bg-card border border-border/80 p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">平均レビュースコア</p>
                <p className="font-mono text-2xl font-bold">{avgScore}</p>
              </div>
            </div>
            {isAdmin && (
              <div className="rounded-xl bg-card border border-border/80 p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-[#00b4d8]/15 text-[#0096c7] dark:text-[#00d4ff] flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ニュースレター購読者</p>
                  <p className="font-mono text-2xl font-bold">{subscriberCount}</p>
                </div>
              </div>
            )}
          </div>

          {/* Articles Table (Desktop) & Card List (Mobile) */}
          {articles.length > 0 ? (
            <>
              {/* Mobile Cards */}
              <div className="space-y-3 md:hidden">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="rounded-xl bg-card border border-border/80 p-4 space-y-3"
                    style={{ boxShadow: 'var(--shadow-sm)' }}
                  >
                    <div className="flex items-start gap-3">
                      <Link
                        href={`/articles/${article.id}`}
                        className="w-24 shrink-0 rounded-lg overflow-hidden border border-border/60"
                      >
                        <ArticleThumbnail
                          thumbnail={article.thumbnail}
                          alt={article.title}
                          className="aspect-[16/10] w-full"
                          emojiClassName="text-2xl"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-[#00b4d8]/15 text-[#0077b6] dark:text-[#00d4ff]">
                            {article.category}
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-xs font-mono font-semibold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {Number(article.score ?? 0).toFixed(1)}
                          </span>
                          {isAdmin && article.isHero && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300">
                              ★ ヒーロー
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/articles/${article.id}`}
                          className="font-display font-semibold text-sm line-clamp-2 hover:text-[#0096c7] dark:hover:text-[#00d4ff] transition-colors"
                        >
                          {article.title}
                        </Link>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          <SafeDate
                            date={article.publishedAt}
                            options={{ year: 'numeric', month: 'short', day: 'numeric' }}
                            locale="ja-JP"
                          />
                          {article.priceRange ? ` ・ ${article.priceRange}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-border/60">
                      <Link
                        href={`/articles/${article.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        表示
                      </Link>
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        編集
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(article)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div
                className="hidden md:block bg-card rounded-xl border border-border/80 overflow-hidden"
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border whitespace-nowrap">
                        <th className="px-4 py-3 text-left font-semibold w-14">ID</th>
                        <th className="px-4 py-3 text-left font-semibold">記事タイトル</th>
                        <th className="px-4 py-3 text-left font-semibold">カテゴリ</th>
                        <th className="px-4 py-3 text-left font-semibold">スコア</th>
                        <th className="px-4 py-3 text-left font-semibold">公開日</th>
                        {isAdmin && <th className="px-4 py-3 text-left font-semibold">注目設定</th>}
                        <th className="px-4 py-3 text-right font-semibold">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map((article) => (
                        <tr
                          key={article.id}
                          className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-muted-foreground">{article.id}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-14 shrink-0 rounded-md overflow-hidden border border-border/60">
                                <ArticleThumbnail
                                  thumbnail={article.thumbnail}
                                  alt={article.title}
                                  className="aspect-[16/10] w-full"
                                  emojiClassName="text-lg"
                                />
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/articles/${article.id}`}
                                  className="font-medium line-clamp-1 hover:text-[#0096c7] dark:hover:text-[#00d4ff] transition-colors"
                                >
                                  {article.title}
                                </Link>
                                {article.priceRange && (
                                  <p className="text-xs font-mono text-muted-foreground">
                                    {article.priceRange}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap bg-[#00b4d8]/15 text-[#0077b6] dark:text-[#00d4ff]">
                              {article.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-mono font-semibold">
                                {Number(article.score ?? 0).toFixed(1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            <SafeDate
                              date={article.publishedAt}
                              options={{ year: 'numeric', month: 'short', day: 'numeric' }}
                              locale="ja-JP"
                            />
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3 whitespace-nowrap">
                              {article.isHero ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded whitespace-nowrap bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300">
                                  ★ ヒーロー
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          )}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/articles/${article.id}`}
                                title="公開ページを見る"
                                className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/admin/articles/${article.id}/edit`}
                                title="編集"
                                className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(article)}
                                title="削除"
                                className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-muted/20">
              <PenSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-display font-semibold text-base mb-1">
                まだ投稿された記事がありません
              </p>
              <p className="text-sm text-muted-foreground mb-5">
                最初のガジェットレビューを作成して公開しましょう。
              </p>
              <Link
                href="/admin/articles/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                新規記事を作成
              </Link>
            </div>
          )}
        </FadeIn>
      </main>

      <DeleteArticleDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        articleTitle={deleteTarget?.title}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
