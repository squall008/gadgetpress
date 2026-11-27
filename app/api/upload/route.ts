export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { StorageNotConfiguredError, uploadImageToExternalStorage } from '@/lib/storage';

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_BYTES = 5 * 1024 * 1024;

function detectImageType(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: 'png' };
  }
  // GIF: GIF87a or GIF89a
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38 &&
    (buf[4] === 0x37 || buf[4] === 0x39) &&
    buf[5] === 0x61
  ) {
    return { mime: 'image/gif', ext: 'gif' };
  }
  // WebP: RIFF....WEBP
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return { mime: 'image/webp', ext: 'webp' };
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: 'マルチパート形式の画像データを送信してください' }, { status: 400 });
    }
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: '画像ファイルを選択してください' }, { status: 400 });
    }

    const declaredExt = ALLOWED_TYPES[file.type];
    if (!declaredExt) {
      return NextResponse.json(
        { error: 'JPG・PNG・WebP・GIF形式の画像のみアップロードできます' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: '空のファイルはアップロードできません' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const detected = detectImageType(buffer);
    if (!detected) {
      return NextResponse.json(
        { error: '有効なJPG・PNG・WebP・GIF画像ファイルではありません' },
        { status: 400 }
      );
    }
    const result = await uploadImageToExternalStorage(buffer, detected.mime, detected.ext);

    return NextResponse.json({ url: result.url, provider: result.provider });
  } catch (err) {
    if (err instanceof StorageNotConfiguredError) {
      return NextResponse.json(
        {
          error:
            '外部画像ストレージが未設定です。Cloudinary（CLOUDINARY_*）または Supabase Storage（SUPABASE_*）の環境変数を設定してください。',
        },
        { status: 503 }
      );
    }
    console.error('POST /api/upload error:', err);
    return NextResponse.json({ error: '画像のアップロードに失敗しました' }, { status: 500 });
  }
}
