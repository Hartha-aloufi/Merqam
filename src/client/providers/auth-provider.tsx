'use client';

// src/providers/auth-provider.tsx
import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthService } from '@/client/services/auth.service';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { httpClient } from '@/client/lib/http-client';
import { queryClient } from '../lib/queryClient';



interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	// Set up axios interceptor to handle auth state changes
	httpClient.interceptors.response.use(
		(response) => response,
		async (error) => {
			if (error.response?.status === 401) {
				// Clear auth state on unauthorized
				queryClient.setQueryData(['auth', 'user'], null);
				queryClient.setQueryData(['auth', 'session'], null);
			}
			return Promise.reject(error);
		}
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{process.env.NODE_ENV !== 'production' && <ReactQueryDevtools />}
		</QueryClientProvider>
	);
}
