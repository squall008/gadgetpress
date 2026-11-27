export interface ArticleVisibility {
  thumbnail: boolean;
  priceRange: boolean;
  author: boolean;
  score: boolean;
  ratings: boolean;
  summary: boolean;
  pros: boolean;
  cons: boolean;
  specs: boolean;
  links: boolean;
  toc: boolean;
  content: boolean;
}

export const DEFAULT_VISIBILITY: ArticleVisibility = {
  thumbnail: true,
  priceRange: true,
  author: true,
  score: true,
  ratings: true,
  summary: true,
  pros: true,
  cons: true,
  specs: true,
  links: true,
  toc: true,
  content: true,
};

export interface ArticleDTO {
  id: number;
  title: string;
  category: string;
  thumbnail: string;
  score: number;
  summary: string | null;
  content: string | null;
  pros: string[];
  cons: string[];
  specs: Record<string, string>;
  ratings: Record<string, number>;
  visibility: ArticleVisibility;
  author: string;
  userId: string | null;
  priceRange: string | null;
  amazonUrl: string | null;
  officialUrl: string | null;
  isHero: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORIES = ['PC', 'スマホ', 'デスク環境', 'レビュー', '比較'] as const;

export const PRESET_IMAGES = [
  { label: 'MacBook Pro 14', path: '/images/articles/macbook-pro-14.jpg' },
  { label: 'ThinkPad X1 Carbon', path: '/images/articles/thinkpad-x1-carbon.jpg' },
  { label: 'iPhone 15 Pro Max', path: '/images/articles/iphone-15-pro-max.jpg' },
  { label: 'Google Pixel 9 Pro', path: '/images/articles/pixel-9-pro.jpg' },
  { label: 'Sony WH-1000XM5', path: '/images/articles/sony-wh1000xm5.jpg' },
  { label: 'Logicool MX Master 3S', path: '/images/articles/mx-master-3s.jpg' },
  { label: 'HHKB Type-S', path: '/images/articles/hhkb-type-s.jpg' },
  { label: 'Dell 4K モニター', path: '/images/articles/dell-4k-monitor.jpg' },
  { label: 'タブレット比較', path: '/images/articles/ipad-vs-surface.jpg' },
  { label: 'イヤホン比較', path: '/images/articles/earbuds-compare.jpg' },
];

export function isImageThumbnail(thumbnail?: string | null): boolean {
  if (!thumbnail) return false;
  const trimmed = thumbnail.trim();
  return trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

export function sanitizeExternalUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return '';
  } catch {
    return '';
  }
}

export function sanitizeThumbnail(thumbnail?: string | null): string {
  if (!thumbnail) return '📱';
  const trimmed = thumbnail.trim();
  if (!trimmed) return '📱';
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return sanitizeExternalUrl(trimmed) || '📱';
  }
  // Reject dangerous URI schemes like javascript:, data:, vbscript:
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return '📱';
  }
  return trimmed.slice(0, 16);
}

function safeParseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return (parsed ?? fallback) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export function normalizeVisibility(raw: unknown): ArticleVisibility {
  const parsed = safeParseJson<Record<string, unknown>>(raw, {});
  const result: ArticleVisibility = { ...DEFAULT_VISIBILITY };
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    (Object.keys(DEFAULT_VISIBILITY) as (keyof ArticleVisibility)[]).forEach((key) => {
      if (typeof parsed[key] === 'boolean') {
        result[key] = parsed[key] as boolean;
      }
    });
  }
  return result;
}

export function serializeArticle(raw: any): ArticleDTO {
  const parsedPros = safeParseJson<unknown>(raw?.pros, []);
  const parsedCons = safeParseJson<unknown>(raw?.cons, []);
  const parsedSpecs = safeParseJson<unknown>(raw?.specs, {});
  const parsedRatings = safeParseJson<unknown>(raw?.ratings, {});

  return {
    id: Number(raw?.id ?? 0),
    title: String(raw?.title ?? ''),
    category: String(raw?.category ?? 'レビュー'),
    thumbnail: String(raw?.thumbnail ?? '📱'),
    score: Number(raw?.score ?? 0),
    summary: raw?.summary ?? null,
    content: raw?.content ?? null,
    pros: Array.isArray(parsedPros) ? parsedPros.map(String) : [],
    cons: Array.isArray(parsedCons) ? parsedCons.map(String) : [],
    specs:
      parsedSpecs && typeof parsedSpecs === 'object' && !Array.isArray(parsedSpecs)
        ? Object.fromEntries(Object.entries(parsedSpecs as Record<string, unknown>).map(([k, v]) => [k, String(v ?? '')]))
        : {},
    ratings:
      parsedRatings && typeof parsedRatings === 'object' && !Array.isArray(parsedRatings)
        ? Object.fromEntries(Object.entries(parsedRatings as Record<string, unknown>).map(([k, v]) => [k, Number(v ?? 0)]))
        : {},
    visibility: normalizeVisibility(raw?.visibility),
    author: String(raw?.author || 'GadgetPress 編集部'),
    userId: raw?.userId ? String(raw.userId) : null,
    priceRange: raw?.priceRange ?? null,
    amazonUrl: raw?.amazonUrl ?? null,
    officialUrl: raw?.officialUrl ?? null,
    isHero: Boolean(raw?.isHero),
    publishedAt: raw?.publishedAt instanceof Date ? raw.publishedAt.toISOString() : String(raw?.publishedAt ?? new Date().toISOString()),
    createdAt: raw?.createdAt instanceof Date ? raw.createdAt.toISOString() : String(raw?.createdAt ?? new Date().toISOString()),
    updatedAt: raw?.updatedAt instanceof Date ? raw.updatedAt.toISOString() : String(raw?.updatedAt ?? new Date().toISOString()),
  };
}

export function estimateReadingTime(content?: string | null): number {
  if (!content) return 2;
  const plain = content.replace(/[#*_`>\-\n\r\s]/g, '');
  return Math.max(2, Math.ceil(plain.length / 450));
}

export interface ArticleHeading {
  id: string;
  level: 2 | 3;
  text: string;
}

export function extractHeadings(content?: string | null): ArticleHeading[] {
  if (!content) return [];
  const headings: ArticleHeading[] = [];
  let idx = 0;
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) {
      headings.push({ id: `section-${idx++}`, level: 3, text: trimmed.slice(4).trim() });
    } else if (trimmed.startsWith('## ')) {
      headings.push({ id: `section-${idx++}`, level: 2, text: trimmed.slice(3).trim() });
    }
  }
  return headings;
}

export function getScoreLabel(score: number): string {
  if (score >= 4.7) return 'EDITORS CHOICE';
  if (score >= 4.5) return 'EXCELLENT';
  if (score >= 4.0) return 'RECOMMENDED';
  return 'GOOD';
}

export function canManageArticle(
  user: { id?: string | null; role?: string | null } | null | undefined,
  _article?: { userId?: string | null } | null | undefined
): boolean {
  return Boolean(user && user.role === 'admin');
}
