// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/server/middleware/auth';
import { db } from '@/server/config/db';

async function handler(req: AuthenticatedRequest) {
	try {
		// Get user data from database
		const user = await db
			.selectFrom('users')
			.where('id', '=', req.user.id)
			.select(['id', 'email', 'name'])
			.executeTakeFirst();

		if (!user) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error('Profile fetch error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export function GET(req: NextRequest) {
	return withAuth(handler, req);
}
