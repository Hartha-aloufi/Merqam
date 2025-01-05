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
			if (!authService.isAuthenticated()) {
				return { user: null };
			}
			try {
				const profile = await authService.getProfile();
				return { user: profile };
			} catch {
				authService.logout();
				return { user: null };
			}
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
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

export function useLogout() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: () => authService.logout(),
		onSuccess: () => {
			queryClient.setQueryData(AUTH_KEYS.session, { user: null });
			router.push('/');
			router.refresh();
		},
		onError: () => {
			toast.error('فشل تسجيل الخروج');
		},
	});
}

export function useGoogleLogin() {
	const returnUrl =
		typeof window !== 'undefined' ? window.location.pathname : '/';

	return useMutation({
		mutationFn: () => {
			sessionStorage.setItem('authReturnUrl', returnUrl);
			return authService.loginWithGoogle({
				redirectTo: `${window.location.origin}/auth/callback`,
			});
		},
		onError: (error) => {
			console.error('Login error:', error);
			toast.error('فشل تسجيل الدخول باستخدام Google');
		},
	});
}
