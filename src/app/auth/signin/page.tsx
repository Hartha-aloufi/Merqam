// src/app/auth/signin/page.tsx
import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'تسجيل الدخول | مِرْقَم',
  description: 'سجل دخولك إلى منصة مِرْقَم'
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
      <LoginForm />
    </div>
  )
}