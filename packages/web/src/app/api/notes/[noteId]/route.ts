import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/server/middleware/auth';
import { NotesService } from '@/server/services/notes.service';
import { z } from 'zod';

const notesService = new NotesService();

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
	context: { params: { noteId: string } }
) {
	const {noteId} = await context.params;

	if (req.method === 'GET') {
		const note = await notesService.getNoteById(
			req.user.id,
			noteId
		);

		if (!note) {
			return NextResponse.json(
				{ error: 'الملاحظة غير موجودة' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ note });
	}

	if (req.method === 'PATCH') {
		const body = await req.json();
		const validationResult = updateNoteSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{ error: validationResult.error.issues[0].message },
				{ status: 400 }
			);
		}

		const note = await notesService.getNoteById(
			req.user.id,
			noteId
		);
		if (!note) {
			return NextResponse.json(
				{ error: 'الملاحظة غير موجودة' },
				{ status: 404 }
			);
		}

		const updatedNote = await notesService.updateNote(
			req.user.id,
			noteId,
			validationResult.data
		);

		return NextResponse.json({ note: updatedNote });
	}

	if (req.method === 'DELETE') {
		const note = await notesService.getNoteById(
			req.user.id,
			noteId
		);
		if (!note) {
			return NextResponse.json(
				{ error: 'الملاحظة غير موجودة' },
				{ status: 404 }
			);
		}

		await notesService.deleteNote(req.user.id, noteId);
		return NextResponse.json({ success: true });
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
