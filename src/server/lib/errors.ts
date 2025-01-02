// src/server/lib/errors.ts
export class AppError extends Error {
	constructor(
		message: string,
		public statusCode: number = 500,
		public code?: string
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class AuthError extends AppError {
	constructor(message: string) {
		super(message, 401, 'UNAUTHORIZED');
	}
}

export class ValidationError extends AppError {
	constructor(message: string) {
		super(message, 400, 'VALIDATION_ERROR');
	}
}
