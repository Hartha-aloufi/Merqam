import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/server/middleware/auth';
import { NotesService } from '@/server/services/notes.service';
import { z } from 'zod';

const notesService = new NotesService();

// Validation schema for updates
const updateNoteSchema = z.object({
	content: z
		.string()
		.min(1, 'المحتوى مطلوب')
		.max(1000, 'المحتوى يجب أن لا يتجاوز 1000 حرف')
		.optional(),
	tags: z.array(z.string()).optional(),
});

async function handler(
	req: AuthenticatedRequest,
	{ params }: { params: { noteId: string } }
) {
	// GET specific note
	if (req.method === 'GET') {
		try {
			const note = await notesService.getNoteById(
				req.user.id,
				params.noteId
			);

			if (!note) {
				return NextResponse.json(
					{ error: 'الملاحظة غير موجودة' },
					{ status: 404 }
				);
			}

			return NextResponse.json({ note });
		} catch (error) {
			console.error('Failed to fetch note:', error);
			return NextResponse.json(
				{ error: 'حدث خطأ أثناء جلب الملاحظة' },
				{ status: 500 }
			);
		}
	}

	// PATCH/Update note
	if (req.method === 'PATCH') {
		try {
			const body = await req.json();
			const validatedData = updateNoteSchema.parse(body);

			const note = await notesService.getNoteById(
				req.user.id,
				params.noteId
			);
			if (!note) {
				return NextResponse.json(
					{ error: 'الملاحظة غير موجودة' },
					{ status: 404 }
				);
			}

			const updatedNote = await notesService.updateNote(
				req.user.id,
				params.noteId,
				validatedData
			);

			return NextResponse.json({ note: updatedNote });
		} catch (error) {
			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{ error: error.errors[0].message },
					{ status: 400 }
				);
			}

			console.error('Failed to update note:', error);
			return NextResponse.json(
				{ error: 'حدث خطأ أثناء تحديث الملاحظة' },
				{ status: 500 }
			);
		}
	}

	// DELETE note
	if (req.method === 'DELETE') {
		try {
			// Verify note exists and belongs to user
			const note = await notesService.getNoteById(
				req.user.id,
				params.noteId
			);
			if (!note) {
				return NextResponse.json(
					{ error: 'الملاحظة غير موجودة' },
					{ status: 404 }
				);
			}

			await notesService.deleteNote(req.user.id, params.noteId);
			return NextResponse.json({ success: true });
		} catch (error) {
			console.error('Failed to delete note:', error);
			return NextResponse.json(
				{ error: 'حدث خطأ أثناء حذف الملاحظة' },
				{ status: 500 }
			);
		}
	}

	return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = (
	req: NextRequest,
	context: { params: { noteId: string } }
) => withAuth(handler, req, context);

export const PATCH = (
	req: NextRequest,
	context: { params: { noteId: string } }
) => withAuth(handler, req, context);

export const DELETE = (
	req: NextRequest,
	context: { params: { noteId: string } }
) => withAuth(handler, req, context);
