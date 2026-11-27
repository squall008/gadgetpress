import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { parsePositiveIntId, serializeArticle } from '@/lib/article-utils';
import { buildAlternates, buildRankingGraphJsonLd } from '@/lib/seo';
import JsonLd from '@/components/json-ld';
import RankingClient from './_components/ranking-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'スコアランキング・スペック比較',
  description: 'GadgetPress編集部の実機スコアランキングと、気になるガジェット同士のスペック比較ツール。',
  alternates: buildAlternates('/ranking'),
  openGraph: {
    title: 'スコアランキング・スペック比較 | GadgetPress',
    description: 'GadgetPress編集部の実機スコアランキングと、気になるガジェット同士のスペック比較ツール。',
    url: '/ranking',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'スコアランキング・スペック比較 | GadgetPress',
    description: 'GadgetPress編集部の実機スコアランキングと、気になるガジェット同士のスペック比較ツール。',
    images: ['/og-image.png'],
  },
};

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ compare?: string }>;
}) {
  const params = await searchParams;
  const compareId = parsePositiveIntId(params?.compare) ?? undefined;

  const articles = await prisma.article.findMany({
    orderBy: [{ score: 'desc' }, { publishedAt: 'desc' }],
  });

  const serialized = articles.map(serializeArticle);

  return (
    <>
      <JsonLd data={buildRankingGraphJsonLd(serialized)} />
      <RankingClient
        key={compareId ?? 'default'}
        articles={serialized}
        initialCompareId={compareId}
      />
    </>
  );
}
