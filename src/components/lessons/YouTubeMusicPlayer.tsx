// src/components/lessons/YouTubeMusicPlayer.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import YouTube from 'react-youtube';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize2,
  Minimize2,
  SkipBack,
  SkipForward,
  Youtube as YoutubeIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { debounce } from 'lodash';

interface YouTubeMusicPlayerProps {
  youtubeUrl: string;
}

const isVideoPlaying = video => !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);


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

  // Extract video ID from URL
  const videoId = youtubeUrl.split('v=')[1]?.split('&')[0];

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Player controls
  const togglePlay = useCallback(() => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  }, [player, isPlaying]);

  const toggleMute = useCallback(() => {
    if (player) {
      if (isMuted) {
        player.unMute();
        player.setVolume(volume);
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
    }
  }, [player, isMuted, volume]);

  const handleVolumeChange = useCallback((value: number[]) => {
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
  }, [player, isMuted]);

  const handleSeek = useCallback((value: number[]) => {
    if (player && duration) {
      const seekTime = (value[0] / 100) * duration;
      player.seekTo(seekTime);
      setCurrentTime(seekTime);
    }
  }, [player, duration]);

  const debouncedSeek = useCallback(
    debounce((time: number) => {
      if (player) {
        player.seekTo(time, true);
        setIsSkipping(false);
      }
    }, 300),
    [player]
  );

  const handleSkip = useCallback((skipTime: number) => {
    if (player && !isSkipping) {
      setIsSkipping(true);
      const currentTime = player.getCurrentTime();
      const newTime = Math.max(0, Math.min(currentTime + skipTime, duration));
      setCurrentTime(newTime);
      debouncedSeek(newTime);
    }
  }, [duration, isSkipping, debouncedSeek, player]);

  const skipForward = useCallback(() => {
    handleSkip(10);
  }, [handleSkip]);

  const skipBackward = useCallback(() => {
    handleSkip(-10);
  }, [handleSkip]);


  // Player event handlers
  const onReady = (event: any) => {
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
      if (player && isVideoPlaying(player)) {
        player.stopVideo();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [player]);

     const openYouTube = useCallback(() => {
    window.open(youtubeUrl, '_blank');
     }, [youtubeUrl]);
    
  if (!videoId) return null;

return (
    <TooltipProvider delayDuration={300}>
       <div 
        className={cn(
          "fixed transition-all duration-300 z-50",
          isCollapsed ? "bottom-[-64px]" : "bottom-0",
          "left-0 right-0 bg-background border-t shadow-lg",
          isMinimized ? "h-16" : "h-96"
        )}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background border border-b-0 rounded-t-lg px-3 py-1 shadow-lg group hover:bg-accent transition-colors"
        >
          {isCollapsed ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground">
              <ChevronUp className="h-4 w-4" />
              <span>{isPlaying ? "يتم التشغيل" : "متوقف"}</span>
            </div>
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          )}
        </button>

        <div className="h-full">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-secondary">
            <Slider
              value={[duration ? (currentTime / duration) * 100 : 0]}
              max={100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
          </div>

          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-[60px]">
              {/* Left Controls */}
              <div className="flex items-center gap-4">
                {/* Playback Controls */}
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={skipForward}
                      >
                        <SkipForward className="h-4 w-4" /> {/* Using SkipForward for RTL */}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>تقديم 10 ثوان</TooltipContent>
                  </Tooltip>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
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
                        onClick={skipBackward}
                      >
                        <SkipBack className="h-4 w-4" /> {/* Using SkipBack for RTL */}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>رجوع 10 ثوان</TooltipContent>
                  </Tooltip>
                </div>

                {/* Time Display */}
                <div className="text-sm text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span className="mx-1">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-3">
                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                  >
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
                      onValueChange={handleVolumeChange}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* YouTube Link */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={openYouTube}
                    >
                      <YoutubeIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>فتح في يوتيوب</TooltipContent>
                </Tooltip>

                {/* Expand/Minimize */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* YouTube Player */}
          <div className={cn(
            "transition-all duration-300",
            isMinimized ? "h-0 opacity-0" : "h-72 opacity-100"
          )}>
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
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}