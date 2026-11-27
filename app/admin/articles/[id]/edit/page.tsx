import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { canManageArticle, serializeArticle } from '@/lib/article-utils';
import ArticleForm from '../../../_components/article-form';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const articleId = parseInt(id, 10);
  const raw = Number.isNaN(articleId)
    ? null
    : await prisma.article.findUnique({ where: { id: articleId }, select: { title: true } });

  return {
    title: raw ? `記事を編集: ${raw.title}` : '記事を編集',
    description: 'GadgetPress のレビュー記事内容や表示設定を編集します。',
    robots: { index: false, follow: false },
  };
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as { id?: string; name?: string | null; role?: string } | undefined;
  if (!user?.id) {
    redirect('/login');
  }
  if (user.role !== 'admin') {
    redirect('/');
  }

  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (Number.isNaN(articleId)) notFound();

  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) notFound();

  if (!canManageArticle(user, article)) {
    redirect('/admin');
  }

  return (
    <ArticleForm
      article={serializeArticle(article)}
      defaultAuthor={user.name || 'GadgetPress 編集部'}
      isAdmin={user.role === 'admin'}
    />
  );
}
