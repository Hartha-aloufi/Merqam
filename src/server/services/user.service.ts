// src/server/services/user.service.ts
import { db } from '../config/db';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { signToken } from '../lib/auth/jwt';
import type { CreateUserInput, AuthResponse } from '@/types/auth';
import { AuthError } from '../lib/errors';

export class UserService {
	async createUser(input: CreateUserInput): Promise<AuthResponse> {
		const existingUser = await db
			.selectFrom('users')
			.where('email', '=', input.email)
			.executeTakeFirst();

		if (existingUser) {
			throw new AuthError('Email already registered');
		}

		const hashedPassword = await hashPassword(input.password);

		const [user] = await db
			.insertInto('users')
			.values({
				email: input.email,
				password_hash: hashedPassword,
				name: input.name || null,
			})
			.returning(['id', 'email', 'name'])
			.execute();

		const token = signToken({
			userId: user.id,
			email: user.email,
		});

		return { user, token };
	}

	async login(email: string, password: string): Promise<AuthResponse> {
		const user = await db
			.selectFrom('users')
			.where('email', '=', email)
			.select(['id', 'email', 'name', 'password_hash'])
			.executeTakeFirst();

		if (!user) {
			throw new AuthError('Invalid credentials');
		}

		const isPasswordValid = await verifyPassword(
			password,
			user.password_hash
		);
		if (!isPasswordValid) {
			throw new AuthError('Invalid credentials');
		}

		const token = signToken({
			userId: user.id,
			email: user.email,
		});

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
			token,
		};
	}
}
