'use client';

// src/providers/auth-provider.tsx
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthService } from '@/client/services/auth.service';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { httpClient } from '@/client/lib/http-client';

// Configure queryClient with default options
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: (failureCount, error) => {
				// Don't retry on 401/403 errors
				if (
					error instanceof Error &&
					'statusCode' in error &&
					[401, 403].includes((error as any).statusCode)
				) {
					return false;
				}
				return failureCount < 3;
			},
		},
	},
});

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	// Initialize auth service
	const authService = new AuthService();

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
