import { ArticleDTO, isImageThumbnail, sanitizeThumbnail } from '@/lib/article-utils';

export const SITE_NAME = 'GadgetPress';
export const SITE_DESCRIPTION =
  'PC・スマートフォン・デスク環境・オーディオなど、最新ガジェットを実機検証と独自スコアで深掘りレビューするテックオウンドメディア。';

export const RSS_ALTERNATE_TYPES = {
  'application/rss+xml': [
    { url: '/feed.xml', title: 'GadgetPress 最新ガジェットレビュー RSS' },
  ],
};

export function buildAlternates(canonical: string) {
  return {
    canonical,
    types: RSS_ALTERNATE_TYPES,
  };
}

export function getSiteUrl(): string {
  return (
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    'http://localhost:3000'
  ).replace(/\/+$/, '');
}

export function toAbsoluteUrl(pathOrUrl: string): string {
  const trimmed = (pathOrUrl || '').trim();
  if (!trimmed) return getSiteUrl();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${getSiteUrl()}${normalized}`;
}

/**
 * Safely serialize JSON-LD for embedding inside <script type="application/ld+json">.
 * Escapes `<`, `>`, `&`, and Unicode line separators so user-authored text can never break out of the script tag.
 */
export function safeJsonLdStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function stripMarkdownToPlainText(content?: string | null, maxLength = 155): string {
  if (!content) return '';
  const plain = content
    .replace(/[#*_`>\-\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength - 1).trim()}…`;
}

export function extractProductNameFromTitle(title: string): string {
  return (
    title
      .replace(/\s*(徹底|長期|実機)?レビュー.*$/u, '')
      .replace(/[｜|].*$/u, '')
      .trim() || title
  );
}

export function buildOrganizationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    logo: {
      '@type': 'ImageObject',
      url: toAbsoluteUrl('/icon-512.png'),
      width: 512,
      height: 512,
    },
  };
}

export function buildWebSiteJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    inLanguage: 'ja',
    publisher: { '@id': `${siteUrl}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

