// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/server/middleware/auth';
import { db } from '@/server/config/db';

async function handler(req: AuthenticatedRequest) {
	try {
		const user = await db
			.selectFrom('users')
			.where('id', '=', req.user.id)
			.select(['id', 'email', 'name', 'created_at'])
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
			{ error: 'Failed to fetch profile' },
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
	return withAuth(handler, req);
}
