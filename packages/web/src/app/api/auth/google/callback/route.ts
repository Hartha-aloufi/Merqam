// src/app/api/auth/google/callback/route.ts
import { NextResponse } from 'next/server';
import {  AUTH_COOKIE_CONFIG } from '@/server/config/auth';
import { GoogleAuthService } from '@/server/services/google-auth.service';
import { AppError } from '@/server/lib/errors';

const googleAuthService = new GoogleAuthService();

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const code = searchParams.get('code');

		if (!code) {
			throw new AppError('Authorization code is missing', 400);
		}

		const { tokens } = await googleAuthService.handleCallback(code);

		// Create response with redirect
		const response = NextResponse.redirect(
			new URL('/auth/callback', request.url)
		);

		// Set cookies in the response
		response.cookies.set(
			'access_token',
			tokens.accessToken,
			AUTH_COOKIE_CONFIG
		);
		response.cookies.set(
			'refresh_token',
			tokens.refreshToken,
			AUTH_COOKIE_CONFIG
		);

		return response;
	} catch (error) {
		console.error('Google auth callback error:', error);
		return NextResponse.redirect(new URL('/auth/error', request.url));
	}
}
