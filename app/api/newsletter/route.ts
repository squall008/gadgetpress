export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? '').trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'すでにニュースレターにご登録いただいています', alreadySubscribed: true });
    }

    await prisma.newsletterSubscriber.create({ data: { email } });
    return NextResponse.json({ message: 'ニュースレターへの登録が完了しました！', alreadySubscribed: false });
  } catch (err) {
    console.error('POST /api/newsletter error:', err);
    return NextResponse.json({ error: '登録処理に失敗しました。時間をおいて再度お試しください' }, { status: 500 });
  }
}
