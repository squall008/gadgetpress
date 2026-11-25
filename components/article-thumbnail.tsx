'use client';

import { isImageThumbnail, sanitizeThumbnail } from '@/lib/article-utils';

interface ArticleThumbnailProps {
  thumbnail?: string | null;
  alt: string;
  className?: string;
  emojiClassName?: string;
  imgClassName?: string;
}

export default function ArticleThumbnail({
  thumbnail,
  alt,
  className = '',
  emojiClassName = 'text-6xl',
  imgClassName = '',
}: ArticleThumbnailProps) {
  const safeThumb = sanitizeThumbnail(thumbnail);
  const isImg = isImageThumbnail(safeThumb);

  if (isImg) {
    return (
      <div className={`relative overflow-hidden bg-[#0a1628] ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={safeThumb}
          alt={alt}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ease-out ${imgClassName}`}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#102340] to-[#0a1628] flex items-center justify-center select-none ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_hsl(190_100%_50%_/_0.18),_transparent_60%)]" />
      <span className={`relative z-10 leading-none ${emojiClassName}`}>
        {safeThumb || '📱'}
      </span>
    </div>
  );
}
