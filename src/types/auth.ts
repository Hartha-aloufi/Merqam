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
	accessToken: string; // Changed from token to accessToken
	refreshToken: string; // Added refresh token
}

export interface TokenResponse {
	accessToken: string;
	refreshToken: string;
}
