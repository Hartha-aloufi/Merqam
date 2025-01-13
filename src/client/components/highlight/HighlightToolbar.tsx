// src/components/highlight/HighlightToolbar.tsx
import React from 'react';
import { Button } from '@/client/components/ui/button';
import {
	Highlighter,
	ChevronDown,
	ChevronUp,
	Undo2,
	Redo2,
	MessageSquare,
} from 'lucide-react';
import { CollapsibleToolbar } from './CollapsibleToolbar';
import { ColorPicker } from './ColorPicker';
import { HIGHLIGHT_COLORS, HighlightColorKey } from '@/constants/highlights';
import { useVideoSettings } from '@/client/stores/use-video-settings';
import { HighlightNavigationControls } from './HighlightNavigationControls';
import { useNotes } from '@/client/contexts/notes-context';

interface HighlightToolbarProps {
	isEnabled: boolean;
	onToggle: (enabled: boolean) => void;
	activeColor: HighlightColorKey;
	onColorChange: (color: HighlightColorKey) => void;
	highlightsCount: number;
	onNavigate: (direction: 'prev' | 'next') => void;
	currentHighlightIndex: number;
	onUndo: () => void;
	onRedo: () => void;
	canUndo: boolean;
	canRedo: boolean;
	currentIsGroup: boolean;
}

// components/highlight/HighlightToolbar.tsx
export const HighlightToolbar = React.memo(function HighlightToolbar({
	isEnabled,
	onToggle,
	activeColor,
	onColorChange,
	highlightsCount,
	onNavigate,
	currentHighlightIndex,
	onUndo,
	onRedo,
	canUndo,
	canRedo,
	currentIsGroup,
}: HighlightToolbarProps) {
	const { position } = useVideoSettings();
	const isPlacedBottom = position === 'bottom';
  const { actions: noteActions, state: noteState } = useNotes();

	// Pull tab content shows highlight status
	const pullTabContent = (
		<>
			<Highlighter className="mr-2 h-3 w-3 print:hidden" />
			{isEnabled ? (
				<div className="flex items-center gap-2">
					<span className="text-xs">التظليل مفعل</span>
					<div
						className="h-2 w-2 rounded-sm"
						style={{
							backgroundColor:
								HIGHLIGHT_COLORS[activeColor].background,
						}}
					/>
				</div>
			) : (
				<span className="text-xs">تفعيل التظليل</span>
			)}
			{isPlacedBottom ? (
				<ChevronDown className="mr-2 h-3 w-3" />
			) : (
				<ChevronUp className="ml-2 h-3 w-3" />
			)}
		</>
	);

	return (
		<CollapsibleToolbar pullTabContent={pullTabContent}>
			<div className="flex w-full items-center justify-between ">
				{/* Highlighting Tools Group */}
				<div className="flex items-center gap-3">
					{/* Highlight Toggle */}
					<Button
						variant={isEnabled ? 'default' : 'outline'}
						size="icon"
						onClick={() => onToggle(!isEnabled)}
						className="h-9 w-9"
					>
						<Highlighter className="h-4 w-4" />
					</Button>

					{/* Notes Button */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => noteActions.openAllNotes()}
						className="h-9 w-9 relative"
						title="الملاحظات"
					>
						<MessageSquare className="h-4 w-4" />
						{noteState.notes.length > 0 && (
							<span className="absolute -top-1 -right-1 h-4 w-4 text-xs bg-primary text-primary-foreground rounded-full flex items-center justify-center">
								{noteState.notes.length}
							</span>
						)}
					</Button>

					{/* Tools visible only when highlighting is enabled */}
					{isEnabled && (
						<>
							{/* Color Picker */}
							<ColorPicker
								activeColor={activeColor}
								onColorChange={onColorChange}
							/>

							{/* Undo/Redo */}
							<div className="flex gap-1">
								<Button
									variant="ghost"
									size="icon"
									onClick={onUndo}
									disabled={!canUndo}
									className="h-8 w-8"
								>
									<Undo2 className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={onRedo}
									disabled={!canRedo}
									className="h-8 w-8"
								>
									<Redo2 className="h-4 w-4" />
								</Button>
							</div>
						</>
					)}
				</div>

				{/* Navigation Controls - Always visible if there are highlights */}
				<HighlightNavigationControls
					navigableCount={highlightsCount}
					currentIndex={currentHighlightIndex}
					onNavigate={onNavigate}
					currentIsGroup={currentIsGroup}
				/>
			</div>
		</CollapsibleToolbar>
	);
});
