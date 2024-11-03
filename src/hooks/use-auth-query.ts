// src/hooks/use-auth-query.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const AUTH_KEYS = {
  session: ['auth', 'session'],
  user: ['auth', 'user'],
};

export function useSession() {
  return useQuery({
    queryKey: AUTH_KEYS.session,
    queryFn: authService.getSession,
    staleTime: Infinity,
  });
}

export function useUser() {
  return useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: authService.getUser,
    staleTime: Infinity,
  });
}

export function useGoogleLogin() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || pathname;

  return useMutation({
    mutationFn: () => {
      if (returnUrl) {
        sessionStorage.setItem('authReturnUrl', returnUrl);
      }

      return authService.loginWithGoogle({ 
        redirectTo: `${window.location.origin}/auth/callback`
      });
    },
    onError: (error) => {
      console.error('Login error:', error);
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Just clear auth queries and refresh the page
      queryClient.removeQueries({ queryKey: ['auth'] });
      router.refresh();
    }
  });
}