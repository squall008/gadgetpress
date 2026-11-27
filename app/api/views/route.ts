export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BOT_UA_PATTERN =
  /bot|crawler|spider|slurp|mediapartners|facebookexternalhit|twitterbot|slackbot|discordbot|whatsapp|line-poker|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|statuscake|curl|wget|python-requests|go-http-client|headlesschrome|playwright|puppeteer/i;

function normalizeTrackedPath(raw: unknown): { path: string; articleId: number | null } | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().split('?')[0].split('#')[0];
  if (trimmed === '/' || trimmed === '/ranking' || trimmed === '/about') {
    return { path: trimmed, articleId: null };
  }
  const match = trimmed.match(/^\/articles\/([1-9]\d{0,8})$/);
  if (match) {
    const id = parseInt(match[1], 10);
    if (!Number.isNaN(id) && id > 0) {
      return { path: `/articles/${id}`, articleId: id };
    }
  }
  return null;
}

function getJstDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export async function POST(request: Request) {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (!ua || BOT_UA_PATTERN.test(ua)) {
      return NextResponse.json({ counted: false, reason: 'bot' });
    }

    const body = await request.json().catch(() => null);
    const parsed = normalizeTrackedPath(body?.path);
    if (!parsed) {
      return NextResponse.json({ counted: false, reason: 'ignored_path' });
    }

    const todayJst = getJstDateString();

    if (parsed.articleId !== null) {
      const updated = await prisma.article.updateMany({
        where: { id: parsed.articleId },
        data: { views: { increment: 1 } },
      });
      if (updated.count === 0) {
        return NextResponse.json({ counted: false, reason: 'not_found' });
      }
    }

    await prisma.dailyPageView.upsert({
      where: {
        date_path: {
          date: todayJst,
          path: parsed.path,
        },
      },
      update: {
        views: { increment: 1 },
      },
      create: {
        date: todayJst,
        path: parsed.path,
        views: 1,
      },
    });

    return NextResponse.json({ counted: true });
  } catch (err) {
    console.error('POST /api/views error:', err);
    return NextResponse.json({ counted: false }, { status: 200 });
  }
}
