// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/config/db';
import { verifyToken } from '@/server/lib/auth/jwt';

export async function GET(request: NextRequest) {
	try {
		// Get access token from cookies
		const accessToken = request.cookies.get('access_token')?.value;

		// If no token, return null instead of error
		if (!accessToken) {
			return NextResponse.json(null);
		}

		// Verify token and get user data
		try {
			const payload = verifyToken(accessToken);

			const user = await db
				.selectFrom('users')
				.where('id', '=', payload.userId)
				.select(['id', 'email', 'name'])
				.executeTakeFirst();

			return NextResponse.json(user);
		} catch {
			// Token verification failed or user not found - return null
			return NextResponse.json(null);
		}
	} catch (error) {
		console.error('Profile fetch error:', error);
		// For any other errors, return null as well
		return NextResponse.json(null);
	}
}
