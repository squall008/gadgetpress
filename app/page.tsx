import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { serializeArticle } from '@/lib/article-utils';
import HomeContent from '@/components/home-content';

export const dynamic = 'force-dynamic';

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
      robots: { index: false, follow: true },
      openGraph: { title, description, images: ['/og-image.png'] },
      twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
    };
  }

  if (category && category !== 'すべて') {
    const title = `${category}のガジェットレビュー・比較一覧 | GadgetPress`;
    const description = `GadgetPress 編集部による「${category}」カテゴリの最新ガジェット実機レビュー・評価・比較記事一覧です。`;
    return {
      title: { absolute: title },
      description,
      openGraph: { title, description, images: ['/og-image.png'] },
      twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
    };
  }

  const title = 'GadgetPress | 最新ガジェットレビュー・比較オウンドメディア';
  const description =
    'PC・スマートフォン・デスク環境・オーディオなど、最新ガジェットを実機検証と独自スコアで深掘りレビューするテックオウンドメディア。';
  return {
    title,
    description,
    openGraph: { title, description, images: ['/og-image.png'] },
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

  return (
    <HomeContent
      initialArticles={serialized}
      initialCategory={initialCategory}
      initialSearch={initialSearch}
    />
  );
}
