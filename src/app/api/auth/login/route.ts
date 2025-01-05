// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { UserService } from '@/server/services/user.service';
import { AppError } from '@/server/lib/errors';
import { loginSchema } from '@/server/lib/validation/auth';
import { z } from 'zod';

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

		return NextResponse.json(result);
	} catch (error) {
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

		console.error('Login error:', error);
		return NextResponse.json(
			{ error: 'Invalid credentials' },
			{ status: 401 }
		);
	}
}
