import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: '記事管理コンソール',
    template: '%s | GadgetPress 管理',
  },
  description: 'GadgetPress のレビュー記事投稿・編集・管理コンソールです。',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
