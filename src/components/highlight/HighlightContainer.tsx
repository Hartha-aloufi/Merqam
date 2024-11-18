"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { useHighlights } from "@/hooks/use-highlights";
import { HighlightToolbar } from "./HighlightToolbar";
import { cn } from "@/lib/utils";
import { TextHighlight } from "@/types/highlight";

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

  // Calculate offset including marked text
  // Helper to detect if selection is backwards (right to left)
  const detectBackwardsSelection = (range: Range): boolean => {
    const tempRange = document.createRange();
    tempRange.setStart(range.startContainer, range.startOffset);
    tempRange.setEnd(range.endContainer, range.endOffset);
    return tempRange.collapsed;
  };

  // Calculate offset including marked text
  const calculateOffset = (node: Node): number => {
    let offset = 0;
    let current = node.previousSibling;

    while (current) {
      if (current.nodeType === Node.TEXT_NODE) {
        offset += current.textContent?.length || 0;
      } else if (
        current.nodeType === Node.ELEMENT_NODE &&
        current.nodeName === "MARK"
      ) {
        offset += current.textContent?.length || 0;
      }
      current = current.previousSibling;
    }

    // If node is inside a mark, we need to add parent offsets too
    let parent = node.parentElement;
    while (parent && parent.closest("[data-paragraph-index]") !== parent) {
      if (parent.nodeName === "MARK") {
        const prevSiblings = Array.from(parent.parentNode?.childNodes || []);
        const beforeMark = prevSiblings.slice(0, prevSiblings.indexOf(parent));
        offset += beforeMark.reduce(
          (acc, node) => acc + (node.textContent?.length || 0),
          0
        );
      }
      parent = parent.parentElement;
    }

    return offset;
  };

  // Get the real text offset considering highlighted text and direction
  const getRealOffset = (
    node: Node,
    offset: number,
    isStart: boolean
  ): number => {
    let realOffset = calculateOffset(node);

    if (
      node.nodeType === Node.TEXT_NODE &&
      node.parentElement?.nodeName === "MARK"
    ) {
      // Handle text node inside a highlight
      const mark = node.parentElement;
      const markId = mark.getAttribute("data-highlight");
      const highlight = highlights.find((h) => h.id === markId);

      if (highlight && isStart) {
        // For start offset, use the highlight's start offset plus our local offset
        realOffset = highlight.startOffset + offset;
      } else if (highlight && !isStart) {
        // For end offset, use the highlight's start offset plus our local offset
        realOffset = highlight.startOffset + offset;
      } else {
        // Fallback if highlight not found
        realOffset += offset;
      }
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.nodeName === "MARK"
    ) {
      // If selecting the mark element itself
      const markId = (node as HTMLElement).getAttribute("data-highlight");
      const highlight = highlights.find((h) => h.id === markId);

      if (highlight) {
        realOffset = isStart ? highlight.startOffset : highlight.endOffset;
      } else {
        realOffset += offset;
      }
    } else {
      realOffset += offset;
    }

    return realOffset;
  };

  // Store selection details when text is selected
  const handleSelection = useCallback(() => {
    if (!isEnabled) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    if (
      !range ||
      !containerRef.current?.contains(range.commonAncestorContainer)
    )
      return;

    // Get the selected text content
    const selectedText = range.toString().trim();
    if (!selectedText) return;

    // Find paragraph element containing the selection
    const paragraph =
      range.commonAncestorContainer.nodeType === Node.TEXT_NODE
        ? range.commonAncestorContainer.parentElement?.closest(
            "[data-paragraph-index]"
          )
        : range.commonAncestorContainer.closest("[data-paragraph-index]");

    if (!paragraph) return;

    const elementId = paragraph.getAttribute("data-paragraph-index") || "0";

    // Check if selection is backwards (right to left)
    const isBackwards = detectBackwardsSelection(range);

    // Calculate real start and end offsets
    let startOffset, endOffset;

    if (isBackwards) {
      endOffset = getRealOffset(range.startContainer, range.startOffset, false);
      startOffset = getRealOffset(range.endContainer, range.endOffset, true);
    } else {
      startOffset = getRealOffset(
        range.startContainer,
        range.startOffset,
        true
      );
      endOffset = getRealOffset(range.endContainer, range.endOffset, false);
    }

    // Find all highlights in this paragraph that interact with the new selection
    const existingHighlights = highlights
      .filter(
        (h) =>
          h.elementId === elementId &&
          !(h.endOffset <= startOffset || h.startOffset >= endOffset)
      )
      .sort((a, b) => a.startOffset - b.startOffset);

    if (existingHighlights.length > 0) {
      // Handle expansion of existing highlight(s)
      const firstHighlight = existingHighlights[0];
      const lastHighlight = existingHighlights[existingHighlights.length - 1];

      // Create a new highlight that spans from the earliest start to the latest end
      const newStartOffset = Math.min(startOffset, firstHighlight.startOffset);
      const newEndOffset = Math.max(endOffset, lastHighlight.endOffset);

      // Remove all overlapping highlights
      existingHighlights.forEach((h) => removeHighlight(h.id));

      // Add the expanded highlight
      addHighlight({
        text: selectedText,
        startOffset: newStartOffset,
        endOffset: newEndOffset,
        elementId,
      });
    } else {
      // No overlaps, add new highlight normally
      addHighlight({
        text: selectedText,
        startOffset,
        endOffset,
        elementId,
      });
    }

    // Clear the selection
    selection.removeAllRanges();
  }, [isEnabled, addHighlight, removeHighlight, highlights]);

  // Sort highlights by start offset and merge overlapping ones
  const processHighlights = (highlights: TextHighlight[]): TextHighlight[] => {
    return highlights
      .slice()
      .sort((a, b) => a.startOffset - b.startOffset)
      .reduce((acc: TextHighlight[], current) => {
        // If we have no highlights yet or this one doesn't overlap with the last one
        if (
          acc.length === 0 ||
          acc[acc.length - 1].endOffset <= current.startOffset
        ) {
          acc.push(current);
        }
        // If they overlap, extend the last highlight if needed
        else {
          const last = acc[acc.length - 1];
          last.endOffset = Math.max(last.endOffset, current.endOffset);
        }
        return acc;
      }, []);
  };

  // Apply highlights
  useEffect(() => {
    if (!containerRef.current) return;

    // Group highlights by element ID
    const highlightsByElement = highlights.reduce((acc, highlight) => {
      acc[highlight.elementId] = [
        ...(acc[highlight.elementId] || []),
        highlight,
      ];
      return acc;
    }, {} as Record<string, TextHighlight[]>);

    // Process each element's highlights
    Object.entries(highlightsByElement).forEach(
      ([elementId, elementHighlights]) => {
        const element = containerRef.current?.querySelector(
          `[data-paragraph-index="${elementId}"]`
        );
        if (!element) return;

        // Clear existing highlights
        const existingMarks = element.querySelectorAll("mark[data-highlight]");
        existingMarks.forEach((mark) => {
          const parent = mark.parentNode;
          if (parent) {
            parent.replaceChild(
              document.createTextNode(mark.textContent || ""),
              mark
            );
          }
        });

        // Normalize text nodes
        element.normalize();

        // Process and sort highlights
        const processedHighlights = processHighlights(elementHighlights);

        // Apply highlights
        processedHighlights.forEach((highlight) => {
          try {
            // Get all text nodes
            const textNodes: Node[] = [];
            const walker = document.createTreeWalker(
              element,
              NodeFilter.SHOW_TEXT,
              null
            );

            let node: Node | null = walker.nextNode();
            while (node) {
              textNodes.push(node);
              node = walker.nextNode();
            }

            // Find and highlight the text
            let currentOffset = 0;
            for (const textNode of textNodes) {
              const nodeLength = textNode.textContent?.length || 0;
              const nodeEndOffset = currentOffset + nodeLength;

              if (
                currentOffset <= highlight.startOffset &&
                highlight.startOffset < nodeEndOffset
              ) {
                const range = document.createRange();
                const relativeStart = highlight.startOffset - currentOffset;
                const relativeEnd = Math.min(
                  nodeLength,
                  highlight.endOffset - currentOffset
                );

                range.setStart(textNode, relativeStart);
                range.setEnd(textNode, relativeEnd);

                const mark = document.createElement("mark");
                mark.dataset.highlight = highlight.id;
                mark.style.backgroundColor = highlight.color;
                mark.style.padding = "0 2px";
                mark.style.borderRadius = "2px";
                mark.addEventListener("dblclick", () =>
                  removeHighlight(highlight.id)
                );

                try {
                  range.surroundContents(mark);
                  break;
                } catch (e) {
                  console.warn("Failed to highlight range:", e);
                }
              }

              currentOffset = nodeEndOffset;
            }
          } catch (error) {
            console.error("Error applying highlight:", error);
          }
        });
      }
    );
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
        onMouseUp={handleSelection}
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
