import { Tajawal } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import Layout from '@/components/layout/Layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
});



// Static metadata
export const metadata: Metadata = {
  title: 'منصة التعليم التفاعلية',
  description: 'تعلم بطريقة مميزة مع دروس تفاعلية وتمارين عملية',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
      },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'منصة التعليم',
  },
  formatDetection: {
    telephone: false,
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={tajawal.className}>
        <ThemeProvider defaultTheme="light" attribute="data-theme">
          <TooltipProvider delayDuration={300}>
            <Layout>{children}</Layout>
          </TooltipProvider>
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  );
}