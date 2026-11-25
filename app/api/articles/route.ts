export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { normalizeVisibility, sanitizeExternalUrl, sanitizeThumbnail, serializeArticle } from '@/lib/article-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.trim().toLowerCase() ?? '';
    const sort = searchParams.get('sort') || 'latest';

    const where: Record<string, unknown> = {};
    if (category && category !== 'すべて') {
      where.category = category;
    }

    const orderBy =
      sort === 'score'
        ? [{ score: 'desc' as const }, { publishedAt: 'desc' as const }]
        : [{ publishedAt: 'desc' as const }];

    const articles = await prisma.article.findMany({
      where,
      orderBy,
    });

    let serialized = articles.map(serializeArticle);

    if (search) {
      serialized = serialized.filter((a) => {
        const haystack = [
          a.title,
          a.summary ?? '',
          a.category,
          a.author,
          a.content ?? '',
          Object.entries(a.specs)
            .map(([k, v]) => `${k} ${v}`)
            .join(' '),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(search);
      });
    }

    return NextResponse.json(serialized);
  } catch (err) {
    console.error('GET /api/articles error:', err);
    return NextResponse.json({ error: '記事の取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; name?: string | null; role?: string } | undefined;
    if (!user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const body = await request.json();
    if (!body?.title || !String(body.title).trim()) {
      return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 });
    }

    // Only admin can promote an article to the global Hero spotlight
    const isAdmin = user.role === 'admin';
    const isHero = isAdmin ? Boolean(body.isHero) : false;
    if (isHero) {
      await prisma.article.updateMany({
        where: { isHero: true },
        data: { isHero: false },
      });
    }

    const article = await prisma.article.create({
      data: {
        title: String(body.title).trim().slice(0, 200),
        category: String(body.category || 'レビュー'),
        thumbnail: sanitizeThumbnail(body.thumbnail),
        score: Math.min(5, Math.max(1, Number(body.score) || 4.0)),
        summary: body.summary ? String(body.summary) : '',
        content: body.content ? String(body.content) : '',
        pros: JSON.stringify(Array.isArray(body.pros) ? body.pros.map(String) : []),
        cons: JSON.stringify(Array.isArray(body.cons) ? body.cons.map(String) : []),
        specs: JSON.stringify(body.specs && typeof body.specs === 'object' ? body.specs : {}),
        ratings: JSON.stringify(body.ratings && typeof body.ratings === 'object' ? body.ratings : {}),
        visibility: JSON.stringify(normalizeVisibility(body.visibility)),
        author: body.author ? String(body.author).trim().slice(0, 100) : user.name || 'GadgetPress 編集部',
        userId: user.id,
        priceRange: body.priceRange ? String(body.priceRange).trim().slice(0, 80) : null,
        amazonUrl: sanitizeExternalUrl(body.amazonUrl),
        officialUrl: sanitizeExternalUrl(body.officialUrl),
        isHero,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
      },
    });

    return NextResponse.json(serializeArticle(article));
  } catch (err) {
    console.error('POST /api/articles error:', err);
    return NextResponse.json({ error: '記事の作成に失敗しました' }, { status: 500 });
  }
}
