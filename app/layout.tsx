import type { Metadata, Viewport } from 'next';
import './globals.css';
const title = 'FindIt Campus — A little help. A happy reunion.';
const description =
  'Your campus lost and found. Report an item, find a possible match, and get your belongings back safely.';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_SITE_URL || 'http://localhost:3000'),
  title,
  description,
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', apple: '/icon-192.png' },
  appleWebApp: {
    capable: true,
    title: 'FindIt Campus',
    statusBarStyle: 'default',
  },
  openGraph: {
    title,
    description,
    type: 'website',
    siteName: 'FindIt Campus',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'FindIt Campus. A little help. A happy reunion.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.png'],
  },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#263e43',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
