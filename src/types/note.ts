export interface NoteTag {
	id: string;
	name: string;
	userId: string;
	createdAt: Date;
}

export interface Note {
	id: string;
	userId: string;
	topicId: string;
	lessonId: string;
	highlightId?: string | null;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	tags?: NoteTag[];
}

export interface CreateNoteDTO {
	topicId: string;
	lessonId: string;
	highlightId?: string;
	content: string;
	tags?: string[]; // Tag IDs
}

export interface UpdateNoteDTO {
	content?: string;
	tags?: string[]; // Tag IDs
}

export interface CreateTagDTO {
	name: string;
}

// API Response types
export interface NotesResponse {
	notes: Note[];
	total: number;
}

export interface NoteResponse {
	note: Note;
}

export interface TagsResponse {
	tags: NoteTag[];
}
