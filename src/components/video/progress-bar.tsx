import { memo } from "react";
import { Slider } from "@/components/ui/slider";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number[]) => void;
}

export const ProgressBar = memo(function ProgressBar({
  currentTime,
  duration,
  onSeek,
}: ProgressBarProps) {
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full h-1 bg-secondary">
      <Slider
        value={[progress]}
        max={100}
        step={0.1}
        onValueChange={onSeek}
        className="cursor-pointer"
        aria-label="Video progress"
      />
    </div>
  );
});
