import { HighlightColorKey } from '@/constants/highlights';

export interface NoteTag {
	id: string;
	name: string;
	userId: string;
	createdAt: Date;
}

export interface Note {
	id: string;
	userId: string;
	lessonId: string;
	highlightId?: string | null;
	content: string;
	labelColor?: HighlightColorKey;
	createdAt: Date;
	updatedAt: Date;
	tags?: NoteTag[];
}

export interface CreateNoteDTO {
	lessonId: string;
	highlightId?: string;
	content: string;
	labelColor?: HighlightColorKey;
	tags?: string[]; // Tag IDs
}

export interface UpdateNoteDTO {
	content?: string;
	labelColor?: HighlightColorKey | null;
	tags?: string[]; // Tag IDs
}

export interface CreateTagDTO {
	name: string;
}
