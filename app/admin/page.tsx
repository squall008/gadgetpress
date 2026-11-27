import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { serializeArticle } from '@/lib/article-utils';
import AdminContent from './_components/admin-content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '記事管理コンソール',
  description: 'GadgetPress の記事一覧・作成・編集・削除を行う管理ページです。',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) {
    redirect('/login?callbackUrl=/admin');
  }
  if (user.role !== 'admin') {
    redirect('/');
  }

  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <AdminContent
      initialArticles={articles.map(serializeArticle)}
      isAdmin={true}
    />
  );
}
