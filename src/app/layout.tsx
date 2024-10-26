import { Tajawal } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import Layout from '@/components/layout/Layout';
import { TooltipProvider } from '@/components/ui/tooltip';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={tajawal.className}>
        <ThemeProvider>
          <TooltipProvider delayDuration={300}>
            <Layout>{children}</Layout>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}