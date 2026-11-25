import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GadgetPress - ガジェット紹介メディア',
    short_name: 'GadgetPress',
    description: '最新ガジェットのレビュー・比較情報を発信するテックメディア',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#0a1628',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
