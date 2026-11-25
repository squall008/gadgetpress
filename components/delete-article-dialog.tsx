'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleTitle?: string;
  loading?: boolean;
  onConfirm: () => void;
}

export default function DeleteArticleDialog({
  open,
  onOpenChange,
  articleTitle,
  loading = false,
  onConfirm,
}: DeleteArticleDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>記事を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            {articleTitle ? `「${articleTitle}」を完全に削除します。` : 'この記事を完全に削除します。'}
            この操作は元に戻せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? '削除中...' : '削除する'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
