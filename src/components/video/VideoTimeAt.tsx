// src/components/video/VideoTimeAt.tsx
'use client';

import { cn } from '@/lib/utils';
import { Play, Pause } from 'lucide-react';
import { useVideoContext } from '@/contexts/video-context';

interface VideoTimeAtProps {
  startTime: number;
  endTime: number;
  children: React.ReactNode;
}

export const VideoTimeAt = ({
  startTime,
  endTime,
  children,
}: VideoTimeAtProps) => {
  const { player, isPlaying, currentTime, playSegment, pauseVideo } =
    useVideoContext();

  const startTimeSeconds = startTime;
  const endTimeSeconds = endTime;

  const isCurrentSegment =
    isPlaying &&
    currentTime >= startTimeSeconds &&
    currentTime <= endTimeSeconds;

  const handleClick = () => {
    if (!player) return;

    if (isCurrentSegment) {
      pauseVideo();
    } else {
      playSegment(startTimeSeconds, endTimeSeconds);
    }
  };

  return (
    <div
      className={cn(
        "group relative",
        // Remove background in print view
        "print:bg-transparent",
        // Only show background in screen view when segment is playing
        isCurrentSegment &&
          "screen:bg-primary/5 rounded-lg transition-colors duration-200"
      )}
    >
      {/* Play Button - Hidden in print */}
      {player && (
        <button
          onClick={handleClick}
          className={cn(
            // Position and base styles
            "absolute -right-8 md:-right-10 top-0",
            "p-1.5 rounded-lg",
            "bg-primary/10 hover:bg-primary/20",
            "text-primary hover:text-primary/80",
            // Visibility
            "md:opacity-0 md:group-hover:opacity-100",
            isCurrentSegment && "!opacity-100",
            // Transitions
            "transition-all duration-200",
            // Hide in print
            "print:hidden"
          )}
          title={`${
            isCurrentSegment ? "Pause" : "Play"
          } video from ${formatTime(startTimeSeconds)} to ${formatTime(
            endTimeSeconds
          )}`}
        >
          {isCurrentSegment ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
      )}

      {/* Content wrapper */}
      <div className="print:pr-0">
        {" "}
        {/* Remove right padding in print */}
        {children}
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};
