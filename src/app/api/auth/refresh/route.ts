// src/app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server';
import { TokenService } from '@/server/services/token.service';
import { AUTH_COOKIE_CONFIG } from '@/server/config/auth';
import { AppError } from '@/server/lib/errors';

const tokenService = new TokenService();

export async function POST(request: Request) {
	try {
		// Get refresh token from request cookies
		const refreshToken = request.cookies.get('refresh_token')?.value;

		if (!refreshToken) {
			throw new AppError('No refresh token provided', 401);
		}

		// Validate refresh token and get new access token
		const { accessToken, refreshToken: newRefreshToken } =
			await tokenService.refreshTokens(refreshToken);

		// Create response
		const response = NextResponse.json({ success: true });

		// Set new tokens as cookies
		response.cookies.set('access_token', accessToken, AUTH_COOKIE_CONFIG);
		response.cookies.set(
			'refresh_token',
			newRefreshToken,
			AUTH_COOKIE_CONFIG
		);

		return response;
	} catch (error) {
		console.error('Token refresh error:', error);
		return NextResponse.json(
			{ error: 'Invalid or expired refresh token' },
			{ status: 401 }
		);
	}
}
