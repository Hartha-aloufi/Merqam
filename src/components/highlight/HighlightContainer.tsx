// src/components/highlight/HighlightContainer.tsx
import React, { useCallback, useRef, useState } from 'react';
import { useHighlightState } from '@/hooks/highlights/use-highlights-state';
import { useHighlightOperations } from '@/hooks/highlights/use-highlight-operations';
import {
	HighlightRange,
	useHighlightSelection,
} from '@/hooks/highlights/use-highlight-selection';
import { useSession } from '@/hooks/use-auth-query';
import { HighlightToolbar } from './HighlightToolbar';
import { UnauthorizedToolbar } from './UnauthorizedToolbar';
import { HighlightRenderer } from './HighlightRenderer';
import { HighlightPopoverProvider } from './HighlightPopover';
import { HighlightColorKey } from '@/constants/highlights';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useHighlightNavigation } from './HighlightNavigation';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';

interface HighlightContainerProps {
	topicId: string;
	lessonId: string;
	children: React.ReactNode;
	className?: string;
}

/**
 * Container component that provides highlighting functionality.
 * Manages highlighting state, batch operations for storage, and UI components.
 * Supports both single and multi-paragraph highlights.
 */
export const HighlightContainer = ({
	topicId,
	lessonId,
	children,
	className,
}: HighlightContainerProps) => {
	// Reference to the container element for highlight positioning
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollToHighlight } = useHighlightNavigation();
	const [currentHighlightIndex, setCurrentHighlightIndex] = useState(-1);

	// Authentication state
	const { data: session } = useSession();
	const isAuthenticated = !!session?.data.session;

	// Highlighting state and operations
	const state = useHighlightState();
	const {
		highlights,
		isLoading,
		addHighlight,
		removeHighlight,
		updateHighlightColor,
		batchAddHighlights,
	} = useHighlightOperations(topicId, lessonId);

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
					});
				}
			} catch (error) {
				console.error('Failed to create highlight:', error);
				toast.error('فشل في إضافة التظليل');
			}
		},
	});

	// Handle color updates for existing highlights
	const handleUpdateHighlight = React.useCallback(
		(id: string, { color }: { color: HighlightColorKey }) => {
			updateHighlightColor(id, color);
		},
		[updateHighlightColor]
	);

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

	
		useKeyboardNavigation({
			scrollTargets: '.prose h1, .prose h2, .prose h3, .prose p',
			scrollStep: 100,
			smooth: true,
			onHighlightNavigate: handleNavigate,
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
			onUpdateHighlight={handleUpdateHighlight}
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
				/>

				{/* Content with highlights */}
				<div className="pt-14">
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
};
