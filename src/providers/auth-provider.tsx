// src/providers/auth-provider.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    const subscription = authService.onAuthStateChange((event, session) => {
      // Update auth queries based on event
      if (event === 'SIGNED_IN') {
        queryClient.setQueryData(['auth', 'session'], { data: { session } });
        queryClient.setQueryData(['auth', 'user'], { 
          data: { user: session?.user ?? null } 
        });
      } else if (event === 'SIGNED_OUT') {
        queryClient.setQueryData(['auth', 'session'], { data: { session: null } });
        queryClient.setQueryData(['auth', 'user'], { data: { user: null } });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}