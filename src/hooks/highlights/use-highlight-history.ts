// hooks/highlights/use-highlight-history.ts
import { useCallback, useRef } from 'react';
import { HighlightItem } from '@/types/highlight';
import { HighlightColorKey } from '@/constants/highlights';

interface HighlightCommand {
	execute: () => void;
	undo: () => void;
}

export const useHighlightHistory = (
	highlights: HighlightItem[],
	batchUpdate: (newHighlights: HighlightItem[]) => void
) => {
	const undoStack = useRef<HighlightCommand[]>([]);
	const redoStack = useRef<HighlightCommand[]>([]);

	const executeCommand = useCallback((command: HighlightCommand) => {
		command.execute();
		undoStack.current.push(command);
		redoStack.current = [];
	}, []);

	// Single highlight
	const addHighlight = useCallback(
		(highlight: Omit<HighlightItem, 'updatedAt'>) => {
			const now = new Date().toISOString();
			const fullHighlight: HighlightItem = {
				...highlight,
				updatedAt: now,
			};

			const command: HighlightCommand = {
				execute: () => {
					batchUpdate([...highlights, fullHighlight]);
				},
				undo: () => {
					batchUpdate(
						highlights.filter((h) => h.id !== fullHighlight.id)
					);
				},
			};
			executeCommand(command);
		},
		[highlights, batchUpdate, executeCommand]
	);

	// Batch highlights
	const batchAddHighlights = useCallback(
		(
			newHighlights: Omit<
				HighlightItem,
				'id' | 'createdAt' | 'updatedAt' | 'groupId'
			>[]
		) => {
			const now = new Date().toISOString();
			const groupId = crypto.randomUUID();

			const highlightsToAdd = newHighlights.map((highlight) => ({
				...highlight,
				id: crypto.randomUUID(),
				groupId,
				createdAt: now,
				updatedAt: now,
			}));

			const command: HighlightCommand = {
				execute: () => {
					batchUpdate([...highlights, ...highlightsToAdd]);
				},
				undo: () => {
					batchUpdate(
						highlights.filter(
							(h) => !highlightsToAdd.some((nh) => nh.id === h.id)
						)
					);
				},
			};
			executeCommand(command);
		},
		[highlights, batchUpdate, executeCommand]
	);

	const removeHighlight = useCallback(
		(id: string) => {
			const highlightToRemove = highlights.find((h) => h.id === id);
			if (!highlightToRemove) return;
			// Get all highlights in the same group
			const highlightsToRemove = highlightToRemove.groupId
				? highlights.filter(
						(h) => h.groupId === highlightToRemove.groupId
				  )
				: [highlightToRemove];
				
			const command: HighlightCommand = {
				execute: () => {
					const remainingHighlights = highlights.filter(
						(h) => !highlightsToRemove.some((hr) => hr.id === h.id)
					);
					batchUpdate(remainingHighlights);
				},
				undo: () => {
					batchUpdate([...highlights, ...highlightsToRemove]);
				},
			};
			executeCommand(command);
		},
		[highlights, batchUpdate, executeCommand]
	);

	const updateHighlightColor = useCallback(
		(
			id: string,
			oldColor: HighlightColorKey,
			newColor: HighlightColorKey
		) => {
			const highlight = highlights.find((h) => h.id === id);
			if (!highlight) return;

			const now = new Date().toISOString();
			const command: HighlightCommand = {
				execute: () => {
					batchUpdate(
						highlights.map((h) => {
							if (
								highlight.groupId &&
								h.groupId === highlight.groupId
							) {
								return {
									...h,
									color: newColor,
									updatedAt: now,
								};
							}
							if (!highlight.groupId && h.id === id) {
								return {
									...h,
									color: newColor,
									updatedAt: now,
								};
							}
							return h;
						})
					);
				},
				undo: () => {
					batchUpdate(
						highlights.map((h) => {
							if (
								highlight.groupId &&
								h.groupId === highlight.groupId
							) {
								return {
									...h,
									color: oldColor,
									updatedAt: now,
								};
							}
							if (!highlight.groupId && h.id === id) {
								return {
									...h,
									color: oldColor,
									updatedAt: now,
								};
							}
							return h;
						})
					);
				},
			};
			executeCommand(command);
		},
		[highlights, batchUpdate, executeCommand]
	);

	return {
		addHighlight,
		batchAddHighlights, // Added to return object
		removeHighlight,
		updateHighlightColor,
		undo: useCallback(() => {
			const command = undoStack.current.pop();
			if (command) {
				command.undo();
				redoStack.current.push(command);
			}
		}, []),
		redo: useCallback(() => {
			const command = redoStack.current.pop();
			if (command) {
				command.execute();
				undoStack.current.push(command);
			}
		}, []),
		canUndo: undoStack.current.length > 0,
		canRedo: redoStack.current.length > 0,
	};
};
