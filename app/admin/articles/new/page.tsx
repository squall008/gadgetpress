import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ArticleForm from '../../_components/article-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '新規記事を投稿',
  description: 'GadgetPress に新しいガジェットレビュー記事を作成・公開します。',
  robots: { index: false, follow: false },
};

export default async function NewArticlePage() {
  const session = await auth();
  const user = session?.user as { id?: string; name?: string | null; role?: string } | undefined;
  if (!user?.id) {
    redirect('/login?callbackUrl=/admin/articles/new');
  }
  if (user.role !== 'admin') {
    redirect('/');
  }

  return (
    <ArticleForm
      defaultAuthor={user.name || 'GadgetPress 編集部'}
      isAdmin={true}
    />
  );
}
