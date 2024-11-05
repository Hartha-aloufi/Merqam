// src/components/reading/ReadingProgressBar.tsx
"use client";

import React from "react";
import { useReadingProgress } from "@/hooks/use-reading-progress";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ReadingProgressBarProps {
  className?: string;
  showPercentage?: boolean;
}

/**
 * Reading progress bar component that shows reading progress at the very top of the page
 */
export const ReadingProgressBar = ({
  className,
  showPercentage = false,
}: ReadingProgressBarProps) => {
  const progress = useReadingProgress();
  const isComplete = progress >= 99;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      {/* Progress Bar Background */}
      <div className="relative h-1 w-full bg-primary/10">
        {/* Progress Bar Indicator */}
        <div
          className={cn(
            "absolute top-0 left-0 h-full",
            isComplete ? "bg-emerald-600" : "bg-primary",
            className
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Percentage Display */}
      {showPercentage && (
        <div
          className={cn(
            "absolute right-4 top-2 text-xs font-medium",
            "transition-colors duration-200",
            isComplete ? "text-green-500" : "text-muted-foreground"
          )}
        >
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};
