// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { TokenService } from '@/server/services/token.service';
import { AUTH_COOKIE_CONFIG } from '@/server/config/auth';

const tokenService = new TokenService();

export async function POST(request: Request) {
	try {
		// Get refresh token from request cookies
		const refreshToken = request.cookies.get('refresh_token')?.value;

		if (refreshToken) {
			// Revoke the refresh token in the database
			await tokenService.revokeRefreshToken(refreshToken);
		}

		// Create response
		const response = NextResponse.json({ success: true });

		// Clear auth cookies by setting them to expire immediately
		response.cookies.set('access_token', '', {
			...AUTH_COOKIE_CONFIG,
			maxAge: 0,
		});
		response.cookies.set('refresh_token', '', {
			...AUTH_COOKIE_CONFIG,
			maxAge: 0,
		});

		return response;
	} catch (error) {
		console.error('Logout error:', error);
		// Even if there's an error, try to clear cookies
		const response = NextResponse.json(
			{ error: 'خطأ في تسجيل الخروج' },
			{ status: 500 }
		);

		response.cookies.set('access_token', '', {
			...AUTH_COOKIE_CONFIG,
			maxAge: 0,
		});
		response.cookies.set('refresh_token', '', {
			...AUTH_COOKIE_CONFIG,
			maxAge: 0,
		});

		return response;
	}
}
