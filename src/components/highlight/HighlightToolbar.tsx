// src/components/highlight/HighlightToolbar.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Highlighter, ChevronDown, ChevronUp } from 'lucide-react';
import { CollapsibleToolbar } from './CollapsibleToolbar';
import { ColorPicker } from './ColorPicker';
import { HIGHLIGHT_COLORS, HighlightColorKey } from '@/constants/highlights';
import { useVideoSettings } from '@/stores/use-video-settings';

interface HighlightToolbarProps {
	isEnabled: boolean;
	onToggle: (enabled: boolean) => void;
	activeColor: HighlightColorKey;
	onColorChange: (color: HighlightColorKey) => void;
	highlightsCount: number;
	onNavigate: (direction: 'prev' | 'next') => void;
	currentHighlightIndex: number;
}

export const HighlightToolbar = React.memo(function HighlightToolbar({
	isEnabled,
	onToggle,
	activeColor,
	onColorChange,
	highlightsCount,
	onNavigate,
	currentHighlightIndex,
}: HighlightToolbarProps) {
	const { position } = useVideoSettings();
	const isPlacedBottom = position === 'bottom';

	const pullTabContent = (
		<>
			<Highlighter className="mr-2 h-3 w-3" />
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

				{/* Color Picker */}
				{isEnabled && (
					<ColorPicker
						activeColor={activeColor}
						onColorChange={onColorChange}
					/>
				)}
			</div>

			{/* Navigation Controls */}
			{highlightsCount > 0 && (
				<div className="flex items-center gap-2 ml-auto">
					<span className="text-sm text-muted-foreground">
						{currentHighlightIndex + 1} / {highlightsCount}
					</span>
					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onNavigate('prev')}
							className="h-8 w-8"
						>
							<ChevronUp className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onNavigate('next')}
							className="h-8 w-8"
						>
							<ChevronDown className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</CollapsibleToolbar>
	);
});