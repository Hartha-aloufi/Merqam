// src/app/api/test/route.ts
import { db } from '@/server/config/db';
import {  NextResponse } from 'next/server';

export async function GET() {
	try {
		// Test database connection by counting users
		const result = await db
			.selectFrom('users')
			.select(db.fn.count('id').as('count'))
			.executeTakeFirst();

		return NextResponse.json({
			message: 'Database connected successfully',
			usersCount: Number(result?.count || 0),
		});
	} catch (error) {
		console.error('Database connection error:', error);
		return NextResponse.json(
			{
				error: 'Database connection failed',
				details:
					error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
