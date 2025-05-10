// src/client/services/auth.service.ts
import { httpClient } from '../lib/http-client';
import { AuthResponse, CreateUserInput } from '@/types/auth';
import { ApiError } from '../lib/api-error';

export class AuthService {
	async login(email: string, password: string): Promise<AuthResponse> {
		try {
			const { data } = await httpClient.post<AuthResponse>(
				'/auth/login',
				{
					email,
					password,
				}
			);
			return data;
		} catch (error: any) {
			console.error('Login error:', error.response?.data || error);
			throw new ApiError(error);
		}
	}

	async getProfile() {
		try {
			const { data } = await httpClient.get('/profile');
			return data;
		} catch (error) {
			throw error;
		}
	}

	async register(input: CreateUserInput): Promise<AuthResponse> {
		try {
			const { data } = await httpClient.post<AuthResponse>(
				'/auth/register',
				input
			);
			return data;
		} catch (error: any) {
			console.error('Register error:', error.response?.data || error);
			throw new ApiError(error);
		}
	}

	async logout(): Promise<void> {
		try {
			await httpClient.post('/auth/logout');
		} catch (error: any) {
			// Log the error but don't throw it
			console.error('Logout error:', error);
			// We still want to handle the logout cleanup even if the API call fails
		}
	}

	async isAuthenticated(): Promise<boolean> {
		try {
			await this.getProfile();
			return true;
		} catch {
			return false;
		}
	}
}
