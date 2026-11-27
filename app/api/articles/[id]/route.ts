export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import {
  canManageArticle,
  isValidCategory,
  normalizeVisibility,
  parseBoundedScore,
  parsePositiveIntId,
  sanitizeExternalUrl,
  sanitizeRatingRecord,
  sanitizeStringRecord,
  sanitizeThumbnail,
  serializeArticle,
} from '@/lib/article-utils';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const articleId = parsePositiveIntId(id);
    if (articleId === null) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      return NextResponse.json({ error: '記事が見つかりません' }, { status: 404 });
    }
    return NextResponse.json(serializeArticle(article));
  } catch (err) {
    console.error('GET /api/articles/[id] error:', err);
    return NextResponse.json({ error: '記事の取得に失敗しました' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { id } = await params;
    const articleId = parsePositiveIntId(id);
    if (articleId === null) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

    const existing = await prisma.article.findUnique({ where: { id: articleId } });
    if (!existing) {
      return NextResponse.json({ error: '記事が見つかりません' }, { status: 404 });
    }

    if (!canManageArticle(user, existing)) {
      return NextResponse.json({ error: 'この記事を編集する権限がありません' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
    }
    if (!body.title || !String(body.title).trim()) {
      return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 });
    }

    const category = body.category === undefined || body.category === '' ? existing.category : String(body.category);
    if (!isValidCategory(category)) {
      return NextResponse.json({ error: '無効なカテゴリです' }, { status: 400 });
    }

    let publishedAt: Date | undefined;
    if (body.publishedAt !== undefined && body.publishedAt !== null && body.publishedAt !== '') {
      const parsedDate = new Date(body.publishedAt);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: '公開日時の形式が不正です' }, { status: 400 });
      }
      publishedAt = parsedDate;
    }

    const isAdmin = user.role === 'admin';
    const isHero = isAdmin ? Boolean(body.isHero) : existing.isHero;

    const article = await prisma.$transaction(async (tx) => {
      if (isAdmin && isHero) {
        await tx.article.updateMany({
          where: { isHero: true, NOT: { id: articleId } },
          data: { isHero: false },
        });
      }
      return tx.article.update({
        where: { id: articleId },
        data: {
          title: String(body.title).trim().slice(0, 200),
          category,
          thumbnail: sanitizeThumbnail(body.thumbnail),
          score: parseBoundedScore(body.score, existing.score),
          summary: body.summary ? String(body.summary) : '',
          content: body.content ? String(body.content) : '',
          pros: JSON.stringify(Array.isArray(body.pros) ? body.pros.map(String) : []),
          cons: JSON.stringify(Array.isArray(body.cons) ? body.cons.map(String) : []),
          specs: JSON.stringify(sanitizeStringRecord(body.specs)),
          ratings: JSON.stringify(sanitizeRatingRecord(body.ratings)),
          visibility: body.visibility
            ? JSON.stringify(normalizeVisibility(body.visibility))
            : existing.visibility,
          author: body.author ? String(body.author).trim().slice(0, 100) : existing.author,
          priceRange: body.priceRange ? String(body.priceRange).trim().slice(0, 80) : null,
          amazonUrl: sanitizeExternalUrl(body.amazonUrl) || null,
          officialUrl: sanitizeExternalUrl(body.officialUrl) || null,
          isHero,
          publishedAt,
        },
      });
    });

    return NextResponse.json(serializeArticle(article));
  } catch (err) {
    console.error('PUT /api/articles/[id] error:', err);
    return NextResponse.json({ error: '記事の更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { id } = await params;
    const articleId = parsePositiveIntId(id);
    if (articleId === null) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

    const existing = await prisma.article.findUnique({ where: { id: articleId } });
    if (!existing) {
      return NextResponse.json({ error: '記事が見つかりません' }, { status: 404 });
    }

    if (!canManageArticle(user, existing)) {
      return NextResponse.json({ error: 'この記事を削除する権限がありません' }, { status: 403 });
    }

    await prisma.article.delete({ where: { id: articleId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/articles/[id] error:', err);
    return NextResponse.json({ error: '記事の削除に失敗しました' }, { status: 500 });
  }
}
