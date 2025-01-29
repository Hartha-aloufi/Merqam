import { create } from 'zustand';

interface NoteDrawerState {
	isOpen: boolean;
	noteId?: string;
	highlightId?: string;
	open: (params?: { noteId?: string; highlightId?: string }) => void;
	close: () => void;
}

export const useNoteDrawer = create<NoteDrawerState>((set) => ({
	isOpen: false,
	noteId: undefined,
	highlightId: undefined,
	open: (params) => set({ isOpen: true, ...params }),
	close: () =>
		set({ isOpen: false, noteId: undefined, highlightId: undefined }),
}));
