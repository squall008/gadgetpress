'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import ArticleThumbnail from '@/components/article-thumbnail';
import DeleteArticleDialog from '@/components/delete-article-dialog';
import { Switch } from '@/components/ui/switch';
import { FadeIn } from '@/components/ui/animate';
import {
  ArticleDTO,
  ArticleVisibility,
  CATEGORIES,
  DEFAULT_VISIBILITY,
  PRESET_IMAGES,
  parseBoundedScore,
} from '@/lib/article-utils';
import {
  Save,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Smile,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

const emojiOptions = ['💻', '📱', '🖥️', '🎧', '⌨️', '📊', '📡', '🎮', '⚙️', '📷'];

const VISIBILITY_ITEMS: { key: keyof ArticleVisibility; label: string }[] = [
  { key: 'thumbnail', label: 'カバー画像' },
  { key: 'score', label: '総合スコア' },
  { key: 'ratings', label: '項目別スコア' },
  { key: 'priceRange', label: '参考価格' },
  { key: 'author', label: '執筆者' },
  { key: 'summary', label: 'リード文・概要' },
  { key: 'pros', label: '良い点' },
  { key: 'cons', label: '気になる点' },
  { key: 'specs', label: '製品スペック' },
  { key: 'links', label: '購入・公式リンク' },
  { key: 'toc', label: '目次' },
  { key: 'content', label: '記事本文' },
];

interface VisibilityBlockProps {
  label: string;
  hint?: string;
  visible: boolean;
  onToggle: (next: boolean) => void;
  extraHeader?: React.ReactNode;
  children: React.ReactNode;
}

function VisibilityBlock({
  label,
  hint,
  visible,
  onToggle,
  extraHeader,
  children,
}: VisibilityBlockProps) {
  return (
    <div
      className={`rounded-xl border transition-colors ${
        visible
          ? 'border-border bg-card'
          : 'border-dashed border-border/70 bg-muted/25'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-border/50 last:border-b-0">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          {visible ? (
            <Eye className="w-4 h-4 text-[#00b4d8] dark:text-[#00d4ff] shrink-0 mt-0.5 sm:mt-0" />
          ) : (
            <EyeOff className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 sm:mt-0" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">{label}</span>
              <span
                className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${
                  visible
                    ? 'bg-[#00b4d8]/15 text-[#0077b6] dark:text-[#00d4ff]'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {visible ? '表示' : '非表示'}
              </span>
            </div>
            {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 shrink-0">
          {visible && extraHeader}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none ml-auto sm:ml-0">
            <span className="text-xs text-muted-foreground">{visible ? '表示中' : '非表示'}</span>
            <Switch
              checked={visible}
              onCheckedChange={onToggle}
              aria-label={`${label}の表示切り替え`}
            />
          </label>
        </div>
      </div>

      {visible ? (
        <div className="p-4 pt-3.5">{children}</div>
      ) : (
        <div className="px-4 py-2.5 text-xs text-muted-foreground">
          この項目は現在非表示に設定されています（保存内容は保持され、公開ページには表示されません）。
        </div>
      )}
    </div>
  );
}

interface ArticleFormProps {
  article?: ArticleDTO;
  defaultAuthor?: string;
  isAdmin?: boolean;
}

export default function ArticleForm({
  article,
  defaultAuthor = 'GadgetPress 編集部',
  isAdmin = false,
}: ArticleFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(article?.id);

  const [title, setTitle] = useState(article?.title ?? '');
  const [category, setCategory] = useState(article?.category ?? 'PC');
  const [thumbnail, setThumbnail] = useState(
    article?.thumbnail ?? '/images/articles/macbook-pro-14.jpg'
  );
  const [thumbMode, setThumbMode] = useState<'image' | 'emoji'>(
    article?.thumbnail && !article.thumbnail.startsWith('/') && !article.thumbnail.startsWith('http')
      ? 'emoji'
      : 'image'
  );
  const [uploading, setUploading] = useState(false);
  const [score, setScore] = useState(String(article?.score ?? '4.5'));
  const [author, setAuthor] = useState(article?.author ?? defaultAuthor);
  const [priceRange, setPriceRange] = useState(article?.priceRange ?? '');
  const [summary, setSummary] = useState(article?.summary ?? '');
  const [content, setContent] = useState(article?.content ?? '');
  const [prosText, setProsText] = useState((article?.pros ?? []).join('\n'));
  const [consText, setConsText] = useState((article?.cons ?? []).join('\n'));
  const [specsText, setSpecsText] = useState(
    Object.entries(article?.specs ?? {})
      .map(([k, v]) => `${k}:${v}`)
      .join('\n')
  );
  const [ratingsText, setRatingsText] = useState(
    Object.entries(
      article?.ratings && Object.keys(article.ratings).length > 0
        ? article.ratings
        : { 'デザイン・質感': 4.5, 'パフォーマンス': 4.5, '使い勝手': 4.5, 'コストパフォーマンス': 4.2 }
    )
      .map(([k, v]) => `${k}:${v}`)
      .join('\n')
  );
  const [amazonUrl, setAmazonUrl] = useState(article?.amazonUrl ?? '');
  const [officialUrl, setOfficialUrl] = useState(article?.officialUrl ?? '');
  const [isHero, setIsHero] = useState(article?.isHero ?? false);
  const [visibility, setVisibility] = useState<ArticleVisibility>(
    article?.visibility ? { ...DEFAULT_VISIBILITY, ...article.visibility } : { ...DEFAULT_VISIBILITY }
  );
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const setFieldVisible = (key: keyof ArticleVisibility, next: boolean) => {
    setVisibility((prev) => ({ ...prev, [key]: next }));
  };

  const setAllVisible = (next: boolean) => {
    const updated = { ...DEFAULT_VISIBILITY };
    (Object.keys(updated) as (keyof ArticleVisibility)[]).forEach((k) => {
      updated[k] = next;
    });
    setVisibility(updated);
  };

  const visibleCount = Object.values(visibility).filter(Boolean).length;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.url) {
        setThumbnail(data.url);
        setThumbMode('image');
        setFieldVisible('thumbnail', true);
        toast.success('画像をアップロードしました');
      } else {
        toast.error(data?.error || 'アップロードに失敗しました');
      }
    } catch {
      toast.error('アップロードに失敗しました');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!article?.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/articles/${article.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('記事を削除しました');
        setDeleteOpen(false);
        router.push('/admin');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }
    setLoading(true);

    const pros = prosText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const cons = consText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const specs: Record<string, string> = {};
    specsText.split('\n').forEach((line) => {
      const idx = line.search(/[:：]/);
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        if (key) specs[key] = val;
      }
    });

    const ratings: Record<string, number> = {};
    ratingsText.split('\n').forEach((line) => {
      const idx = line.search(/[:：]/);
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = parseFloat(line.slice(idx + 1).trim());
        if (key && Number.isFinite(val)) ratings[key] = Math.round(Math.min(5, Math.max(1, val)) * 10) / 10;
      }
    });

    const body = {
      title: title.trim(),
      category,
      thumbnail: thumbnail.trim() || '📱',
      score: parseBoundedScore(score, 4.0),
      author: author.trim() || defaultAuthor,
      priceRange: priceRange.trim() || null,
      summary,
      content,
      pros,
      cons,
      specs,
      ratings,
      visibility,
      amazonUrl,
      officialUrl,
      isHero: isAdmin ? isHero : false,
    };

    try {
      const url = isEdit ? `/api/articles/${article?.id}` : '/api/articles';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const saved = await res.json();
        toast.success(isEdit ? '記事を更新しました' : '記事を公開しました');
        router.push(saved?.id ? `/articles/${saved.id}` : '/admin');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || '保存に失敗しました');
      }
    } catch {
      toast.error('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-[920px] mx-auto w-full px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          管理一覧へ戻る
        </Link>

        <FadeIn>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#00b4d8] dark:text-[#00d4ff]" />
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {isEdit ? '記事を編集' : '新規記事を投稿'}
              </h1>
            </div>
            {isEdit && (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                この記事を削除
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Visibility Overview Bar */}
            <div className="rounded-xl border border-border bg-muted/35 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#00b4d8] dark:text-[#00d4ff]" />
                  <span className="text-sm font-semibold">
                    各項目の表示・非表示設定（{visibleCount} / {VISIBILITY_ITEMS.length} 項目を表示中）
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAllVisible(true)}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-card border border-border hover:bg-muted transition-colors"
                  >
                    すべて表示
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllVisible(false)}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-card border border-border hover:bg-muted transition-colors"
                  >
                    すべて非表示
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VISIBILITY_ITEMS.map(({ key, label }) => {
                  const active = visibility[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFieldVisible(key, !active)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-muted-foreground border-border/70 hover:text-foreground'
                      }`}
                    >
                      {active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Required Core Info: Title & Category */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block text-sm font-medium mb-1.5">
                    記事タイトル <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/30"
                    placeholder="例：MacBook Pro 14インチ M3 Pro レビュー"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium mb-1.5">カテゴリ</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-1">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isHero}
                      onChange={(e) => setIsHero(e.target.checked)}
                      className="w-4 h-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm font-medium">
                      トップページの注目ヒーロー記事として表示する
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Individual Toggleable Metadata Fields: Score, Price, Author */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VisibilityBlock
                label="総合スコア"
                visible={visibility.score}
                onToggle={(v) => setFieldVisible('score', v)}
              >
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  min="1"
                  max="5"
                  step="0.1"
                  aria-label="評価スコア（1.0〜5.0）"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-muted rounded-lg border border-transparent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </VisibilityBlock>

              <VisibilityBlock
                label="参考価格"
                visible={visibility.priceRange}
                onToggle={(v) => setFieldVisible('priceRange', v)}
              >
                <input
                  type="text"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  aria-label="参考価格"
                  className="w-full px-3.5 py-2 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="¥49,500前後"
                />
              </VisibilityBlock>

              <VisibilityBlock
                label="執筆者"
                visible={visibility.author}
                onToggle={(v) => setFieldVisible('author', v)}
              >
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  aria-label="執筆者"
                  className="w-full px-3.5 py-2 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </VisibilityBlock>
            </div>

            {/* Cover Image / Thumbnail */}
            <VisibilityBlock
              label="カバー画像 / サムネイル"
              hint="一覧カードと記事上部のメインビジュアル"
              visible={visibility.thumbnail}
              onToggle={(v) => setFieldVisible('thumbnail', v)}
              extraHeader={
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00d4ff]/15 text-[#0077b6] dark:text-[#00d4ff] hover:bg-[#00d4ff]/25 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploading ? 'アップロード中...' : '画像をアップロード'}
                  </button>
                  <div className="inline-flex rounded-lg bg-muted p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setThumbMode('image')}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                        thumbMode === 'image' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      写真
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbMode('emoji')}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                        thumbMode === 'emoji' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                      }`}
                    >
                      <Smile className="w-3.5 h-3.5" />
                      絵文字
                    </button>
                  </div>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                <div className="md:col-span-5">
                  <div className="rounded-lg overflow-hidden border border-border">
                    <ArticleThumbnail
                      thumbnail={thumbnail}
                      alt={title || 'プレビュー'}
                      className="aspect-[16/10] w-full"
                      emojiClassName="text-6xl"
                    />
                  </div>
                </div>
                <div className="md:col-span-7 space-y-3">
                  {thumbMode === 'image' ? (
                    <>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">
                          画像パスまたはURL（アップロードすると自動入力されます）
                        </label>
                        <input
                          type="text"
                          value={thumbnail}
                          onChange={(e) => setThumbnail(e.target.value)}
                          placeholder="/images/articles/macbook-pro-14.jpg"
                          className="w-full px-3 py-2 text-xs font-mono bg-muted rounded-md border border-transparent focus:border-ring focus:outline-none"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">スタジオ写真プリセットから選択:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {PRESET_IMAGES.map((img) => (
                            <button
                              key={img.path}
                              type="button"
                              onClick={() => setThumbnail(img.path)}
                              className={`text-left px-2.5 py-1.5 text-xs rounded-md border transition-colors truncate ${
                                thumbnail === img.path
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-muted/60 border-border/60 hover:bg-muted'
                              }`}
                            >
                              {img.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {emojiOptions.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setThumbnail(e)}
                          className={`text-2xl p-2.5 rounded-lg transition-all ${
                            thumbnail === e ? 'bg-primary/15 ring-2 ring-ring' : 'bg-muted/50 hover:bg-muted'
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </VisibilityBlock>

            {/* Summary */}
            <VisibilityBlock
              label="リード文・概要"
              hint="記事カードやタイトル直下に表示される要約テキスト"
              visible={visibility.summary}
              onToggle={(v) => setFieldVisible('summary', v)}
            >
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 resize-y"
                placeholder="記事一覧カードに表示される要約を入力"
              />
            </VisibilityBlock>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VisibilityBlock
                label="良い点（Pros）"
                hint="改行区切りで箇条書き表示"
                visible={visibility.pros}
                onToggle={(v) => setFieldVisible('pros', v)}
              >
                <textarea
                  value={prosText}
                  onChange={(e) => setProsText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 resize-y"
                  placeholder="良い点を1行ずつ入力"
                />
              </VisibilityBlock>

              <VisibilityBlock
                label="気になる点（Cons）"
                hint="改行区切りで箇条書き表示"
                visible={visibility.cons}
                onToggle={(v) => setFieldVisible('cons', v)}
              >
                <textarea
                  value={consText}
                  onChange={(e) => setConsText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 resize-y"
                  placeholder="気になる点を1行ずつ入力"
                />
              </VisibilityBlock>
            </div>

            {/* Specs & Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VisibilityBlock
                label="製品スペック"
                hint="「項目名:値」形式・改行区切り"
                visible={visibility.specs}
                onToggle={(v) => setFieldVisible('specs', v)}
              >
                <textarea
                  value={specsText}
                  onChange={(e) => setSpecsText(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 resize-y font-mono"
                  placeholder={'プロセッサ:Apple M3 Pro\nメモリ:18GB\n重量:1.61 kg'}
                />
              </VisibilityBlock>

              <VisibilityBlock
                label="項目別スコア内訳"
                hint="「項目名:数値」形式・改行区切り"
                visible={visibility.ratings}
                onToggle={(v) => setFieldVisible('ratings', v)}
              >
                <textarea
                  value={ratingsText}
                  onChange={(e) => setRatingsText(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 resize-y font-mono"
                  placeholder={'デザイン・質感:4.8\nパフォーマンス:4.9\n使い勝手:4.7\nコストパフォーマンス:4.3'}
                />
              </VisibilityBlock>
            </div>

            {/* Purchase & Official Links */}
            <VisibilityBlock
              label="購入・公式サイトリンク"
              hint="記事下部のAmazon・公式サイトボタン枠"
              visible={visibility.links}
              onToggle={(v) => setFieldVisible('links', v)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Amazonリンク
                  </label>
                  <input
                    type="url"
                    value={amazonUrl}
                    onChange={(e) => setAmazonUrl(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                    placeholder="https://www.amazon.co.jp/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    公式サイトリンク
                  </label>
                  <input
                    type="url"
                    value={officialUrl}
                    onChange={(e) => setOfficialUrl(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </VisibilityBlock>

            {/* Table of Contents & Article Body */}
            <VisibilityBlock
              label="目次（TOC）"
              hint="本文の見出し（## / ###）から自動生成される目次ブロック"
              visible={visibility.toc}
              onToggle={(v) => setFieldVisible('toc', v)}
            >
              <p className="text-xs text-muted-foreground">
                記事本文に <code className="font-mono">##</code> または{' '}
                <code className="font-mono">###</code> の見出しが2つ以上含まれる場合、記事詳細ページに目次を自動表示します。
              </p>
            </VisibilityBlock>

            <VisibilityBlock
              label="記事本文（Markdown）"
              hint="## 見出し / ### サブ見出し / - 箇条書き / **太字** に対応"
              visible={visibility.content}
              onToggle={(v) => setFieldVisible('content', v)}
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                className="w-full px-4 py-3 text-sm bg-muted rounded-lg border border-transparent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 resize-y font-mono leading-relaxed"
                placeholder={'## 見出し\n\n### サブ見出し\n\n記事本文を入力...'}
              />
            </VisibilityBlock>

            {/* Submit */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border">
              <div>
                {isEdit && (
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive border border-destructive/30 sm:border-transparent hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    削除する
                  </button>
                )}
              </div>
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                <Link
                  href="/admin"
                  className="px-6 py-2.5 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 transition-colors text-center"
                >
                  キャンセル
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? '保存中...' : isEdit ? '変更を保存' : '記事を公開する'}
                </button>
              </div>
            </div>
          </form>
        </FadeIn>
      </main>

      <DeleteArticleDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteOpen(false);
        }}
        articleTitle={title}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
