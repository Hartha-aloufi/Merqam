// src/app/api/highlights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/server/middleware/auth';
import { db } from '@/server/config/db';
import { sql } from 'kysely';
import { StoredHighlightData } from '@/types/highlight';

/**
 * Handler for all highlights operations
 * Supports GET and POST methods for fetching and updating highlights
 */
async function handler(req: AuthenticatedRequest) {
	// GET: Fetch highlights for a specific lesson
	if (req.method === 'GET') {
		try {
			const url = new URL(req.url);
			const lesson_id = url.searchParams.get('lesson_id');

			if (!lesson_id) {
				return NextResponse.json(
					{ error: 'Missing required parameters' },
					{ status: 400 }
				);
			}

			const result = await db
				.selectFrom('highlights')
				.where('user_id', '=', req.user.id)
				.where('lesson_id', '=', lesson_id)
				.select(['highlights'])
				.executeTakeFirst();

			if (!result) {
				return NextResponse.json({ highlights: [] });
			}

			const storedData = result.highlights as StoredHighlightData;
			const highlights = storedData.highlights || [];

			// Add group color information if exists
			if (storedData.groups) {
				highlights.forEach((highlight) => {
					if (
						highlight.groupId &&
						storedData.groups?.[highlight.groupId]
					) {
						highlight.color =
							storedData.groups[highlight.groupId].color;
					}
				});
			}

			return NextResponse.json({ highlights });
		} catch (error) {
			console.error('Failed to fetch highlights:', error);
			return NextResponse.json(
				{ error: 'Failed to fetch highlights' },
				{ status: 500 }
			);
		}
	}

	// POST: Update highlights for a lesson
	if (req.method === 'POST') {
		try {
			const {lesson_id, highlights } = await req.json();

			// Validate input
			if (!lesson_id || !Array.isArray(highlights)) {
				return NextResponse.json(
					{ error: 'Invalid request data' },
					{ status: 400 }
				);
			}

			// Extract and organize group information
			const groups: Record<string, { color: string }> = {};
			highlights.forEach((h) => {
				if (h.groupId) {
					groups[h.groupId] = { color: h.color };
				}
			});

			// Prepare the highlights data
			const highlightsData = {
				highlights,
				...(Object.keys(groups).length > 0 && { groups }),
			};

			// Store data with upsert operation
			await db
				.insertInto('highlights')
				.values({
					user_id: req.user.id,
					lesson_id,
					highlights: highlightsData,
					created_at: new Date(),
					updated_at: new Date(),
				})
				.onConflict((oc) =>
					oc
						.columns(['user_id', 'lesson_id'])
						.doUpdateSet({
							highlights: sql`${JSON.stringify(
								highlightsData
							)}::jsonb`,
							updated_at: new Date(),
						})
				)
				.execute();

			return NextResponse.json({ success: true });
		} catch (error) {
			console.error('Failed to update highlights:', error);
			return NextResponse.json(
				{ error: 'Failed to update highlights' },
				{ status: 500 }
			);
		}
	}

	return NextResponse.json(
		{ error: 'Method not supported' },
		{ status: 405 }
	);
}

export async function GET(req: NextRequest) {
	return withAuth(handler, req);
}

export async function POST(req: NextRequest) {
	return withAuth(handler, req);
}
