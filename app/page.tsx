import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { CATEGORIES, serializeArticle } from '@/lib/article-utils';
import { buildAlternates, buildHomeGraphJsonLd } from '@/lib/seo';
import HomeContent from '@/components/home-content';
import JsonLd from '@/components/json-ld';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES = new Set<string>(CATEGORIES);

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const category = params?.category;
  const search = params?.search?.trim();

  if (search) {
    const title = `「${search}」の検索結果 | GadgetPress`;
    const description = `GadgetPress で「${search}」に関する最新ガジェットレビュー・比較記事の検索結果を表示します。`;
    return {
      title: { absolute: title },
      description,
      alternates: buildAlternates('/'),
      robots: { index: false, follow: true },
      openGraph: { title, description, url: '/', images: ['/og-image.png'] },
      twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
    };
  }

  if (category && VALID_CATEGORIES.has(category)) {
    const canonical = `/?category=${encodeURIComponent(category)}`;
    const title = `${category}のガジェットレビュー・比較一覧 | GadgetPress`;
    const description = `GadgetPress 編集部による「${category}」カテゴリの最新ガジェット実機レビュー・評価・比較記事一覧です。`;
    return {
      title: { absolute: title },
      description,
      alternates: buildAlternates(canonical),
      openGraph: { title, description, url: canonical, images: ['/og-image.png'] },
      twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
    };
  }

  const title = 'GadgetPress | 最新ガジェットレビュー・比較オウンドメディア';
  const description =
    'PC・スマートフォン・デスク環境・オーディオなど、最新ガジェットを実機検証と独自スコアで深掘りレビューするテックオウンドメディア。';
  return {
    title,
    description,
    alternates: buildAlternates('/'),
    openGraph: { title, description, url: '/', images: ['/og-image.png'] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const initialCategory = params?.category || 'すべて';
  const initialSearch = params?.search || '';

  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: 'desc' },
  });

  const serialized = articles.map(serializeArticle);
  const schemaCategory = VALID_CATEGORIES.has(initialCategory) ? initialCategory : undefined;
  const schemaArticles = schemaCategory
    ? serialized.filter((a) => a.category === schemaCategory)
    : serialized;

  return (
    <>
      <JsonLd data={buildHomeGraphJsonLd(schemaArticles, schemaCategory)} />
      <HomeContent
        initialArticles={serialized}
        initialCategory={initialCategory}
        initialSearch={initialSearch}
      />
    </>
  );
}
