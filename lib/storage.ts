import crypto from 'crypto';
import { sanitizeExternalUrl } from '@/lib/article-utils';

export type StorageProvider = 'cloudinary' | 'supabase';

export class StorageNotConfiguredError extends Error {
  constructor() {
    super('外部画像ストレージ（Cloudinary または Supabase Storage）の環境変数が未設定です');
    this.name = 'StorageNotConfiguredError';
  }
}

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
}

interface SupabaseStorageConfig {
  url: string;
  serviceRoleKey: string;
  bucket: string;
}

function isPlaceholder(value: string): boolean {
  const lower = value.trim().toLowerCase();
  return !lower || lower.startsWith('your-') || lower.startsWith('replace-');
}

function getCloudinaryConfig(): CloudinaryConfig | null {
  let cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  let apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
  let apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();
  const folder = (process.env.CLOUDINARY_UPLOAD_FOLDER || 'gadgetpress')
    .trim()
    .replace(/^\/+|\/+$/g, '');

  // Also support standard single-string CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
  if ((!cloudName || !apiKey || !apiSecret) && process.env.CLOUDINARY_URL) {
    try {
      const parsed = new URL(process.env.CLOUDINARY_URL.trim());
      if (parsed.protocol === 'cloudinary:') {
        cloudName = cloudName || decodeURIComponent(parsed.hostname);
        apiKey = apiKey || decodeURIComponent(parsed.username);
        apiSecret = apiSecret || decodeURIComponent(parsed.password);
      }
    } catch {
      // ignore invalid CLOUDINARY_URL
    }
  }

  if (isPlaceholder(cloudName) || isPlaceholder(apiKey) || isPlaceholder(apiSecret)) {
    return null;
  }

  return { cloudName, apiKey, apiSecret, folder: folder || 'gadgetpress' };
}

function getSupabaseStorageConfig(): SupabaseStorageConfig | null {
  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const bucket = (process.env.SUPABASE_STORAGE_BUCKET || 'article-images').trim();

  if (isPlaceholder(url) || isPlaceholder(serviceRoleKey) || isPlaceholder(bucket)) {
    return null;
  }

  return { url, serviceRoleKey, bucket };
}

export function getActiveStorageProvider(): StorageProvider | null {
  if (getCloudinaryConfig()) return 'cloudinary';
  if (getSupabaseStorageConfig()) return 'supabase';
  return null;
}

export function signCloudinaryParams(
  params: Record<string, string | number>,
  apiSecret: string
): string {
  const sortedQuery = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== '')
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(`${sortedQuery}${apiSecret}`).digest('hex');
}

async function uploadToCloudinary(
  buffer: Buffer,
  mimeType: string,
  config: CloudinaryConfig
): Promise<{ url: string; provider: 'cloudinary' }> {
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;

  const paramsToSign = {
    folder: config.folder,
    public_id: publicId,
    timestamp,
  };
  const signature = signCloudinaryParams(paramsToSign, config.apiSecret);

  const formData = new FormData();
  formData.append('file', `data:${mimeType};base64,${buffer.toString('base64')}`);
  formData.append('api_key', config.apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('folder', config.folder);
  formData.append('public_id', publicId);
  formData.append('signature', signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`;
  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('Cloudinary upload failed:', res.status, errText.slice(0, 300));
    throw new Error('Cloudinaryへの画像アップロードに失敗しました');
  }

  const data = (await res.json()) as { secure_url?: string };
  const safeUrl = sanitizeExternalUrl(data?.secure_url);
  if (!safeUrl || !safeUrl.startsWith('https://')) {
    throw new Error('Cloudinaryから有効な画像URLを取得できませんでした');
  }

  return { url: safeUrl, provider: 'cloudinary' };
}

async function uploadToSupabaseStorage(
  buffer: Buffer,
  mimeType: string,
  ext: string,
  config: SupabaseStorageConfig
): Promise<{ url: string; provider: 'supabase' }> {
  const objectPath = `articles/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');
  const uploadEndpoint = `${config.url}/storage/v1/object/${encodeURIComponent(config.bucket)}/${encodedPath}`;

  const res = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.serviceRoleKey}`,
      apikey: config.serviceRoleKey,
      'Content-Type': mimeType,
      'x-upsert': 'false',
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('Supabase Storage upload failed:', res.status, errText.slice(0, 300));
    throw new Error('Supabase Storageへの画像アップロードに失敗しました');
  }

  const publicUrl = sanitizeExternalUrl(
    `${config.url}/storage/v1/object/public/${encodeURIComponent(config.bucket)}/${encodedPath}`
  );
  if (!publicUrl) {
    throw new Error('Supabase Storageの公開URL生成に失敗しました');
  }

  return { url: publicUrl, provider: 'supabase' };
}

export async function uploadImageToExternalStorage(
  buffer: Buffer,
  mimeType: string,
  ext: string
): Promise<{ url: string; provider: StorageProvider }> {
  const cloudinary = getCloudinaryConfig();
  if (cloudinary) {
    return uploadToCloudinary(buffer, mimeType, cloudinary);
  }

  const supabase = getSupabaseStorageConfig();
  if (supabase) {
    return uploadToSupabaseStorage(buffer, mimeType, ext, supabase);
  }

  throw new StorageNotConfiguredError();
}
