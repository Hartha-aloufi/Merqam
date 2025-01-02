// src/client/lib/http-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const httpClient = axios.create({
	baseURL: '/api',
	headers: {
		'Content-Type': 'application/json',
	},
});

let refreshTokenPromise: Promise<string> | null = null;

httpClient.interceptors.request.use((config) => {
	const accessToken = localStorage.getItem('access_token');
	if (accessToken) {
		config.headers.Authorization = `Bearer ${accessToken}`;
	}
	return config;
});

httpClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const refreshToken = localStorage.getItem('refresh_token');
				if (!refreshToken) {
					throw new Error('No refresh token available');
				}

				refreshTokenPromise =
					refreshTokenPromise || refreshAccessToken(refreshToken);
				const newAccessToken = await refreshTokenPromise;

				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
				return httpClient(originalRequest);
			} catch {
				// Don't redirect, just clear tokens
				localStorage.removeItem('access_token');
				localStorage.removeItem('refresh_token');
				return Promise.reject(error);
			} finally {
				refreshTokenPromise = null;
			}
		}

		return Promise.reject(error);
	}
);

async function refreshAccessToken(refreshToken: string): Promise<string> {
	try {
		const response = await axios.post('/api/auth/refresh', {
			refreshToken,
		});

		const { accessToken, refreshToken: newRefreshToken } = response.data;

		localStorage.setItem('access_token', accessToken);
		localStorage.setItem('refresh_token', newRefreshToken);

		return accessToken;
	} catch (error) {
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		throw error;
	}
}
