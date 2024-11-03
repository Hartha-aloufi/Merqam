// src/app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = () => {
      try {
        // Get stored return URL from sessionStorage
        const returnUrl = sessionStorage.getItem('authReturnUrl') || '/';
        sessionStorage.removeItem('authReturnUrl'); // Clean up
        
        // Redirect
        router.push(returnUrl);
        router.refresh();
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/auth/signin');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-4 text-muted-foreground">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
}