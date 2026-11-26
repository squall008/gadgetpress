import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import {
  canManageArticle,
  isImageThumbnail,
  sanitizeThumbnail,
  serializeArticle,
} from '@/lib/article-utils';
import { buildAlternates, buildArticleGraphJsonLd, stripMarkdownToPlainText } from '@/lib/seo';
import JsonLd from '@/components/json-ld';
import ArticleDetail from './_components/article-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (Number.isNaN(articleId)) {
    return { title: '記事が見つかりません', robots: { index: false, follow: false } };
  }

  const raw = await prisma.article.findUnique({ where: { id: articleId } });
  if (!raw) {
    return { title: '記事が見つかりません', robots: { index: false, follow: false } };
  }

  const article = serializeArticle(raw);
  const plainBody = stripMarkdownToPlainText(article.content, 155);
  const description =
    article.summary?.trim() ||
    (plainBody || `${article.title}の実機レビュー・評価・スペック詳細です。`);

  const safeThumb = sanitizeThumbnail(article.thumbnail);
  const ogImage =
    article.visibility.thumbnail && isImageThumbnail(safeThumb) ? safeThumb : '/og-image.png';
  const canonical = `/articles/${article.id}`;

  return {
    title: article.title,
    description,
    alternates: buildAlternates(canonical),
    openGraph: {
      type: 'article',
      locale: 'ja_JP',
      siteName: 'GadgetPress',
      url: canonical,
      title: `${article.title} | GadgetPress`,
      description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      section: article.category,
      authors: article.visibility.author ? [article.author] : undefined,
      images: [
        {
          url: ogImage,
          alt: `${article.title}の商品写真`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | GadgetPress`,
      description,
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (Number.isNaN(articleId)) notFound();

  const [article, session] = await Promise.all([
    prisma.article.findUnique({ where: { id: articleId } }),
    auth(),
  ]);
  if (!article) notFound();

  const sessionUser = session?.user as { id?: string; role?: string } | undefined;
  const canEdit = canManageArticle(sessionUser, article);

  // First fetch same-category related articles, then backfill with high-score articles if < 3
  const sameCategory = await prisma.article.findMany({
    where: { category: article.category, NOT: { id: article.id } },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  });

  let relatedRaw = [...sameCategory];
  if (relatedRaw.length < 3) {
    const excludeIds = [article.id, ...relatedRaw.map((a) => a.id)];
    const fallback = await prisma.article.findMany({
      where: { id: { notIn: excludeIds } },
      take: 3 - relatedRaw.length,
      orderBy: [{ score: 'desc' }, { publishedAt: 'desc' }],
    });
    relatedRaw = [...relatedRaw, ...fallback];
  }

  const serializedArticle = serializeArticle(article);

  return (
    <>
      <JsonLd data={buildArticleGraphJsonLd(serializedArticle)} />
      <ArticleDetail
        article={serializedArticle}
        related={relatedRaw.map(serializeArticle)}
        canEdit={canEdit}
      />
    </>
  );
}
