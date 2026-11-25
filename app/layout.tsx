export const dynamic = 'force-dynamic';
import type { Metadata, Viewport } from 'next';
import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono, Noto_Sans_JP } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import SessionProvider from '@/components/session-provider';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jp',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'GadgetPress | 最新ガジェットレビュー・比較オウンドメディア',
    template: '%s | GadgetPress',
  },
  description:
    'PC・スマートフォン・デスク環境・オーディオなど、最新ガジェットを実機検証と独自スコアで深掘りレビューするテックオウンドメディア。',
  metadataBase: new URL(
    process.env.AUTH_URL ||
      process.env.NEXTAUTH_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      'http://localhost:3000'
  ),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon-192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'GadgetPress',
    title: 'GadgetPress - 最新ガジェットレビュー・比較メディア',
    description: '実機検証と独自スコアで選ぶ、最新ガジェットのレビュー・徹底比較オウンドメディア',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GadgetPress - 最新ガジェットレビュー・比較メディア',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GadgetPress - 最新ガジェットレビュー・比較メディア',
    description: '実機検証と独自スコアで選ぶ、最新ガジェットのレビュー・徹底比較オウンドメディア',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'GadgetPress',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a1628',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${dmSans.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${notoSansJP.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground selection:bg-[hsl(var(--accent))]/25 selection:text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SessionProvider>
            <ChunkLoadErrorHandler />
            {children}
            <Toaster position="top-right" richColors />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
