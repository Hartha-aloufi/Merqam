// src/client/components/lessons/margin-notes/InlineNoteList.tsx
'use client';

import React, { useLayoutEffect, useMemo, useState } from 'react';
import { InlineNoteCard } from './InlineNoteCard';
import {
	alignNotesWithHighlights,
	createInlineNoteElId,
} from '@/client/hooks/notes/use-inline-note-positions';
import { useNotes } from '@/client/hooks/use-notes';

interface InlineNoteListProps {
	lessonId: string;
}

/**
 * Manages the list of inline notes, handling their positioning relative to highlights
 */
export function InlineNoteList({ lessonId }: InlineNoteListProps) {
	const { data: notes } = useNotes(lessonId);
	const [notePositions, setNotePositions] = useState<Map<string, number>>(
		new Map()
	);

	/**
	 * Update note positions when notes change
	 */
	useLayoutEffect(() => {
		// wait for notes to be rendered since they depend on the DOM
		setTimeout(() => {
			setNotePositions(alignNotesWithHighlights(notes));
		}, 1000);
	}, [notes]);

	const notesItems = useMemo(() => {
		return notes
		// we will render the notes in the order of their position, 
		// so when overlapping happen (while editing a note), the note will go on top of the next note
			?.sort((a, b) => {
				return (notePositions.get(b.id) ?? 0) - (notePositions.get(a.id) ?? 0);
			})
			.map((note) => {
				const top = notePositions.get(note.id) || 0;

				return (
					<div
						key={note.id}
						id={createInlineNoteElId(note.id)}
						className="absolute left-0 pointer-events-auto"
						style={{
							top,
							transition: 'top 200ms ease',
						}}
					>
						<InlineNoteCard
							note={note}
							lessonId={lessonId}
						/>
					</div>
				);
			});
	}, [notes, notePositions, lessonId]);

	return <div className="w-full h-full relative">{notesItems}</div>;
}
