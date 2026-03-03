import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'SonoBuddy — Sonographer Reference',
  description: 'Fast reference for sonographers: measurements, protocols, calculators, and pathologies. Made for new grads and working sonographers.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SonoBuddy',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-sono-dark min-h-screen">
        <main className="max-w-lg mx-auto relative">
          {children}
        </main>
        <div className="max-w-lg mx-auto">
          <Navigation />
        </div>
      </body>
    </html>
  );
}
