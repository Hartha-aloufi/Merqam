// src/components/highlight/HighlightPopover.tsx
import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useRef,
} from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { TextHighlight } from '@/types/highlight';
import {
	FloatingPortal,
	useFloating,
	useInteractions,
	useDismiss,
	useHover,
	arrow,
	offset,
	flip,
	shift,
} from '@floating-ui/react';
import { cn } from '@/client/lib/utils';
import { HIGHLIGHT_COLORS, HighlightColorKey } from '@/constants/highlights';
import { useNotesSheet } from '@/client/stores/use-notes-sheet';
import { useHighlightNote } from '@/client/hooks/use-notes';

interface PopoverState {
	highlight: TextHighlight | null;
	anchorElement: HTMLElement | null;
}

interface PopoverContextType {
	showPopover: (highlight: TextHighlight, element: HTMLElement) => void;
	hidePopover: () => void;
	onRemoveHighlight?: (id: string) => void | Promise<void>;
	onUpdateHighlight?: (
		id: string,
		options: { color: HighlightColorKey }
	) => void | Promise<void>;
}

const PopoverContext = createContext<PopoverContextType | null>(null);

// Color selection button component
interface ColorButtonProps {
	color: HighlightColorKey;
	isActive: boolean;
	onClick: () => void;
}

const ColorButton = React.memo(function ColorButton({
	color,
	isActive,
	onClick,
}: ColorButtonProps) {
	return (
		<button
			onClick={onClick}
			className={cn(
				'w-6 h-6 rounded-sm transition-all duration-150',
				'hover:scale-110 active:scale-95',
				'focus:outline-none focus:ring-2 focus:ring-offset-2',
				'focus:ring-primary focus:ring-offset-background',
				isActive &&
					'ring-2 ring-primary ring-offset-2 ring-offset-background'
			)}
			style={{ backgroundColor: HIGHLIGHT_COLORS[color].background }}
			title={`Change to ${color}`}
		/>
	);
});

interface HighlightPopoverProviderProps {
	children: React.ReactNode;
	onRemoveHighlight?: (id: string) => void | Promise<void>;
	onUpdateHighlight?: (
		id: string,
		options: { color: HighlightColorKey }
	) => void | Promise<void>;
	lessonId: string;
}

/**
 * Provider component that manages highlight popovers
 */
export function HighlightPopoverProvider({
	children,
	onRemoveHighlight,
	onUpdateHighlight,
	lessonId,
}: HighlightPopoverProviderProps) {
	const [popoverState, setPopoverState] = useState<PopoverState>({
		highlight: null,
		anchorElement: null,
	});

	// Get associated note info
	const { data: noteData } = useHighlightNote(
		lessonId,
		popoverState.highlight?.id || ''
	);

	const arrowRef = useRef<HTMLDivElement>(null);

	const { refs, floatingStyles, context, middlewareData } = useFloating({
		open: !!popoverState.highlight,
		onOpenChange: (open) => {
			if (!open) hidePopover();
		},
		placement: 'top',
		middleware: [
			offset(8),
			flip({ fallbackPlacements: ['bottom'] }),
			shift({ padding: 8 }),
			arrow({ element: arrowRef }),
		],
	});

	const dismiss = useDismiss(context);
	const hover = useHover(context, {
		delay: { open: 0, close: 150 },
		restMs: 40,
	});

	const { getFloatingProps } = useInteractions([dismiss, hover]);

	const showPopover = useCallback(
		(highlight: TextHighlight, element: HTMLElement) => {
			setPopoverState({ highlight, anchorElement: element });
			refs.setReference(element);
		},
		[refs]
	);

	const hidePopover = useCallback(() => {
		setPopoverState({ highlight: null, anchorElement: null });
	}, []);

	return (
		<PopoverContext.Provider
			value={{
				showPopover,
				hidePopover,
				onRemoveHighlight,
				onUpdateHighlight,
			}}
		>
			{children}
			{popoverState.highlight && popoverState.anchorElement && (
				<FloatingPortal>
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						{...getFloatingProps()}
						className={cn(
							// Base styles
							'z-50 bg-popover rounded-xl border shadow-lg',
							// Spacing and layout
							'p-2.5',
							'flex items-center gap-3',
							// Animation
							'animate-in fade-in-0 zoom-in-95 duration-150',
							// Extra styles for better visibility
							'backdrop-blur-sm bg-opacity-95'
						)}
						onMouseDown={(e) => e.preventDefault()} // Prevent text selection
					>
						{/* Color Options */}
						<div className="flex items-center gap-2">
							{Object.entries(HIGHLIGHT_COLORS).map(([key]) => (
								<ColorButton
									key={key}
									color={key as HighlightColorKey}
									isActive={
										key === popoverState.highlight?.color
									}
									onClick={() => {
										onUpdateHighlight?.(
											popoverState.highlight!.id,
											{ color: key as HighlightColorKey }
										);
										hidePopover();
									}}
								/>
							))}
						</div>

						{/* Divider */}
						<div className="w-px h-6 bg-border/50" />

						{/* Note Button */}
						<button
							onClick={() => {
								const highlight = popoverState.highlight!;
								useNotesSheet.getState().open(highlight.id);
								console.log('noteData', noteData);
								// If note exists, set the view to editor with that note
								if (noteData?.id) {
									useNotesSheet
										.getState()
										.setSelectedNoteId(noteData.id);
									useNotesSheet.getState().setView('editor');
								}
								hidePopover();
							}}
							className={cn(
								'h-7 w-7 flex items-center justify-center',
								'rounded-full transition-colors duration-150',
								'hover:bg-primary hover:text-primary-foreground',
								'focus:outline-none focus:ring-2 focus:ring-primary',
								'active:scale-95'
							)}
							title={
								noteData
									? 'عرض الملاحظة المرتبطة'
									: 'إضافة ملاحظة'
							}
						>
							<FileText
								className={cn(
									'h-4 w-4',
									noteData && 'fill-current' // Fill icon if note exists
								)}
							/>
						</button>

						{/* Delete Button */}
						<button
							onClick={() => {
								onRemoveHighlight?.(popoverState.highlight!.id);
								hidePopover();
							}}
							className={cn(
								'h-7 w-7 flex items-center justify-center',
								'rounded-full transition-colors duration-150',
								'hover:bg-destructive hover:text-destructive-foreground',
								'focus:outline-none focus:ring-2 focus:ring-destructive',
								'active:scale-95'
							)}
							title="Delete highlight"
						>
							<Trash2 className="h-4 w-4" />
						</button>

						{/* Arrow */}
						<div
							ref={arrowRef}
							className={cn(
								'absolute -bottom-2 rotate-45',
								'w-4 h-4 bg-popover border',
								'border-t-0 border-l-0',
								'shadow-lg'
							)}
							style={{
								left:
									middlewareData.arrow?.x != null
										? `${middlewareData.arrow.x}px`
										: '',
								top:
									middlewareData.arrow?.y != null
										? `${middlewareData.arrow.y}px`
										: '',
							}}
						/>
					</div>
				</FloatingPortal>
			)}
		</PopoverContext.Provider>
	);
}

export function useHighlightPopover() {
	const context = useContext(PopoverContext);
	if (!context) {
		throw new Error(
			'useHighlightPopover must be used within a HighlightPopoverProvider'
		);
	}
	return context;
}
