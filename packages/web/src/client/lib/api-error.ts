// src/client/lib/api-error.ts
import { AxiosError } from 'axios';

export class ApiError extends Error {
	public statusCode: number;
	public code?: string;

	constructor(error: AxiosError) {
		const message = getErrorMessage(error);
		super(message);

		this.name = 'ApiError';
		this.statusCode = error.response?.status ?? 500;
		this.code = (error.response?.data as any)?.code;

		// Ensure proper prototype chain
		Object.setPrototypeOf(this, ApiError.prototype);
	}

	isUnauthorized(): boolean {
		return this.statusCode === 401;
	}

	isForbidden(): boolean {
		return this.statusCode === 403;
	}

	isNotFound(): boolean {
		return this.statusCode === 404;
	}

	isRateLimit(): boolean {
		return this.statusCode === 429;
	}
}

function getErrorMessage(error: AxiosError): string {
	if (error.response?.data) {
		const data = error.response.data as any;
		return data.error || data.message || error.message;
	}
	return error.message;
}
