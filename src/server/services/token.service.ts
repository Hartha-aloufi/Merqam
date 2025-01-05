// src/server/services/token.service.ts
import { db } from '../config/db';
import { randomBytes } from 'crypto';
import { add } from 'date-fns';
import { AuthError } from '../lib/errors';

const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;
const ACCESS_TOKEN_EXPIRES_IN_MINUTES = 15;

export class TokenService {
	async createRefreshToken(userId: string): Promise<string> {
		const token = randomBytes(40).toString('hex');
		const expiresAt = add(new Date(), {
			days: REFRESH_TOKEN_EXPIRES_IN_DAYS,
		});

		await db
			.insertInto('refresh_tokens')
			.values({
				user_id: userId,
				token,
				expires_at: expiresAt,
			})
			.execute();

		return token;
	}

	async validateRefreshToken(token: string) {
		const result = await db
			.selectFrom('refresh_tokens')
			.innerJoin('users', 'users.id', 'refresh_tokens.user_id')
			.where('refresh_tokens.token', '=', token)
			.where('refresh_tokens.expires_at', '>', new Date())
			.select(['users.id', 'users.email'])
			.executeTakeFirst();

		if (!result) {
			throw new AuthError('Invalid or expired refresh token');
		}

		return result;
	}

	async revokeRefreshToken(token: string): Promise<void> {
		await db
			.deleteFrom('refresh_tokens')
			.where('token', '=', token)
			.execute();
	}

	async revokeAllUserTokens(userId: string): Promise<void> {
		await db
			.deleteFrom('refresh_tokens')
			.where('user_id', '=', userId)
			.execute();
	}

	async cleanupExpiredTokens(): Promise<void> {
		await db
			.deleteFrom('refresh_tokens')
			.where('expires_at', '<=', new Date())
			.execute();
	}

	getTokenExpirations() {
		return {
			accessToken: ACCESS_TOKEN_EXPIRES_IN_MINUTES,
			refreshToken: REFRESH_TOKEN_EXPIRES_IN_DAYS,
		};
	}
}
