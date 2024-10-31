'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Handle the OAuth callback
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          // Get stored return URL or default to home
          const returnUrl = localStorage.getItem('authReturnUrl') || '/'
          localStorage.removeItem('authReturnUrl') // Clean up
          
          router.push(returnUrl)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/auth/signin') // Redirect to sign in on error
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
        <p className="mt-4 text-muted-foreground">جاري تسجيل الدخول...</p>
      </div>
    </div>
  )
}