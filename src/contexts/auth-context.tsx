// src/contexts/auth-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthState {
  user: User | null
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
  })
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        isLoading: false,
      }))
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
      }))

      if (event === 'SIGNED_OUT') {
        // Clear any local storage items you might have set
        localStorage.removeItem('supabase.auth.token')
        // Refresh router to update client state
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear auth state
      setState(prev => ({
        ...prev,
        user: null,
      }))

      // Just refresh the router to update client state
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}