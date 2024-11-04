// src/services/auth.service.ts
import { supabase } from '@/lib/supabase';
import { User, UserResponse } from '@supabase/supabase-js';
import { AuthError } from '@supabase/gotrue-js';

interface LoginWithGoogleOptions {
  redirectTo: string;
}

export const authService = {
  // Get current session
  getSession: () => {
    return supabase.auth.getSession();
  },

  // Get current user
  getUser: () => {
    return supabase.auth.getUser();
  },

  // Sign in with Google
  loginWithGoogle: ({ redirectTo }: LoginWithGoogleOptions) => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
  },

  // Sign out
  logout: () => {
    return supabase.auth.signOut();
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: 'SIGNED_IN' | 'SIGNED_OUT', session: UserResponse['data']['session']) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event as 'SIGNED_IN' | 'SIGNED_OUT', session);
    });
    
    return subscription;
  }
};

// types.ts
export type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
}