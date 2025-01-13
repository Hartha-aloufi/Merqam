export type NoteView = 'all' | 'single';

export interface Note {
	id: string;
	highlightId: string;
	content: string;
	highlightText: string; // Add highlighted text
	createdAt: string;
	updatedAt: string;
}

export interface NotesState {
	notes: Note[];
	isOpen: boolean;
	view: NoteView;
	activeHighlightId: string | null;
}

export type NotesAction =
	| { type: 'SET_NOTE'; payload: Note }
	| { type: 'DELETE_NOTE'; payload: string }
	| { type: 'SET_ACTIVE_HIGHLIGHT'; payload: string | null }
	| { type: 'SET_VIEW'; payload: NoteView }
	| { type: 'OPEN_SHEET' }
	| { type: 'CLOSE_SHEET' };
