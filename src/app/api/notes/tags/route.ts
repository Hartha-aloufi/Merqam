import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/server/middleware/auth';
import { NotesService } from '@/server/services/notes.service';
import { z } from 'zod';

const notesService = new NotesService();

// Validation schema
const createTagSchema = z.object({
	name: z
		.string()
		.min(1, 'اسم التصنيف مطلوب')
		.max(50, 'اسم التصنيف يجب أن لا يتجاوز 50 حرف')
		.regex(
			/^[\u0600-\u06FFa-zA-Z0-9\s-_]+$/,
			'اسم التصنيف يجب أن يحتوي على حروف وأرقام فقط'
		),
});

async function handler(req: AuthenticatedRequest) {
	// GET tags
	if (req.method === 'GET') {
		try {
			const tags = await notesService.getUserTags(req.user.id);
			return NextResponse.json({ tags });
		} catch (error) {
			console.error('Failed to fetch tags:', error);
			return NextResponse.json(
				{ error: 'حدث خطأ أثناء جلب التصنيفات' },
				{ status: 500 }
			);
		}
	}

	// POST new tag
	if (req.method === 'POST') {
		try {
			const body = await req.json();
			const validatedData = createTagSchema.parse(body);

			const tag = await notesService.createTag(
				req.user.id,
				validatedData
			);
			return NextResponse.json({ tag }, { status: 201 });
		} catch (error) {
			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{ error: error.errors[0].message },
					{ status: 400 }
				);
			}

			// Handle unique constraint violation
			if (
				error instanceof Error &&
				error.message.includes('unique constraint')
			) {
				return NextResponse.json(
					{ error: 'هذا التصنيف موجود مسبقاً' },
					{ status: 400 }
				);
			}

			console.error('Failed to create tag:', error);
			return NextResponse.json(
				{ error: 'حدث خطأ أثناء إنشاء التصنيف' },
				{ status: 500 }
			);
		}
	}

	return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = (req: NextRequest) => withAuth(handler, req);
export const POST = (req: NextRequest) => withAuth(handler, req);
