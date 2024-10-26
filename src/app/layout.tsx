import { Tajawal } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import Layout from '@/components/layout/Layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Metadata } from 'next';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
});

// Static metadata
export const metadata: Metadata = {
  title: 'منصة التعليم التفاعلية',
  description: 'تعلم بطريقة مميزة مع دروس تفاعلية وتمارين عملية',
  keywords: ['تعليم', 'دروس', 'تفاعلي', 'رياضيات'],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
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
      </head>
      <body className={tajawal.className}>
        <ThemeProvider defaultTheme="light" attribute="data-theme">
          <TooltipProvider delayDuration={300}>
            <Layout>{children}</Layout>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}