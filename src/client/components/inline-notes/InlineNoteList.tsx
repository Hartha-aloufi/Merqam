// src/client/components/lessons/margin-notes/InlineNoteList.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Note } from '@/types/note';
import { InlineNoteCard } from './InlineNoteCard';
import { useInlineNotePositions } from '@/client/hooks/notes/use-inline-note-positions';
import { useNotes } from '@/client/hooks/use-notes';

interface InlineNoteListProps {
	lessonId: string;
	topicId: string;
}

/**
 * Manages the list of inline notes, handling their positioning relative to highlights
 */
export function InlineNoteList({ lessonId, topicId }: InlineNoteListProps) {
	const { getNotePosition } = useInlineNotePositions();
	const { data: notes } = useNotes(lessonId);

	// Track note positions for animation and layout
	const [notePositions, setNotePositions] = useState<Map<string, number>>(
		new Map()
	);

	// Update positions when notes change or on scroll
	useEffect(() => {
		const updatePositions = () => {
			const newPositions = new Map<string, number>();

			notes?.forEach((note, idx) => {
				if (note.highlightId) {
					let prevCard: { top: number; height: number } | null = null;

					if (idx > 0) {
						prevCard = {
							top: notePositions.get(notes[idx - 1].id) || 0,
							height: 100,
						};
					}
					const position = getNotePosition(
						note.highlightId,
						prevCard || undefined
					);
					if (position) {
						newPositions.set(note.id, position);
					}
				}
			});

			setNotePositions(newPositions);
		};

		// Initial update
		updatePositions();

		// Update on scroll
		const handleScroll = () => {
			requestAnimationFrame(updatePositions);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [notes, getNotePosition]);

	return (
		<div className="w-full h-full relative">
			{notes?.map((note) => {
				const top = notePositions.get(note.id);

				if (!top) return null;

				return (
					<div
						key={note.id}
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
