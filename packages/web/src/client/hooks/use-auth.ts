// src/client/hooks/use-auth.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthService } from '../services/auth.service';
import { CreateUserInput } from '@/types/auth';

const authService = new AuthService();

const AUTH_KEYS = {
	user: ['auth', 'user'] as const,
};

export function useAuth() {
	const { data: user, isLoading } = useQuery({
		queryKey: AUTH_KEYS.user,
		queryFn: async () => {
			const token = localStorage.getItem('token');
			if (!token) return null;

			// Decode token to get user info or fetch from API
			// Implement as needed
			return null;
		},
	});

	const login = useMutation({
		mutationFn: (credentials: { email: string; password: string }) =>
			authService.login(credentials.email, credentials.password),
		onSuccess: (data) => {
			localStorage.setItem('token', data.token);
		},
	});

	const register = useMutation({
		mutationFn: (input: CreateUserInput) => authService.register(input),
		onSuccess: (data) => {
			localStorage.setItem('token', data.token);
		},
	});

	const logout = () => {
		localStorage.removeItem('token');
	};

	return {
		user,
		isLoading,
		login,
		register,
		logout,
		isAuthenticated: !!user,
	};
}
