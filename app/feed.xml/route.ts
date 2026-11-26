import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isImageThumbnail, sanitizeThumbnail, serializeArticle } from '@/lib/article-utils';
import {
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  stripMarkdownToPlainText,
  toAbsoluteUrl,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function guessMimeType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const feedUrl = `${siteUrl}/feed.xml`;

  try {
    const rawArticles = await prisma.article.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 30,
    });

    const articles = rawArticles.map(serializeArticle);
    const lastBuildDate = articles[0]?.updatedAt
      ? new Date(articles[0].updatedAt).toUTCString()
      : new Date().toUTCString();

    const itemsXml = articles
      .map((article) => {
        const link = `${siteUrl}/articles/${article.id}`;
        const description =
          article.summary?.trim() ||
          stripMarkdownToPlainText(article.content, 180) ||
          `${article.title}の実機レビュー・評価・スペック詳細です。`;
        const pubDate = new Date(article.publishedAt).toUTCString();
        const safeThumb = sanitizeThumbnail(article.thumbnail);
        const enclosureXml =
          article.visibility.thumbnail && isImageThumbnail(safeThumb)
            ? `\n      <enclosure url="${escapeXml(toAbsoluteUrl(safeThumb))}" length="0" type="${guessMimeType(safeThumb)}" />`
            : '';

        return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <category>${escapeXml(article.category)}</category>
      <description>${escapeXml(description)}</description>${enclosureXml}
    </item>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${SITE_NAME} | 最新ガジェットレビュー・比較オウンドメディア`)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>
`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
      },
    });
  } catch (err) {
    console.error('GET /feed.xml error:', err);
    return new NextResponse('Failed to generate RSS feed', { status: 500 });
  }
}
