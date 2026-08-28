import type { Metadata, Viewport } from 'next';
import './globals.css';
const title = 'LouFind — SLU Lost & Found · Baguio';
const description =
  'An unofficial lost-and-found prototype for Saint Louis University in Baguio City, Philippines. Report items, browse matches, and track ownership claims.';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_SITE_URL || 'http://localhost:3000'),
  title,
  description,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/loufind-icon-64.png',
    apple: '/loufind-icon-180.png',
  },
  appleWebApp: {
    capable: true,
    title: 'LouFind',
    statusBarStyle: 'default',
  },
  openGraph: {
    title,
    description,
    type: 'website',
    siteName: 'LouFind',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'LouFind — SLU Lost & Found. Saint Louis University, Baguio City, Philippines. Unofficial demo.',
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
  themeColor: '#073779',
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
