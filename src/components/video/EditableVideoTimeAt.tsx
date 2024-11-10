import React from "react";
import { useVideoContext } from "@/contexts/video-context";
import { Play, Clock } from "lucide-react";

interface TimeButtonProps {
  onClick: () => void;
  label: string;
}

// Small button that appears on hover to set time
const TimeButton = ({ onClick, label }: TimeButtonProps) => (
  <button
    onClick={onClick}
    className="absolute -right-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary/80 transition-all duration-200 text-xs"
    title={label}
  >
    <Clock className="h-3 w-3" />
    <span>Set</span>
  </button>
);

interface EditableTimeDisplayProps {
  time: number;
  label: string;
  onSetTime: () => void;
}

// Display time with edit button
const EditableTimeDisplay = ({
  time,
  label,
  onSetTime,
}: EditableTimeDisplayProps) => (
  <div className="relative inline-flex items-center group">
    <span className="text-muted-foreground text-sm">{formatTime(time)}</span>
    <TimeButton onClick={onSetTime} label={`Set ${label}`} />
  </div>
);

interface EditableVideoTimeAtProps {
  startTime: number;
  endTime: number;
  children: React.ReactNode;
  onChange?: (times: { startTime: number; endTime: number }) => void;
}

export const EditableVideoTimeAt = ({
  startTime,
  endTime,
  children,
  onChange,
}: EditableVideoTimeAtProps) => {
  console.log("hgi");
  const { player, isPlaying, currentTime, playSegment, pauseVideo } =
    useVideoContext();

  const handleSetStartTime = () => {
    if (!player) return;
    const newTime = player.getCurrentTime();
    onChange?.({ startTime: newTime, endTime });
  };

  const handleSetEndTime = () => {
    if (!player) return;
    const newTime = player.getCurrentTime();
    onChange?.({ startTime, endTime: newTime });
  };

  const isCurrentSegment =
    isPlaying && currentTime >= startTime && currentTime <= endTime;

  const handlePlayPause = () => {
    if (!player) return;

    if (isCurrentSegment) {
      pauseVideo();
    } else {
      playSegment(startTime, endTime);
    }
  };

  return (
    <div
      className={`
        group relative
        ${
          isCurrentSegment
            ? "bg-primary/5 rounded-lg transition-colors duration-200"
            : ""
        }
      `}
    >
      {/* Play Button */}
      {player && (
        <button
          onClick={handlePlayPause}
          className={`
            absolute -right-8 md:-right-10 top-0
            p-1.5 rounded-lg
            bg-primary/10 hover:bg-primary/20
            text-primary hover:text-primary/80
            md:opacity-0 md:group-hover:opacity-100
            ${isCurrentSegment ? "!opacity-100" : ""}
            transition-all duration-200
          `}
        >
          {isCurrentSegment ? (
            <Play className="h-4 w-4 rotate-90" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
      )}

      {/* Time Display */}
      <div className="mb-2 flex items-center gap-2 text-xs">
        <EditableTimeDisplay
          time={startTime}
          label="Start Time"
          onSetTime={handleSetStartTime}
        />
        <span className="text-muted-foreground">→</span>
        <EditableTimeDisplay
          time={endTime}
          label="End Time"
          onSetTime={handleSetEndTime}
        />
      </div>

      {children}
    </div>
  );
};

// Format time in MM:SS format
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default EditableVideoTimeAt;
