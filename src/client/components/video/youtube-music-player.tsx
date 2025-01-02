import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import YouTube from 'react-youtube';
import {
	Play,
	Pause,
	Volume2,
	VolumeX,
	SkipBack,
	SkipForward,
} from 'lucide-react';
import { Button } from '@/client/components/ui/button';
import { Slider } from '@/client/components/ui/slider';
import { cn } from '@/client/lib/utils';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/client/components/ui/tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { debounce } from 'lodash';
import { useVideoContext } from '@/client/contexts/video-context';
import {
	useVideoSettings,
	VideoPosition,
} from '@/client/stores/use-video-settings';
import { VideoPositionControl } from './video-position-control';
import {
	PlayerControlsProps,
	VolumeControlProps,
	YouTubePlayerProps,
} from '@/types/video';
import { YouTubeButton } from './youtube-button';
import { MinimizeButton } from './minimize-button';
import { ProgressBar } from './progress-bar';
import { CollapseButton } from './collapse-button';

interface YouTubeMusicPlayerProps {
	youtubeUrl: string;
}

const formatTime = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const PlayerControls = memo(function PlayerControls({
	isPlaying,
	onPlayPause,
	onSkipForward,
	onSkipBackward,
	currentTime,
	duration,
}: PlayerControlsProps) {
	return (
		<div className="flex items-center gap-4">
			<div className="flex items-center gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={onSkipForward}
						>
							<SkipForward className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>تقديم 10 ثوان</TooltipContent>
				</Tooltip>

				<Button
					variant="ghost"
					size="icon"
					onClick={onPlayPause}
					className="h-10 w-10"
				>
					{isPlaying ? (
						<Pause className="h-5 w-5" />
					) : (
						<Play className="h-5 w-5" />
					)}
				</Button>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={onSkipBackward}
						>
							<SkipBack className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>رجوع 10 ثوان</TooltipContent>
				</Tooltip>
			</div>

			<TimeDisplay currentTime={currentTime} duration={duration} />
		</div>
	);
});

// Extract TimeDisplay component
const TimeDisplay = memo(function TimeDisplay({
	currentTime,
	duration,
}: {
	currentTime: number;
	duration: number;
}) {
	return (
		<div className="text-sm text-muted-foreground">
			<span>{formatTime(currentTime)}</span>
			<span className="mx-1">/</span>
			<span>{formatTime(duration)}</span>
		</div>
	);
});

// Extract VolumeControl component
const VolumeControl = memo(function VolumeControl({
	isMuted,
	volume,
	onMuteToggle,
	onVolumeChange,
}: VolumeControlProps) {
	return (
		<div className="flex items-center gap-2">
			<Button variant="ghost" size="icon" onClick={onMuteToggle}>
				{isMuted ? (
					<VolumeX className="h-4 w-4" />
				) : (
					<Volume2 className="h-4 w-4" />
				)}
			</Button>
			<div className="w-24 hidden sm:block">
				<Slider
					value={[isMuted ? 0 : volume]}
					max={100}
					step={1}
					onValueChange={onVolumeChange}
					className="cursor-pointer"
				/>
			</div>
		</div>
	);
});

// YouTubePlayer component using useCallback and memo
const YouTubePlayer = memo(function YouTubePlayer({
	videoId,
	onReady,
	onStateChange,
}: YouTubePlayerProps) {
	return (
		<YouTube
			videoId={videoId}
			onReady={onReady}
			onStateChange={onStateChange}
			opts={{
				height: '100%',
				width: '100%',
				playerVars: {
					autoplay: 0,
					controls: 1,
					modestbranding: 1,
				},
			}}
			className="h-full w-full"
		/>
	);
});

// Main component with position calculation moved to a hook
function usePlayerPosition(position: VideoPosition, isCollapsed: boolean) {
	return useMemo(() => {
		if (position !== 'top') return undefined;
		const headerHeight = 65;
		return isCollapsed ? 0 : `${headerHeight}px`;
	}, [position, isCollapsed]);
}

