// src/client/hooks/use-auth-query.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../lib/api-error';
import type { AuthResponse, CreateUserInput } from '@/types/auth';
import { toast } from 'sonner';

const authService = new AuthService();

export const AUTH_KEYS = {
	session: ['auth', 'session'] as const,
};

export interface User {
	id: string;
	email: string;
	name: string | null;
}

export interface SessionData {
	user: User | null;
}

export function useSession() {
	return useQuery<SessionData>({
		queryKey: AUTH_KEYS.session,
		queryFn: async () => {
			try {
				const user = await authService.getProfile();
				return { user };
			} catch (error) {
				return { user: null };
			}
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: true,
		refetchOnMount: true,
	});
}

export function useLogin() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation<
		AuthResponse,
		Error,
		{ email: string; password: string }
	>({
		mutationFn: ({ email, password }) => {
			return authService.login(email, password);
		},
		onSuccess: (data) => {
			queryClient.setQueryData(AUTH_KEYS.session, { user: data.user });

			const returnUrl = sessionStorage.getItem('authReturnUrl') || '/';
			sessionStorage.removeItem('authReturnUrl');

			router.push(returnUrl);
			router.refresh();
		},
		onError: (error) => {
			if (error instanceof ApiError) {
				if (error.isRateLimit()) {
					toast.error(
						'عدد محاولات تسجيل الدخول تجاوز الحد المسموح. الرجاء المحاولة لاحقاً'
					);
				} else {
					toast.error(error.message || 'فشل تسجيل الدخول');
				}
			}
		},
	});
}

export function useGoogleLogin() {
	const returnUrl =
		typeof window !== 'undefined' ? window.location.pathname : '/';

	return useMutation({
		mutationFn: async () => {
			if (typeof window !== 'undefined') {
				sessionStorage.setItem('authReturnUrl', returnUrl);
			}
			const response = await fetch('/api/auth/google');
			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
			} else {
				throw new Error('Failed to get Google auth URL');
			}
		},
		onError: (error) => {
			console.error('Google login error:', error);
			toast.error('فشل تسجيل الدخول باستخدام Google');
		},
	});
}

export function useLogout() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: () => authService.logout(),
		onSuccess: () => {
			queryClient.setQueryData(AUTH_KEYS.session, { user: null });
			queryClient.clear(); // Clear all queries
			router.push('/');
			router.refresh();
		},
		onError: () => {
			toast.error('فشل تسجيل الخروج');
		},
	});
}

export function useRegister() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation<AuthResponse, Error, CreateUserInput>({
		mutationFn: (data) => {
			return authService.register(data);
		},
		onSuccess: (data) => {
			queryClient.setQueryData(AUTH_KEYS.session, { user: data.user });

			const returnUrl = sessionStorage.getItem('authReturnUrl') || '/';
			sessionStorage.removeItem('authReturnUrl');
			router.push(returnUrl);
			router.refresh();
		},
		onError: (error: Error) => {
			if (error instanceof ApiError) {
				if (error.isRateLimit()) {
					toast.error(
						'عدد محاولات التسجيل تجاوز الحد المسموح. الرجاء المحاولة لاحقاً'
					);
				} else {
					toast.error(error.message || 'فشل إنشاء الحساب');
				}
			}
		},
	});
}
