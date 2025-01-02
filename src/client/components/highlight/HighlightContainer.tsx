// src/client/components/highlight/HighlightContainer.tsx
import React, { useCallback, useRef } from 'react';
import { useHighlightState } from '@/client/hooks/highlights/use-highlights-state';
import { useHighlightOperations } from '@/client/hooks/highlights/use-highlight-operations';
import {
	HighlightRange,
	useHighlightSelection,
} from '@/client/hooks/highlights/use-highlight-selection';
import { useSession } from '@/client/hooks/use-auth-query';
import { HighlightToolbar } from './HighlightToolbar';
import { UnauthorizedToolbar } from './UnauthorizedToolbar';
import { HighlightRenderer } from './HighlightRenderer';
import { HighlightPopoverProvider } from './HighlightPopover';
import { cn } from '@/client/lib/utils';
import { toast } from 'sonner';
import { useHighlightNavigation } from './HighlightNavigation';
import { useKeyboardNavigation } from '@/client/hooks/use-keyboard-navigation';
import { Loader2 } from 'lucide-react';

interface HighlightContainerProps {
	topicId: string;
	lessonId: string;
	children: React.ReactNode;
	className?: string;
}

/**
 * Container component that provides highlighting functionality.
 * Manages highlighting state, batch operations for storage, and UI components.
 */
export function HighlightContainer({
	topicId,
	lessonId,
	children,
	className,
}: HighlightContainerProps) {
	// Reference to the container element for highlight positioning
	const containerRef = useRef<HTMLDivElement>(null);
	const [currentHighlightIndex, setCurrentHighlightIndex] =
		React.useState(-1);

	// Authentication state
	const { data: session } = useSession();
	const isAuthenticated = !!session?.user;

	// Highlighting state and operations
	const state = useHighlightState();
	const {
		highlights,
		isLoading,
		addHighlight,
		removeHighlight,
		updateHighlightColor,
		batchAddHighlights,
		undo,
		redo,
		canUndo,
		canRedo,
	} = useHighlightOperations(topicId, lessonId);

	const { scrollToHighlight } = useHighlightNavigation();

	// Handle text selection for new highlights
	const handleSelection = useHighlightSelection({
		isEnabled: state.isEnabled,
		containerRef,
		highlights,
		onAddHighlight: (highlightInfo: HighlightRange | HighlightRange[]) => {
			try {
				if (Array.isArray(highlightInfo)) {
					// Handle multiple paragraphs
					const newHighlights = highlightInfo.map((info) => ({
						...info,
						color: state.activeColor,
					}));
					batchAddHighlights(newHighlights);
					toast.success('تم إضافة التظليلات');
				} else {
					// Handle single paragraph
					addHighlight({
						elementId: highlightInfo.elementId,
						startOffset: highlightInfo.startOffset,
						endOffset: highlightInfo.endOffset,
						color: state.activeColor,
						text: highlightInfo.text,
						id: crypto.randomUUID(),
						createdAt: new Date().toISOString(),
					});
				}
			} catch (error) {
				console.error('Failed to create highlight:', error);
				toast.error('فشل في إضافة التظليل');
			}
		},
	});

	// Navigation handler
	const handleNavigate = useCallback(
		(direction: 'prev' | 'next') => {
			if (highlights.length === 0) return;

			const newIndex =
				direction === 'next'
					? currentHighlightIndex >= highlights.length - 1
						? 0
						: currentHighlightIndex + 1
					: currentHighlightIndex <= 0
					? highlights.length - 1
					: currentHighlightIndex - 1;

			setCurrentHighlightIndex(newIndex);
			scrollToHighlight(highlights[newIndex]);
		},
		[highlights, currentHighlightIndex, scrollToHighlight]
	);

	// Handle keyboard navigation
	useKeyboardNavigation({
		scrollTargets: '.prose h1, .prose h2, .prose h3, .prose p',
		scrollStep: 100,
		smooth: true,
		onHighlightNavigate: handleNavigate,
		onUndo: canUndo ? undo : undefined,
		onRedo: canRedo ? redo : undefined,
	});

	// Show unauthorized toolbar if not authenticated
	if (!isAuthenticated) {
		return (
			<div className="relative">
				<UnauthorizedToolbar />
				<div className="pt-14">{children}</div>
			</div>
		);
	}

	return (
		<HighlightPopoverProvider
			onRemoveHighlight={removeHighlight}
			onUpdateHighlight={(id, { color }) =>
				updateHighlightColor(id, color)
			}
		>
			<div className="relative">
				{/* Toolbar */}
				<HighlightToolbar
					isEnabled={state.isEnabled}
					onToggle={state.toggleHighlighting}
					activeColor={state.activeColor}
					onColorChange={state.setActiveColor}
					highlightsCount={highlights.length}
					onNavigate={handleNavigate}
					currentHighlightIndex={currentHighlightIndex}
					onUndo={undo}
					onRedo={redo}
					canUndo={canUndo}
					canRedo={canRedo}
				/>

				{/* Content with highlights */}
				<div className="pt-8">
					<div
						ref={containerRef}
						onMouseUp={
							state.isEnabled ? handleSelection : undefined
						}
						onTouchEnd={
							state.isEnabled ? handleSelection : undefined
						}
						className={cn(
							'relative transition-colors duration-200',
							state.isEnabled && 'cursor-text',
							className
						)}
					>
						{/* Highlight overlay */}
						<HighlightRenderer
							containerRef={containerRef}
							highlights={highlights}
							onRemoveHighlight={removeHighlight}
						/>

						{/* Original content */}
						{children}
					</div>
				</div>

				{/* Loading indicator */}
				{isLoading && (
					<div
						className={cn(
							'fixed bottom-4 left-4 z-50',
							'bg-background/95 backdrop-blur-sm',
							'rounded-sm border p-2 shadow-md'
						)}
						role="status"
						aria-label="جاري المزامنة..."
					>
						<Loader2 className="h-5 w-5 animate-spin text-primary" />
						<span className="sr-only">جاري المزامنة...</span>
					</div>
				)}
			</div>
		</HighlightPopoverProvider>
	);
}