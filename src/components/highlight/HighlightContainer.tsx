"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { useHighlights } from "@/hooks/use-highlights";
import { HighlightToolbar } from "./HighlightToolbar";
import { cn } from "@/lib/utils";

interface HighlightContainerProps {
  topicId: string;
  lessonId: string;
  children: React.ReactNode;
  className?: string;
}

export const HighlightContainer: React.FC<HighlightContainerProps> = ({
  topicId,
  lessonId,
  children,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    isEnabled,
    setIsEnabled,
    highlights,
    activeColor,
    setActiveColor,
    addHighlight,
    removeHighlight,
    clearHighlights,
  } = useHighlights(topicId, lessonId);

  // Handle text selection
  const handleMouseUp = useCallback(() => {
    if (!isEnabled) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    if (!range) return;

    // Only handle selections within our container
    if (!containerRef.current?.contains(range.commonAncestorContainer)) return;

    addHighlight(range);
    selection.removeAllRanges();
  }, [isEnabled, addHighlight]);

  // Apply highlights
  useEffect(() => {
    if (!containerRef.current) return;

    // Reset existing highlights
    const markedElements = containerRef.current.querySelectorAll(
      "mark[data-highlight]"
    );
    markedElements.forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ""), el);
      }
    });

    // Apply new highlights
    highlights.forEach((highlight) => {
      const textNodes = Array.from(
        containerRef.current?.querySelectorAll("p, h1, h2, h3, h4, h5, h6") ||
          []
      )
        .map((el) => Array.from(el.childNodes))
        .flat()
        .filter((node) => node.nodeType === Node.TEXT_NODE);

      textNodes.forEach((node) => {
        if (node.textContent?.includes(highlight.text)) {
          const range = document.createRange();
          range.setStart(node, highlight.startOffset);
          range.setEnd(node, highlight.endOffset);

          const mark = document.createElement("mark");
          mark.dataset.highlight = highlight.id;
          mark.style.backgroundColor = highlight.color;
          mark.style.padding = "0 2px";
          mark.style.borderRadius = "2px";
          mark.addEventListener("dblclick", () =>
            removeHighlight(highlight.id)
          );

          range.surroundContents(mark);
        }
      });
    });
  }, [highlights, removeHighlight]);

  return (
    <div className="relative">
      <HighlightToolbar
        isEnabled={isEnabled}
        onToggle={setIsEnabled}
        activeColor={activeColor}
        onColorChange={setActiveColor}
        onClear={clearHighlights}
        highlightsCount={highlights.length}
      />

      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        className={cn(
          "relative transition-colors duration-200",
          isEnabled && "cursor-text",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
