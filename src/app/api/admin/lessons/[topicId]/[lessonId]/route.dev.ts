// app/api/admin/lessons/[topicId]/[lessonId]/route.ts
import { NextResponse } from 'next/server';
import { getLesson } from '@/client/utils/mdx';
import path from 'path';
import fs from 'fs/promises';

// Mark as dynamic and development only
export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'src/data');

export async function GET(
	request: Request,
	{ params }: { params: { topicId: string; lessonId: string } }
) {
	try {
		const lesson = await getLesson(params.topicId, params.lessonId);
		if (!lesson) {
			return new NextResponse('Lesson not found', { status: 404 });
		}

		return NextResponse.json(lesson);
	} catch (error) {
		console.error('[ADMIN API] Error fetching lesson:', error);
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: { topicId: string; lessonId: string } }
) {
	try {
		const body = await request.json();

		// Validate incoming data
		if (!body.content) {
			return new NextResponse('Content is required', { status: 400 });
		}

		// Build file path
		const lessonPath = path.join(
			DATA_PATH,
			params.topicId,
			`${params.lessonId}.mdx`
		);

		// Check if file exists
		try {
			await fs.access(lessonPath);
		} catch {
			return new NextResponse('Lesson not found', { status: 404 });
		}

		// Update file
		try {
			await fs.writeFile(lessonPath, body.content, 'utf-8');

			// Return updated lesson
			const updatedLesson = await getLesson(
				params.topicId,
				params.lessonId
			);
			return NextResponse.json(updatedLesson);
		} catch (error) {
			console.error('[ADMIN API] Error writing file:', error);
			return new NextResponse('Failed to update lesson', { status: 500 });
		}
	} catch (error) {
		console.error('[ADMIN API] Error updating lesson:', error);
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
