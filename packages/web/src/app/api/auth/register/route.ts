// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { UserService } from '@/server/services/user.service';
import { AppError } from '@/server/lib/errors';
import { registerSchema } from '@/server/lib/validation/auth';
import { z } from 'zod';

const userService = new UserService();

export async function POST(request: Request) {
	try {
		const body = await request.json();

		// Validate input
		const validatedData = registerSchema.parse(body);

		// Create user
		const result = await userService.createUser(validatedData);

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

		console.error('Registration error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
