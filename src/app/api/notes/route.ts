import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/server/middleware/auth';
import { NotesService } from '@/server/services/notes.service';
import { z } from 'zod';

const notesService = new NotesService();

// Validation schemas
const createNoteSchema = z.object({
	topicId: z.string().min(1, 'معرف الموضوع مطلوب'),
	lessonId: z.string().min(1, 'معرف الدرس مطلوب'),
	highlightId: z.string().optional(),
	content: z
		.string()
		.min(1, 'المحتوى مطلوب')
		.max(1000, 'المحتوى يجب أن لا يتجاوز 1000 حرف'),
	tags: z.array(z.string()).optional(),
});

// Query params schema
const getNotesQuerySchema = z.object({
	lessonId: z.string({
		required_error: 'معرف الدرس مطلوب',
		invalid_type_error: 'معرف الدرس غير صالح',
	}),
	page: z.string().transform(Number).default('1'),
	limit: z.string().transform(Number).default('50'),
});

async function handler(req: AuthenticatedRequest) {
	// GET: Fetch notes
	if (req.method === 'GET') {
		try {
			const url = new URL(req.url);
			const queryResult = getNotesQuerySchema.safeParse({
				lessonId: url.searchParams.get('lessonId'),
				page: url.searchParams.get('page'),
				limit: url.searchParams.get('limit'),
			});

			if (!queryResult.success) {
				return NextResponse.json(
					{ error: queryResult.error.issues[0].message },
					{ status: 400 }
				);
			}

			const { lessonId, page, limit } = queryResult.data;

			const notes = await notesService.getNotes(req.user.id, lessonId);
			return NextResponse.json({
				notes,
				pagination: {
					page,
					limit,
					total: notes.length,
				},
			});
		} catch (error) {
			console.error('Failed to fetch notes:', error);
			return NextResponse.json(
				{ error: 'حدث خطأ أثناء جلب الملاحظات' },
				{ status: 500 }
			);
		}
	}

	// POST: Create new note
	if (req.method === 'POST') {
		try {
			const body = await req.json();
			const validationResult = createNoteSchema.safeParse(body);

			if (!validationResult.success) {
				return NextResponse.json(
					{ error: validationResult.error.issues[0].message },
					{ status: 400 }
				);
			}

			// Check if note limit is reached (moved to database trigger)
			const note = await notesService.createNote(
				req.user.id,
				validationResult.data
			);

			return NextResponse.json({ note }, { status: 201 });
		} catch (error) {
			if (error instanceof Error) {
				// Handle database constraint errors
				if (error.message.includes('Maximum number of notes')) {
					return NextResponse.json(
						{
							error: 'لقد وصلت للحد الأقصى من الملاحظات لهذا الدرس (200)',
						},
						{ status: 400 }
					);
				}

				// Handle other known errors
				if (error.message.includes('Highlight not found')) {
					return NextResponse.json(
						{ error: 'التظليل المحدد غير موجود' },
						{ status: 400 }
					);
				}
			}

			console.error('Failed to create note:', error);
			return NextResponse.json(
				{ error: 'حدث خطأ أثناء إنشاء الملاحظة' },
				{ status: 500 }
			);
		}
	}

	// Method not allowed
	return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = (req: NextRequest) => withAuth(handler, req);
export const POST = (req: NextRequest) => withAuth(handler, req);
