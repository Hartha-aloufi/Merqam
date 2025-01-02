// src/app/api/highlights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { db } from '@/server/config/db';

async function handler(req: AuthenticatedRequest) {
	const userId = req.user.id;
	const { topic_id, lesson_id } = await req.json();

	try {
		const highlights = await db
			.selectFrom('highlights')
			.where('user_id', '=', userId)
			.where('topic_id', '=', topic_id)
			.where('lesson_id', '=', lesson_id)
			.selectAll()
			.execute();

		return NextResponse.json(highlights);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to fetch highlights' },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	return withAuth(handler, req);
}
