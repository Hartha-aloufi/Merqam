// src/server/lib/errors.ts
export const AUTH_ERROR_MESSAGES = {
	INVALID_CREDENTIALS: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
	RATE_LIMIT:
		'عدد محاولات تسجيل الدخول تجاوز الحد المسموح. الرجاء المحاولة لاحقاً',
	EMAIL_EXISTS: 'البريد الإلكتروني مستخدم مسبقاً',
	SERVER_ERROR: 'عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى',
	TOKEN_EXPIRED: 'انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى',
	NO_TOKEN: 'الرجاء تسجيل الدخول للمتابعة',
	REFRESH_FAILED: 'فشل تجديد الجلسة. الرجاء تسجيل الدخول مرة أخرى',
} as const;

export class AppError extends Error {
	constructor(message: string, public statusCode: number = 500) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class AuthError extends AppError {
	constructor(message: string) {
		super(message, 401);
	}
}

export class ValidationError extends AppError {
	constructor(message: string) {
		super(message, 400);
	}
}
