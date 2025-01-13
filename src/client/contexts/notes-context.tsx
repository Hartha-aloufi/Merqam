import React, { createContext, useContext, useReducer } from 'react';
import { Note, NotesState, NotesAction } from '@/types/note';

const initialState: NotesState = {
	notes: [],
	isOpen: false,
	view: 'all',
	activeHighlightId: null,
};

function notesReducer(state: NotesState, action: NotesAction): NotesState {
	switch (action.type) {
		case 'SET_NOTE':
			// Remove any existing note for the same highlight
			const notes = state.notes.filter(
				(note) => note.highlightId !== action.payload.highlightId
			);
			return {
				...state,
				notes: [...notes, action.payload],
			};
		case 'DELETE_NOTE':
			return {
				...state,
				notes: state.notes.filter((note) => note.id !== action.payload),
			};
		case 'SET_ACTIVE_HIGHLIGHT':
			return {
				...state,
				activeHighlightId: action.payload,
			};
		case 'SET_VIEW':
			return {
				...state,
				view: action.payload,
			};
		case 'OPEN_SHEET':
			return {
				...state,
				isOpen: true,
			};
		case 'CLOSE_SHEET':
			return {
				...state,
				isOpen: false,
				view: 'all',
				activeHighlightId: null,
			};
		default:
			return state;
	}
}

const NotesContext = createContext<NotesContextValue | null>(null);

interface NotesContextValue {
	state: NotesState;
	dispatch: React.Dispatch<NotesAction>;
	actions: {
		addNote: (content: string) => void;
		updateNote: (id: string, content: string) => void;
		deleteNote: (id: string) => void;
		setActiveHighlight: (highlightId: string | null) => void;
		setView: (view: 'all' | 'single') => void;
		openEditor: (highlightId: string) => void;
		closeEditor: () => void;
		openAllNotes: () => void;
	};
}

export function NotesProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(notesReducer, initialState);

	const actions = {
		addNote: (content: string) => {
			if (!state.activeHighlightId) return;

			const newNote: Note = {
				id: crypto.randomUUID(),
				highlightId: state.activeHighlightId,
				content,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			dispatch({ type: 'SET_NOTE', payload: newNote });
		},
		updateNote: (id: string, content: string) => {
			const note = state.notes.find((n) => n.id === id);
			if (!note) return;

			dispatch({
				type: 'SET_NOTE',
				payload: {
					...note,
					content,
					updatedAt: new Date().toISOString(),
				},
			});
		},
		deleteNote: (id: string) => {
			dispatch({ type: 'DELETE_NOTE', payload: id });
		},
		setActiveHighlight: (highlightId: string | null) => {
			dispatch({ type: 'SET_ACTIVE_HIGHLIGHT', payload: highlightId });
		},
		setView: (view: 'all' | 'single') => {
			dispatch({ type: 'SET_VIEW', payload: view });
		},
		openEditor: (highlightId: string) => {
			dispatch({ type: 'SET_ACTIVE_HIGHLIGHT', payload: highlightId });
			dispatch({ type: 'SET_VIEW', payload: 'single' });
			dispatch({ type: 'OPEN_SHEET' });
		},
		closeEditor: () => {
			dispatch({ type: 'CLOSE_SHEET' });
		},
		openAllNotes: () => {
			dispatch({ type: 'SET_VIEW', payload: 'all' });
			dispatch({ type: 'OPEN_SHEET' });
		},
	};

	return (
		<NotesContext.Provider value={{ state, dispatch, actions }}>
			{children}
		</NotesContext.Provider>
	);
}

export function useNotes() {
	const context = useContext(NotesContext);
	if (!context) {
		throw new Error('useNotes must be used within a NotesProvider');
	}
	return context;
}
