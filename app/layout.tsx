import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SonoBuddy — Ultrasound Reference for Sonographers',
    template: '%s | SonoBuddy',
  },
  description: 'Instant access to ultrasound measurement tables, exam protocols, clinical calculators, and pathology guides. Built for sonographers.',
  keywords: [
    'ultrasound reference',
    'sonographer app',
    'ultrasound protocols',
    'ABI calculator',
    'sonography',
    'measurement tables',
    'carotid stenosis',
    'gestational age calculator',
    'resistive index',
    'doppler ultrasound',
    'new grad sonographer',
    'ARDMS',
  ],
  authors: [{ name: 'SonoBuddy' }],
  creator: 'SonoBuddy',
  metadataBase: new URL('https://www.sonobuddy.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.sonobuddy.com',
    siteName: 'SonoBuddy',
    title: 'SonoBuddy — Ultrasound Reference for Sonographers',
    description: 'Instant access to ultrasound measurement tables, exam protocols, clinical calculators, and pathology guides.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SonoBuddy — Ultrasound Reference App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SonoBuddy — Ultrasound Reference for Sonographers',
    description: 'Instant access to ultrasound measurement tables, exam protocols, clinical calculators, and pathology guides.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SonoBuddy',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0EA5E9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-sono-dark min-h-screen">
        {children}
      </body>
    </html>
  );
}
