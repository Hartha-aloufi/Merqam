import { httpClient } from '../lib/http-client';
import type {
	Note,
	CreateNoteDTO,
	UpdateNoteDTO,
	NoteTag,
	CreateTagDTO,
} from '@/types/note';

export class NotesClientService {
	private baseUrl = '/notes';

	async getNotes(lessonId: string): Promise<Note[]> {
		const { data } = await httpClient.get(`${this.baseUrl}`, {
			params: { lessonId },
		});
		return data.notes;
	}

	async getNote(noteId: string): Promise<Note> {
		const { data } = await httpClient.get(`${this.baseUrl}/${noteId}`);
		return data.note;
	}

	async getHighlightNote(highlightId: string): Promise<Note | null> {
		try {
			const { data } = await httpClient.get(`/notes`, {
				params: { highlightId },
			});
			return data.notes[0] || null;
		} catch (error) {
			console.error('Error fetching highlight note:', error);
			return null;
		}
	}

	async createNote(noteData: CreateNoteDTO): Promise<Note> {
		const { data } = await httpClient.post(`${this.baseUrl}`, noteData);
		return data.note;
	}

	async updateNote(noteId: string, noteData: UpdateNoteDTO): Promise<Note> {
		const { data } = await httpClient.patch(
			`${this.baseUrl}/${noteId}`,
			noteData
		);
		return data.note;
	}

	async deleteNote(noteId: string): Promise<void> {
		await httpClient.delete(`${this.baseUrl}/${noteId}`);
	}

	async getTags(): Promise<NoteTag[]> {
		const { data } = await httpClient.get(`${this.baseUrl}/tags`);
		return data.tags;
	}

	async createTag(tagData: CreateTagDTO): Promise<NoteTag> {
		const { data } = await httpClient.post(`${this.baseUrl}/tags`, tagData);
		return data.tag;
	}
}

export const notesService = new NotesClientService();
