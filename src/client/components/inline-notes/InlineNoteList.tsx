// src/client/components/lessons/margin-notes/InlineNoteList.tsx
'use client';

import React, {useLayoutEffect, useState } from 'react';
import { InlineNoteCard } from './InlineNoteCard';
import {
	alignNotesWithHighlights,
	createInlineNoteElId,
} from '@/client/hooks/notes/use-inline-note-positions';
import { useNotes } from '@/client/hooks/use-notes';

interface InlineNoteListProps {
	lessonId: string;
	topicId: string;
}

/**
 * Manages the list of inline notes, handling their positioning relative to highlights
 */
export function InlineNoteList({ lessonId, topicId }: InlineNoteListProps) {
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
		}, 500);
	}, [notes]);

	return (
		<div className="w-full h-full relative">
			{notes?.map((note) => {
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
							topicId={topicId}
							lessonId={lessonId}
						/>
					</div>
				);
			})}
		</div>
	);
}
