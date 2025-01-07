// src/server/services/user.service.ts
import { db } from '../config/db';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { signToken } from '../lib/auth/jwt';
import { TokenService } from './token.service';
import { AuthError } from '../lib/errors';
import type { AuthResponse, CreateUserInput } from '@/types/auth';
import { randomUUID } from 'crypto';

interface GoogleUserInput {
	email: string;
	name: string;
	googleId: string;
}

export class UserService {
	private tokenService: TokenService;

	constructor() {
		this.tokenService = new TokenService();
	}

	async findOrCreateGoogleUser(input: GoogleUserInput) {
		// First try to find user by email
		const existingUser = await db
			.selectFrom('users')
			.where('email', '=', input.email)
			.select(['id', 'email', 'name'])
			.executeTakeFirst();

		if (existingUser) {
			return existingUser;
		}

		// If user doesn't exist, create new user
		const hashedPassword = await hashPassword(randomUUID());

		const [newUser] = await db
			.insertInto('users')
			.values({
				email: input.email,
				name: input.name,
				password_hash: hashedPassword,
			})
			.returning(['id', 'email', 'name'])
			.execute();

		return newUser;
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

		try {
			const isPasswordValid = await verifyPassword(
				password,
				user.password_hash
			);

			if (!isPasswordValid) {
				throw new AuthError('Invalid credentials');
			}

			// First revoke all existing refresh tokens for security
			await this.tokenService.revokeAllUserTokens(user.id);

			// Generate new tokens
			const accessToken = signToken({
				userId: user.id,
				email: user.email,
			});
			const refreshToken = await this.tokenService.createRefreshToken(
				user.id
			);

			return {
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
				},
				accessToken,
				refreshToken,
			};
		} catch (error) {
			console.error('Password verification error:', error);
			throw new AuthError('Invalid credentials');
		}
	}

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

		const accessToken = signToken({
			userId: user.id,
			email: user.email,
		});
		const refreshToken = await this.tokenService.createRefreshToken(
			user.id
		);

		return {
			user,
			accessToken,
			refreshToken,
		};
	}
}
