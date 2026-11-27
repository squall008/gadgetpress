import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { serializeArticle } from '@/lib/article-utils';
import AdminContent, { DailyViewPoint, TrafficSummary } from './_components/admin-content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '記事管理コンソール',
  description: 'GadgetPress の記事一覧・作成・編集・削除・アクセス数確認を行う管理ページです。',
  robots: { index: false, follow: false },
};

function formatJstDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getLastNDatesJst(days: number): string[] {
  const now = new Date();
  const result: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    result.push(formatJstDate(d));
  }
  return result;
}

export default async function AdminPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) {
    redirect('/login?callbackUrl=/admin');
  }
  if (user.role !== 'admin') {
    redirect('/');
  }

  const last7Dates = getLastNDatesJst(7);
  const last30Start = getLastNDatesJst(30)[0];
  const todayJst = last7Dates[last7Dates.length - 1];

  const [articles, totalAgg, last30Rows] = await Promise.all([
    prisma.article.findMany({
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.dailyPageView.aggregate({
      _sum: { views: true },
    }),
    prisma.dailyPageView.groupBy({
      by: ['date'],
      where: { date: { gte: last30Start } },
      _sum: { views: true },
    }),
  ]);

  const byDate = new Map<string, number>();
  let last30DaysViews = 0;
  for (const row of last30Rows) {
    const v = row._sum.views ?? 0;
    byDate.set(row.date, v);
    last30DaysViews += v;
  }

  const dailySeries: DailyViewPoint[] = last7Dates.map((date) => ({
    date,
    label: date.slice(5).replace('-', '/'),
    views: byDate.get(date) ?? 0,
  }));

  const last7DaysViews = dailySeries.reduce((acc, d) => acc + d.views, 0);
  const todayViews = byDate.get(todayJst) ?? 0;
  const totalViews = totalAgg._sum.views ?? 0;

  const traffic: TrafficSummary = {
    todayViews,
    last7DaysViews,
    last30DaysViews,
    totalViews,
    dailySeries,
  };

  return (
    <AdminContent
      initialArticles={articles.map(serializeArticle)}
      traffic={traffic}
      isAdmin={true}
    />
  );
}
