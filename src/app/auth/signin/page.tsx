// src/app/auth/signin/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import { SignInForm } from '@/components/auth/signin-form';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'تسجيل الدخول | مِرْقَم',
  description: 'سجل دخولك إلى منصة مِرْقَم'
};

function LoadingState() {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="container max-w-lg px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">مرحباً بك في مِرْقَم</h1>
        <p className="text-muted-foreground">
          سجل دخولك للوصول إلى محتوى المنصة
        </p>
      </div>
      <Suspense fallback={<LoadingState />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}