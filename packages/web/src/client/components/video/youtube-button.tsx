import { memo } from 'react';
import { Button } from '@/client/components/ui/button';
import { Youtube as YoutubeIcon } from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/client/components/ui/tooltip';

interface YouTubeButtonProps {
	url: string;
}

export const YouTubeButton = memo(function YouTubeButton({
	url,
}: YouTubeButtonProps) {
	const openYouTube = () => {
		window.open(url, '_blank');
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button variant="ghost" size="icon" onClick={openYouTube}>
					<YoutubeIcon className="h-4 w-4" />
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>فتح في يوتيوب</p>
			</TooltipContent>
		</Tooltip>
	);
});
