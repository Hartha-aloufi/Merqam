// src/server/services/google-auth.service.ts
import { GOOGLE_OAUTH_CONFIG } from '@/server/config/auth';
import { UserService } from './user.service';
import { TokenService } from './token.service';
import { AppError } from '@/server/lib/errors';
import { signToken } from '../lib/auth/jwt';

interface GoogleTokensResponse {
	access_token: string;
	id_token: string;
	refresh_token?: string;
}

interface GoogleUserInfo {
	email: string;
	name: string;
	picture: string;
	verified_email: boolean;
}

export class GoogleAuthService {
	private userService: UserService;
	private tokenService: TokenService;

	constructor() {
		this.userService = new UserService();
		this.tokenService = new TokenService();
	}

	async handleCallback(code: string) {
		try {
			// Exchange code for tokens
			const tokens = await this.exchangeCodeForTokens(code);

			// Get user info from Google
			const googleUser = await this.getUserInfo(tokens.access_token);

			if (!googleUser.verified_email) {
				throw new AppError('Email not verified with Google', 400);
			}

			// Find or create user
			const user = await this.userService.findOrCreateGoogleUser({
				email: googleUser.email,
				name: googleUser.name,
				googleId: tokens.id_token,
			});

			// Generate application tokens
			const accessToken = signToken({
				userId: user.id,
				email: user.email,
			});
			const refreshToken = await this.tokenService.createRefreshToken(
				user.id
			);

			return {
				tokens: { accessToken, refreshToken },
				user,
			};
		} catch (error) {
			console.error('Google auth error:', error);
			throw new AppError('Failed to authenticate with Google', 500);
		}
	}

	private async exchangeCodeForTokens(
		code: string
	): Promise<GoogleTokensResponse> {
		const tokenParams = new URLSearchParams({
			client_id: GOOGLE_OAUTH_CONFIG.client_id,
			client_secret: GOOGLE_OAUTH_CONFIG.client_secret,
			redirect_uri: GOOGLE_OAUTH_CONFIG.redirect_uri,
			grant_type: 'authorization_code',
			code,
		});

		const response = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: tokenParams.toString(),
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Token exchange error:', errorData);
			throw new AppError('Failed to exchange code for tokens', 500);
		}

		return response.json();
	}

	private async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
		const response = await fetch(
			'https://www.googleapis.com/oauth2/v2/userinfo',
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			console.error('User info error:', errorData);
			throw new AppError('Failed to get user info from Google', 500);
		}

		return response.json();
	}
}
