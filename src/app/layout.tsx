import { Tajawal } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import Layout from '@/components/layout/Layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/providers/auth-provider';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
});



// Static metadata
export const metadata: Metadata = {
  title: 'مِرْقَم - تفريغ لمرئيات علمية نافعة',
  description: 'مِرْقَم - منصة لتسهيل العلم لمن يفضل القراءة على المشاهدة',
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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'تفريغ لمرئيات علمية نافعة',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://your-domain.com',
    title: 'مِرْقَم - تفريغ لمرئيات علمية نافعة',
    description: 'منصة تعليمية تفاعلية للرياضيات والعلوم',
    siteName: 'مِرْقَم',
    images: [{
      url: '/logo.webp',
      width: 512,
      height: 512,
      alt: 'مِرْقَم'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مِرْقَم - منصة تعليمية تفاعلية',
    description: 'مِرْقَم - منصة لتسهيل العلم لمن يفضل القراءة على المشاهدة',
    images: ['/logo.webp'],
  }
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
        <meta name="application-name" content="مِرْقَم" />
        <meta name="apple-mobile-web-app-title" content="مِرْقَم" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
      </head>
      <body className={tajawal.className}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" attribute="data-theme">
            <TooltipProvider delayDuration={300}>
              <Layout>{children}</Layout>
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}