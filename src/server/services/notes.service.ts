import { db } from '../config/db';
import { CreateNoteDTO, UpdateNoteDTO, CreateTagDTO } from '@/types/note';
import { sql } from 'kysely';

// Define an interface for the raw query result
interface RawNote {
	id: string;
	content: string;
	highlightId: string | null;
	lessonId: string;
	createdAt: Date;
	updatedAt: Date;
	tags: string | null; // SQL array_agg returns a string
}

export class NotesService {
	async getNotes(userId: string, lessonId: string) {
		const notes = (await db
			.selectFrom('notes')
			.leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
			.leftJoin('note_tags', 'notes_tags.tag_id', 'note_tags.id')
			.select([
				'notes.id',
				'notes.content',
				'notes.highlight_id as highlightId',
				'notes.lesson_id as lessonId',
				'label_color as labelColor',
				'notes.created_at as createdAt',
				'notes.updated_at as updatedAt',
				sql<string>`jsonb_agg(
                jsonb_build_object(
                    'id', note_tags.id,
                    'name', note_tags.name,
                    'userId', note_tags.user_id,
                    'createdAt', note_tags.created_at
                )
            ) FILTER (WHERE note_tags.id IS NOT NULL)`.as('tags'),
			])
			.where('notes.user_id', '=', userId)
			.where('notes.lesson_id', '=', lessonId)
			.groupBy([
				'notes.id',
				'notes.content',
				'notes.highlight_id',
				'notes.created_at',
				'notes.updated_at',
				'notes.lesson_id',
			])
			.orderBy('notes.created_at', 'desc')
			.execute()) as unknown as RawNote[];

		return notes.map((note) => ({
			...note,
			tags: note.tags ? note.tags : [], // jsonb_agg already produces an array
		}));
	}

	async getNoteById(userId: string, noteId: string) {
		const note = (await db
			.selectFrom('notes')
			.where('notes.id', '=', noteId)
			.where('notes.user_id', '=', userId)
			.leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
			.leftJoin('note_tags', 'notes_tags.tag_id', 'note_tags.id')
			.select([
				'notes.id',
				'notes.content',
				'notes.highlight_id as highlightId',
				'notes.lesson_id as lessonId',
				'notes.created_at as createdAt',
				'notes.updated_at as updatedAt',
				'notes.label_color as labelColor',
				sql<string>`jsonb_agg(
                jsonb_build_object(
                    'id', note_tags.id,
                    'name', note_tags.name,
                    'userId', note_tags.user_id,
                    'createdAt', note_tags.created_at
                )
            ) FILTER (WHERE note_tags.id IS NOT NULL)`.as('tags'),
			])
			.groupBy([
				'notes.id',
				'notes.content',
				'notes.highlight_id',
				'notes.created_at',
				'notes.updated_at',
				'notes.lesson_id',
			])
			.executeTakeFirst()) as unknown as RawNote | undefined;

		if (!note) return null;

		return {
			...note,
			tags: note.tags ? note.tags : [], // jsonb_agg already produces an array
		};
	}

	async createNote(userId: string, data: CreateNoteDTO) {
		// Start transactions
		const newNoteId = await db.transaction().execute(async (trx) => {
			// Check if highlight already has a note
			if (data.highlightId) {
				const existingNote = await trx
					.selectFrom('notes')
					.where('highlight_id', '=', data.highlightId)
					.executeTakeFirst();

				if (existingNote) {
					throw new Error('هذا التظليل مرتبط بملاحظة أخرى');
				}
			}

			// Create note
			const [note] = await trx
				.insertInto('notes')
				.values({
					user_id: userId,
					lesson_id: data.lessonId,
					highlight_id: data.highlightId,
					content: data.content,
					label_color: data.labelColor,
				})
				.returning([
					'id',
					'content',
					'highlight_id as highlightId',
					'label_color as labelColor',
					'lesson_id as lessonId',
					'created_at as createdAt',
					'updated_at as updatedAt',
				])
				.execute();

			// If tags provided, create note-tag associations
			if (data.tags?.length) {
				await trx
					.insertInto('notes_tags')
					.values(
						data.tags.map((tagId) => ({
							note_id: note.id,
							tag_id: tagId,
						}))
					)
					.execute();
			}

			// Return complete note with tags
			return note.id;
		});

		return this.getNoteById(userId, newNoteId);
	}

	async updateNote(userId: string, noteId: string, data: UpdateNoteDTO) {
		// Prepare update data
		const updateData: Record<string, any> = {
			updated_at: new Date(),
		};

		if (data.content) {
			updateData.content = data.content;
		}

		if (data.labelColor !== undefined) {
			updateData.label_color = data.labelColor;
		}

		return await db.transaction().execute(async (trx) => {
			// Update note content if provided
			if (data.content) {
				await trx
					.updateTable('notes')
					.set(updateData)
					.where('id', '=', noteId)
					.where('user_id', '=', userId)
					.execute();
			}

			// Update tags if provided
			if (data.tags) {
				// Remove existing tags
				await trx
					.deleteFrom('notes_tags')
					.where('note_id', '=', noteId)
					.execute();

				// Add new tags
				if (data.tags.length > 0) {
					await trx
						.insertInto('notes_tags')
						.values(
							data.tags.map((tagId) => ({
								note_id: noteId,
								tag_id: tagId,
							}))
						)
						.execute();
				}
			}

			// Return updated note
			return this.getNoteById(userId, noteId);
		});
	}

	async deleteNote(userId: string, noteId: string) {
		await db
			.deleteFrom('notes')
			.where('id', '=', noteId)
			.where('user_id', '=', userId)
			.execute();
	}

	async createTag(userId: string, data: CreateTagDTO) {
		const [tag] = await db
			.insertInto('note_tags')
			.values({
				user_id: userId,
				name: data.name,
			})
			.returning([
				'id',
				'name',
				'user_id as userId',
				'created_at as createdAt',
			])
			.execute();

		return tag;
	}

	async getUserTags(userId: string) {
		return await db
			.selectFrom('note_tags')
			.where('user_id', '=', userId)
			.select([
				'id',
				'name',
				'user_id as userId',
				'created_at as createdAt',
			])
			.orderBy('name')
			.execute();
	}

	async deleteTag(userId: string, tagId: string) {
		await db
			.deleteFrom('note_tags')
			.where('id', '=', tagId)
			.where('user_id', '=', userId)
			.execute();
	}
}
