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
    return offset;
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

    // Calculate start offset including previous marked text
    const startNode = range.startContainer;
    const startBaseOffset = calculateOffset(startNode);
    const finalStartOffset = startBaseOffset + range.startOffset;

    // Create the highlight
    addHighlight({
      text: selectedText,
      startOffset: finalStartOffset,
      endOffset: finalStartOffset + selectedText.length,
      elementId: paragraph.getAttribute("data-paragraph-index") || "0",
    });

    // Clear the selection
    selection.removeAllRanges();
  }, [isEnabled, addHighlight]);

  // Apply highlights
  useEffect(() => {
    if (!containerRef.current) return;

    // Sort highlights by start offset to ensure proper ordering
    const sortedHighlights = [...highlights].sort(
      (a, b) => a.startOffset - b.startOffset
    );

    // Clear existing highlights
    sortedHighlights.forEach((highlight) => {
      const element = containerRef.current?.querySelector(
        `[data-highlight="${highlight.id}"]`
      );
      if (element) {
        const parent = element.parentNode;
        if (parent) {
          parent.replaceChild(
            document.createTextNode(element.textContent || ""),
            element
          );
        }
      }
    });

    // Normalize text nodes
    containerRef.current
      .querySelectorAll("[data-paragraph-index]")
      .forEach((el) => {
        el.normalize();
      });

    // Apply highlights in order
    sortedHighlights.forEach((highlight) => {
      try {
        const element = containerRef.current?.querySelector(
          `[data-paragraph-index="${highlight.elementId}"]`
        );
        if (!element) return;

        // Get all text nodes in the element
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

        // Find the appropriate text node and apply highlight
        let currentOffset = 0;
        for (const textNode of textNodes) {
          const nodeLength = textNode.textContent?.length || 0;
          const nodeEndOffset = currentOffset + nodeLength;

          // Check if this node contains our highlight
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
            mark.style.borderRadius = "2px";
            mark.addEventListener("dblclick", () =>
              removeHighlight(highlight.id)
            );

            try {
              range.surroundContents(mark);
            } catch (e) {
              console.warn("Failed to highlight range:", e);
            }
            break;
          }

          currentOffset = nodeEndOffset;
        }
      } catch (error) {
        console.error("Error applying highlight:", error);
      }
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
