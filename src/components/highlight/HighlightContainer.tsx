"use client";

import React, { useRef } from "react";
import { useHighlightState } from "@/hooks/highlights/use-highlights-state";
import { useHighlightStorage } from "@/hooks/highlights/use-highlights-storage";
import { useHighlightSelection } from "@/hooks/highlights/use-highlight-selection";
import { HighlightToolbar } from "./HighlightToolbar";
import { HighlightRenderer } from "./HighlightRenderer";
import { cn } from "@/lib/utils";

interface HighlightContainerProps {
  topicId: string;
  lessonId: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Container component that provides highlighting functionality
 * - Manages highlight state
 * - Handles text selection
 * - Renders highlights
 * - Provides toolbar controls
 */
export const HighlightContainer: React.FC<HighlightContainerProps> = ({
  topicId,
  lessonId,
  children,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Manage highlight state
  const { isEnabled, activeColor, setActiveColor, toggleHighlighting } =
    useHighlightState();

  // Manage highlights storage
  const {
    highlights,
    addHighlight,
    removeHighlight,
    removeHighlights,
    clearHighlights,
  } = useHighlightStorage(topicId, lessonId, activeColor);

  // Handle text selection
  const handleSelection = useHighlightSelection({
    isEnabled,
    containerRef,
    highlights,
    onAddHighlight: addHighlight,
    onRemoveHighlights: removeHighlights,
  });

  return (
    <div className="relative">
      {/* Toolbar */}
      <HighlightToolbar
        isEnabled={isEnabled}
        onToggle={toggleHighlighting}
        activeColor={activeColor}
        onColorChange={setActiveColor}
        onClear={clearHighlights}
        highlightsCount={highlights.length}
      />

      {/* Content Container */}
      <div
        ref={containerRef}
        onMouseUp={handleSelection}
        className={cn(
          "relative transition-colors duration-200",
          isEnabled && "cursor-text",
          className
        )}
      >
        {/* Highlight Renderer */}
        <HighlightRenderer
          containerRef={containerRef}
          highlights={highlights}
          onRemoveHighlight={removeHighlight}
        />

        {/* Content */}
        {children}
      </div>
    </div>
  );
};
