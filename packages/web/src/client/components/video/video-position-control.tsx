import React from 'react';
import { Button } from '@/client/components/ui/button';
import { ArrowDown, ArrowUp } from 'lucide-react';
import {
	useVideoSettings,
	VideoPosition,
} from '@/client/stores/use-video-settings';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/client/components/ui/tooltip';

export function VideoPositionControl() {
	const { position, setPosition } = useVideoSettings();

	const togglePosition = () => {
		const newPosition: VideoPosition =
			position === 'bottom' ? 'top' : 'bottom';
		setPosition(newPosition);
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					onClick={togglePosition}
					className="group"
				>
					{position === 'bottom' ? (
						<ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
					) : (
						<ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
					)}
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>نقل الفيديو {position === 'bottom' ? 'للأعلى' : 'للأسفل'}</p>
			</TooltipContent>
		</Tooltip>
	);
}
