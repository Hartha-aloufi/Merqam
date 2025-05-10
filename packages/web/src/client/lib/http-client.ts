// src/client/lib/http-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const httpClient = axios.create({
	baseURL: '/api',
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
// Store pending requests
let failedQueue: Array<{
	resolve: (value?: unknown) => void;
	reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
	failedQueue.forEach((promise) => {
		if (error) {
			promise.reject(error);
		} else {
			promise.resolve();
		}
	});
	failedQueue = [];
};

httpClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		// Don't retry refresh requests to prevent loops
		if (originalRequest.url?.includes('/auth/refresh')) {
			return Promise.reject(error);
		}

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				// If refreshing, add request to queue
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then(() => httpClient(originalRequest))
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				await axios.post('/api/auth/refresh', null, {
					withCredentials: true,
				});
				processQueue(null);
				return httpClient(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError as Error);
				// Only redirect if we're not already on the auth pages

				// we don't have any auth routes, so comment out this block
				// if (!window.location.pathname.startsWith('/auth/')) {
				// 	window.location.href = `/auth/signin?returnUrl=${encodeURIComponent(
				// 		window.location.pathname
				// 	)}`;
				// }
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	}
);