export function buildHomeGraphJsonLd(articles: ArticleDTO[], category?: string) {
  const siteUrl = getSiteUrl();
  const isFiltered = Boolean(category && category !== 'すべて');
  const pageUrl = isFiltered
    ? `${siteUrl}/?category=${encodeURIComponent(category!)}`
    : `${siteUrl}/`;

  const graph: Record<string, unknown>[] = [
    buildOrganizationJsonLd(),
    buildWebSiteJsonLd(),
    {
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: isFiltered
        ? `${category}のガジェットレビュー・比較一覧 | ${SITE_NAME}`
        : `${SITE_NAME} | 最新ガジェットレビュー・比較オウンドメディア`,
      description: SITE_DESCRIPTION,
      inLanguage: 'ja',
      isPartOf: { '@id': `${siteUrl}/#website` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: articles.length,
        itemListElement: articles.slice(0, 20).map((a, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: toAbsoluteUrl(`/articles/${a.id}`),
          name: a.title,
        })),
      },
    },
  ];

  if (isFiltered && category) {
    graph.push(
      buildBreadcrumbJsonLd([
        { name: 'ホーム', path: '/' },
        { name: category, path: `/?category=${encodeURIComponent(category)}` },
      ])
    );
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export function buildArticleGraphJsonLd(article: ArticleDTO) {
  const siteUrl = getSiteUrl();
  const articleUrl = toAbsoluteUrl(`/articles/${article.id}`);
  const safeThumb = sanitizeThumbnail(article.thumbnail);
  const imageUrl =
    article.visibility.thumbnail && isImageThumbnail(safeThumb)
      ? toAbsoluteUrl(safeThumb)
      : toAbsoluteUrl('/og-image.png');

  const description =
    article.summary?.trim() ||
    stripMarkdownToPlainText(article.content, 155) ||
    `${article.title}の実機レビュー・評価・スペック詳細です。`;

  const authorNode =
    article.visibility.author && article.author && article.author !== 'GadgetPress 編集部'
      ? { '@type': 'Person', name: article.author }
      : { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: SITE_NAME };

  const wordCount = (article.content || '').replace(/\s+/g, '').length;

  const articleNode: Record<string, unknown> = {
    '@type': 'Article',
    '@id': `${articleUrl}#article`,
    headline: article.title,
    description,
    image: [imageUrl],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    inLanguage: 'ja',
    articleSection: article.category,
    author: authorNode,
    publisher: { '@id': `${siteUrl}/#organization` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  };
  if (wordCount > 0) {
    articleNode.wordCount = wordCount;
  }

  const graph: Record<string, unknown>[] = [
    buildOrganizationJsonLd(),
    articleNode,
    buildBreadcrumbJsonLd([
      { name: 'ホーム', path: '/' },
      { name: article.category, path: `/?category=${encodeURIComponent(article.category)}` },
      { name: article.title, path: `/articles/${article.id}` },
    ]),
  ];

  // Emit Google-compliant Product Review rich result only for single-product scored reviews
  // (exclude multi-product comparison pages so schema strictly matches single-item review guidelines).
  const isSingleProductReview =
    article.visibility.score &&
    article.category !== '比較' &&
    typeof article.score === 'number' &&
    article.score >= 1 &&
    article.score <= 5;

  if (isSingleProductReview) {
    const productName = extractProductNameFromTitle(article.title);
    const reviewNode: Record<string, unknown> = {
      '@type': 'Review',
      '@id': `${articleUrl}#review`,
      name: article.title,
      reviewBody: description,
      datePublished: article.publishedAt,
      inLanguage: 'ja',
      author: authorNode,
      publisher: { '@id': `${siteUrl}/#organization` },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: Number(article.score.toFixed(1)),
        bestRating: 5,
        worstRating: 1,
      },
      itemReviewed: {
        '@type': 'Product',
        name: productName,
        image: [imageUrl],
        category: article.category,
        description,
      },
    };

    if (article.visibility.pros && article.pros.length > 0) {
      reviewNode.positiveNotes = {
        '@type': 'ItemList',
        itemListElement: article.pros.map((note, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: note,
        })),
      };
    }

    if (article.visibility.cons && article.cons.length > 0) {
      reviewNode.negativeNotes = {
        '@type': 'ItemList',
        itemListElement: article.cons.map((note, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: note,
        })),
      };
    }

    graph.push(reviewNode);
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export function buildRankingGraphJsonLd(articles: ArticleDTO[]) {
  const siteUrl = getSiteUrl();
  const rankingUrl = `${siteUrl}/ranking`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildOrganizationJsonLd(),
      {
        '@type': 'CollectionPage',
        '@id': `${rankingUrl}#webpage`,
        url: rankingUrl,
        name: `スコアランキング・スペック比較 | ${SITE_NAME}`,
        description:
          'GadgetPress編集部の実機スコアランキングと、気になるガジェット同士のスペック比較ツール。',
        inLanguage: 'ja',
        isPartOf: { '@id': `${siteUrl}/#website` },
        mainEntity: {
          '@type': 'ItemList',
          name: 'GadgetPress ガジェットスコアランキング',
          itemListOrder: 'https://schema.org/ItemListOrderDescending',
          numberOfItems: articles.length,
          itemListElement: articles.map((a, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: toAbsoluteUrl(`/articles/${a.id}`),
            name: a.title,
          })),
        },
      },
      buildBreadcrumbJsonLd([
        { name: 'ホーム', path: '/' },
        { name: 'スコアランキング・スペック比較', path: '/ranking' },
      ]),
    ],
  };
}

export function buildAboutGraphJsonLd() {
  const siteUrl = getSiteUrl();
  const aboutUrl = `${siteUrl}/about`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildOrganizationJsonLd(),
      {
        '@type': 'AboutPage',
        '@id': `${aboutUrl}#webpage`,
        url: aboutUrl,
        name: `GadgetPressについて・編集方針 | ${SITE_NAME}`,
        description:
          'GadgetPressのメディア理念、実機テストプロセス、および5段階評価スコアの明確な基準をご紹介します。',
        inLanguage: 'ja',
        mainEntity: { '@id': `${siteUrl}/#organization` },
      },
      buildBreadcrumbJsonLd([
        { name: 'ホーム', path: '/' },
        { name: 'GadgetPressについて・編集方針', path: '/about' },
      ]),
    ],
  };
}
