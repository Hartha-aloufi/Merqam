// src/server/services/token.service.ts
import { db } from '../config/db';
import { randomBytes } from 'crypto';
import { add } from 'date-fns';
import { AuthError } from '../lib/errors';
import { signToken } from '../lib/auth/jwt';

const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;

interface RefreshTokensResponse {
	accessToken: string;
	refreshToken: string;
}

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

	async refreshTokens(
		currentRefreshToken: string
	): Promise<RefreshTokensResponse> {
		try {
			// Validate current refresh token
			const user = await this.validateRefreshToken(currentRefreshToken);

			// Revoke the current refresh token
			await this.revokeRefreshToken(currentRefreshToken);

			// Generate new tokens
			const accessToken = signToken({
				userId: user.id,
				email: user.email,
			});

			// Create new refresh token
			const refreshToken = await this.createRefreshToken(user.id);

			return {
				accessToken,
				refreshToken,
			};
		} catch (error) {
			console.error('Token refresh error:', error);
			throw new AuthError('Failed to refresh tokens');
		}
	}

	async revokeRefreshToken(token: string): Promise<void> {
		try {
			await db
				.deleteFrom('refresh_tokens')
				.where('token', '=', token)
				.execute();
		} catch (error) {
			console.error('Error revoking refresh token:', error);
			// Don't throw error to prevent blocking logout
		}
	}

	async revokeAllUserTokens(userId: string): Promise<void> {
		try {
			await db
				.deleteFrom('refresh_tokens')
				.where('user_id', '=', userId)
				.execute();
		} catch (error) {
			console.error('Error revoking user tokens:', error);
			// Don't throw error to prevent blocking logout
		}
	}

	async cleanupExpiredTokens(): Promise<void> {
		try {
			await db
				.deleteFrom('refresh_tokens')
				.where('expires_at', '<=', new Date())
				.execute();
		} catch (error) {
			console.error('Error cleaning up expired tokens:', error);
		}
	}
}
