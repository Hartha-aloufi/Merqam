import { create } from 'zustand';

type View = 'list' | 'editor';

interface NotesSheetState {
	isOpen: boolean;
	view: View;
	selectedNoteId: string | null;
	highlightId: string | null;
	open: (highlightId?: string) => void;
	close: () => void;
	setView: (view: View) => void;
	setSelectedNoteId: (id: string | null) => void;
}

export const useNotesSheet = create<NotesSheetState>((set) => ({
	isOpen: false,
	view: 'list',
	selectedNoteId: null,
	highlightId: null,
	open: (highlightId) =>
		set({
			isOpen: true,
			highlightId: highlightId || null,
			// Reset view to list when opening without highlight
			view: highlightId ? 'editor' : 'list',
		}),
	close: () =>
		set({
			isOpen: false,
			view: 'list',
			selectedNoteId: null,
			highlightId: null,
		}),
	setView: (view) => set({ view }),
	setSelectedNoteId: (id) => set({ selectedNoteId: id }),
}));
