// src/types/auth.ts
export interface AuthTokenPayload {
	userId: string;
	email: string;
	iat?: number;
	exp?: number;
}

export interface CreateUserInput {
	email: string;
	password: string;
	name?: string;
}

export interface AuthResponse {
	user: {
		id: string;
		email: string;
		name: string | null;
	};
	token: string;
}
