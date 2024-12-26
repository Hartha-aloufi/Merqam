// src/components/highlight/HighlightContainer.tsx
import React, { useRef } from 'react';
import { useHighlightState } from '@/hooks/highlights/use-highlights-state';
import { useHighlightOperations } from '@/hooks/highlights/use-highlight-sync';
import { useHighlightSelection } from '@/hooks/highlights/use-highlight-selection';
import { useSession } from '@/hooks/use-auth-query';
import { HighlightToolbar } from './HighlightToolbar';
import { UnauthorizedToolbar } from './UnauthorizedToolbar';
import { HighlightRenderer } from './HighlightRenderer';
import { HighlightPopoverProvider } from './HighlightPopover';
import { HighlightColorKey } from '@/constants/highlights';
import { cn } from '@/lib/utils';
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
export const HighlightContainer = ({
	topicId,
	lessonId,
	children,
	className,
}: HighlightContainerProps) => {
	// Reference to the container element for highlight positioning
	const containerRef = useRef<HTMLDivElement>(null);

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
	} = useHighlightOperations(topicId, lessonId);

	// Handle text selection for new highlights
	const handleSelection = useHighlightSelection({
		isEnabled: state.isEnabled,
		containerRef,
		highlights,
		onAddHighlight: (info) => {
			addHighlight({
				elementId: info.elementId,
				startOffset: info.startOffset,
				endOffset: info.endOffset,
				color: state.activeColor,
			});
		},
	});

	// Handle color updates for existing highlights
	const handleUpdateHighlight = React.useCallback(
		(id: string, { color }: { color: HighlightColorKey }) => {
			updateHighlightColor(id, color);
		},
		[updateHighlightColor]
	);

	// If not authenticated, show unauthorized state
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
							// Show text cursor when highlighting is enabled
							state.isEnabled && 'cursor-text',
							// Apply custom classes
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
