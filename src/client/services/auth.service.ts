// src/client/services/auth.service.ts
import { AuthResponse, CreateUserInput } from '@/types/auth';

export class AuthService {
	private baseUrl = '/api/auth';

	async login(email: string, password: string): Promise<AuthResponse> {
		const res = await fetch(`${this.baseUrl}/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password }),
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.error || 'Login failed');
		}

		return res.json();
	}

	async register(input: CreateUserInput): Promise<AuthResponse> {
		const res = await fetch(`${this.baseUrl}/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.error || 'Registration failed');
		}

		return res.json();
	}
}
