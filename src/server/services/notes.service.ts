import { db } from '../config/db';
import { CreateNoteDTO, UpdateNoteDTO, CreateTagDTO } from '@/types/note';
import { sql } from 'kysely';

// Define an interface for the raw query result
interface RawNote {
	id: string;
	content: string;
	highlightId: string | null;
	topicId: string;
	lessonId: string;
	createdAt: Date;
	updatedAt: Date;
	tags: string | null; // SQL array_agg returns a string
}

export class NotesService {
	async getNotes(userId: string, lessonId: string) {
		const notes = (await db
			.selectFrom('notes')
			.where('notes.user_id', '=', userId)
			.where('notes.lesson_id', '=', lessonId)
			.leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
			.leftJoin('note_tags', 'notes_tags.tag_id', 'note_tags.id')
			.select([
				'notes.id',
				'notes.content',
				'notes.highlight_id as highlightId',
				'notes.topic_id as topicId',
				'notes.lesson_id as lessonId',
				'notes.created_at as createdAt',
				'notes.updated_at as updatedAt',
				sql<string>`
                    array_agg(
                        CASE 
                            WHEN note_tags.id IS NOT NULL 
                            THEN jsonb_build_object(
                                'id', note_tags.id,
                                'name', note_tags.name,
                                'userId', note_tags.user_id,
                                'createdAt', note_tags.created_at
                            )
                            ELSE NULL 
                        END
                    ) FILTER (WHERE note_tags.id IS NOT NULL)
                `.as('tags'),
			])
			.groupBy([
				'notes.id',
				'notes.content',
				'notes.highlight_id',
				'notes.created_at',
				'notes.updated_at',
				'notes.topic_id',
				'notes.lesson_id',
			])
			.orderBy('notes.created_at', 'desc')
			.execute()) as unknown as RawNote[];

		return notes.map((note) => ({
			...note,
			tags: note.tags ? JSON.parse(note.tags) : [],
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
				'notes.topic_id as topicId',
				'notes.lesson_id as lessonId',
				'notes.created_at as createdAt',
				'notes.updated_at as updatedAt',
				sql<string>`
                    array_agg(
                        CASE 
                            WHEN note_tags.id IS NOT NULL 
                            THEN jsonb_build_object(
                                'id', note_tags.id,
                                'name', note_tags.name,
                                'userId', note_tags.user_id,
                                'createdAt', note_tags.created_at
                            )
                            ELSE NULL 
                        END
                    ) FILTER (WHERE note_tags.id IS NOT NULL)
                `.as('tags'),
			])
			.groupBy([
				'notes.id',
				'notes.content',
				'notes.highlight_id',
				'notes.created_at',
				'notes.updated_at',
				'notes.topic_id',
				'notes.lesson_id',
			])
			.executeTakeFirst()) as unknown as RawNote | undefined;

		if (!note) return null;

		return {
			...note,
			tags: note.tags ? JSON.parse(note.tags) : [],
		};
	}

	async createNote(userId: string, data: CreateNoteDTO) {
		// Start transaction
		const newNoteId = await db.transaction().execute(async (trx) => {
			// Create note
			const [note] = await trx
				.insertInto('notes')
				.values({
					user_id: userId,
					topic_id: data.topicId,
					lesson_id: data.lessonId,
					highlight_id: data.highlightId,
					content: data.content,
				})
				.returning([
					'id',
					'content',
					'highlight_id as highlightId',
					'topic_id as topicId',
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
		return await db.transaction().execute(async (trx) => {
			// Update note content if provided
			if (data.content) {
				await trx
					.updateTable('notes')
					.set({
						content: data.content,
						updated_at: new Date(),
					})
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
