import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { CATEGORIES } from '@/lib/article-utils';
import { getSiteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ranking`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...CATEGORIES.map((category) => ({
      url: `${baseUrl}/?category=${encodeURIComponent(category)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];

  try {
    const articles = await prisma.article.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });

    const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${baseUrl}/articles/${article.id}`,
      lastModified: article.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...articleRoutes];
  } catch {
    return staticRoutes;
  }
}
