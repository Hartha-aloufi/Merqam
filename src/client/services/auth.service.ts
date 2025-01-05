// src/client/services/auth.service.ts
'use client';

import { httpClient } from '../lib/http-client';
import { AuthResponse, CreateUserInput } from '@/types/auth';

/**
 * Service for handling authentication-related API requests
 */
export class AuthService {
	/**
	 * Authenticate user with email and password
	 */
	async login(email: string, password: string): Promise<AuthResponse> {
		const { data } = await httpClient.post<AuthResponse>('/auth/login', {
			email,
			password,
		});

		// Store tokens
		localStorage.setItem('access_token', data.accessToken);
		localStorage.setItem('refresh_token', data.refreshToken);

		return data;
	}

	/**
	 * Register a new user
	 */
	async register(input: CreateUserInput): Promise<AuthResponse> {
		const { data } = await httpClient.post<AuthResponse>(
			'/auth/register',
			input
		);

		// Store tokens
		localStorage.setItem('access_token', data.accessToken);
		localStorage.setItem('refresh_token', data.refreshToken);

		return data;
	}

	/**
	 * Logout user and revoke refresh token
	 */
	async logout(): Promise<void> {
		const refreshToken = localStorage.getItem('refresh_token');

		if (refreshToken) {
			try {
				await httpClient.post('/auth/logout', { refreshToken });
			} catch (error) {
				console.error('Logout error:', error);
			}
		}

		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
	}

	/**
	 * Get current user profile
	 */
	async getProfile() {
		const { data } = await httpClient.get('/profile');
		return data;
	}

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		return !!localStorage.getItem('access_token');
	}

	/**
	 * Get current access token
	 */
	getAccessToken(): string | null {
		return localStorage.getItem('access_token');
	}

	/**
	 * Get current refresh token
	 */
	getRefreshToken(): string | null {
		return localStorage.getItem('refresh_token');
	}
}
