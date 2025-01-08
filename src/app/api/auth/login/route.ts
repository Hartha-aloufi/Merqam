// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { UserService } from '@/server/services/user.service';
import { AppError } from '@/server/lib/errors';
import { loginSchema } from '@/server/lib/validation/auth';
import { z } from 'zod';
import { AUTH_COOKIE_CONFIG } from '@/server/config/auth';

const userService = new UserService();

export async function POST(request: Request) {
	try {
		const body = await request.json();

		// Validate input
		const validatedData = loginSchema.parse(body);

		// Attempt login
		const result = await userService.login(
			validatedData.email,
			validatedData.password
		);

		// Create response
		const response = NextResponse.json({ user: result.user });

		// Set cookies in the response
		response.cookies.set(
			'access_token',
			result.accessToken,
			AUTH_COOKIE_CONFIG
		);
		response.cookies.set(
			'refresh_token',
			result.refreshToken,
			AUTH_COOKIE_CONFIG
		);

		return response;
	} catch (error) {
		console.error('Login error:', error);

		if (error instanceof AppError) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode }
			);
		}

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: error.errors[0].message },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: 'Invalid credentials' },
			{ status: 401 }
		);
	}
}