export function YouTubeMusicPlayer({ youtubeUrl }: YouTubeMusicPlayerProps) {
	const [player, setPlayer] = useState<any>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [isMinimized, setIsMinimized] = useState(true);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [volume, setVolume] = useState(100);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const progressInterval = useRef<NodeJS.Timeout>();
	const [isSkipping, setIsSkipping] = useState(false);
	const { position } = useVideoSettings();

	const topPosition = usePlayerPosition(position, isCollapsed);

	const videoContext = useVideoContext();
	const videoId = useMemo(
		() => youtubeUrl.split('v=')[1]?.split('&')[0],
		[youtubeUrl]
	);

	// Memoized callbacks
	const togglePlay = useCallback(() => {
		if (!player) return;
		if (isPlaying) {
			player.pauseVideo();
		} else {
			player.playVideo();
		}
		setIsPlaying(!isPlaying);
	}, [player, isPlaying]);

	const toggleMute = useCallback(() => {
		if (!player) return;
		if (isMuted) {
			player.unMute();
			player.setVolume(volume);
		} else {
			player.mute();
		}
		setIsMuted(!isMuted);
	}, [player, isMuted, volume]);

	const handleVolumeChange = useCallback(
		(value: number[]) => {
			if (player) {
				const newVolume = value[0];
				setVolume(newVolume);
				player.setVolume(newVolume);
				if (newVolume === 0) {
					setIsMuted(true);
				} else if (isMuted) {
					setIsMuted(false);
					player.unMute();
				}
			}
		},
		[player, isMuted]
	);

	const handleSeek = useCallback(
		(value: number[]) => {
			if (player && duration) {
				const seekTime = (value[0] / 100) * duration;
				player.seekTo(seekTime);
				setCurrentTime(seekTime);
			}
		},
		[player, duration]
	);

	const debouncedSeek = useCallback(
		debounce((time: number) => {
			if (player) {
				player.seekTo(time, true);
				setIsSkipping(false);
			}
		}, 300),
		[player]
	);

	const handleSkip = useCallback(
		(skipTime: number) => {
			if (player && !isSkipping) {
				setIsSkipping(true);
				const currentTime = player.getCurrentTime();
				const newTime = Math.max(
					0,
					Math.min(currentTime + skipTime, duration)
				);
				setCurrentTime(newTime);
				debouncedSeek(newTime);
			}
		},
		[duration, isSkipping, debouncedSeek, player]
	);

	const skipForward = useCallback(() => {
		handleSkip(10);
	}, [handleSkip]);

	const skipBackward = useCallback(() => {
		handleSkip(-10);
	}, [handleSkip]);

	// Player event handlers
	const onReady = (event: any) => {
		videoContext.setPlayer(event.target);
		setPlayer(event.target);
		setDuration(event.target.getDuration());
	};

	const onStateChange = (event: any) => {
		setIsPlaying(event.data === 1);
	};

	// Update progress bar
	useEffect(() => {
		if (player && isPlaying) {
			progressInterval.current = setInterval(() => {
				const current = player.getCurrentTime();
				setCurrentTime(current);
			}, 1000);
		}
		return () => {
			if (progressInterval.current) {
				clearInterval(progressInterval.current);
			}
		};
	}, [player, isPlaying]);

	// Cleanup
	useEffect(() => {
		return () => {
			if (progressInterval.current) {
				clearInterval(progressInterval.current);
			}
		};
	}, []);

	const containerClassNames = useMemo(
		() =>
			cn(
				'fixed transition-all duration-300 z-40 left-0 right-0 bg-background shadow-lg',
				isMinimized ? 'h-16' : 'h-96',
				position === 'bottom'
					? ['bottom-0 border-t', isCollapsed && 'bottom-[-64px]']
					: ['border-b', 'print:hidden', 'fixed-top']
			),
		[position, isMinimized, isCollapsed]
	);

	if (!videoId) return null;

	return (
		<TooltipProvider delayDuration={300}>
			<div
				className={cn(containerClassNames)}
				style={{
					top: topPosition,
					bottom:
						position === 'bottom'
							? isCollapsed
								? '-64px'
								: 0
							: undefined,
				}}
			>
				<CollapseButton
					position={position}
					isCollapsed={isCollapsed}
					isPlaying={isPlaying}
					onToggle={() => setIsCollapsed(!isCollapsed)}
				/>

				<div className="h-full">
					<ProgressBar
						currentTime={currentTime}
						duration={duration}
						onSeek={handleSeek}
					/>

					<div className="container mx-auto px-4">
						<div className="flex items-center justify-between h-[60px]">
							<PlayerControls
								isPlaying={isPlaying}
								onPlayPause={togglePlay}
								onSkipForward={skipForward}
								onSkipBackward={skipBackward}
								currentTime={currentTime}
								duration={duration}
							/>

							<div className="flex items-center gap-3">
								<VolumeControl
									isMuted={isMuted}
									volume={volume}
									onMuteToggle={toggleMute}
									onVolumeChange={handleVolumeChange}
								/>
								<VideoPositionControl />
								<YouTubeButton url={youtubeUrl} />
								<MinimizeButton
									isMinimized={isMinimized}
									onToggle={() =>
										setIsMinimized(!isMinimized)
									}
								/>
							</div>
						</div>
					</div>

					<div
						className={cn(
							'transition-all duration-300',
							isMinimized ? 'h-0 opacity-0' : 'h-72 opacity-100'
						)}
					>
						<YouTubePlayer
							videoId={videoId}
							onReady={onReady}
							onStateChange={onStateChange}
						/>
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
}
