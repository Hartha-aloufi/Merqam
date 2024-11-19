import React, { useEffect } from "react";
import { TextHighlight } from "@/types/highlight";
import { processHighlights } from "@/lib/highlight-utils";

interface HighlightRendererProps {
  containerRef: React.RefObject<HTMLElement>;
  highlights: TextHighlight[];
  onRemoveHighlight: (id: string) => void;
}

/**
 * Component that handles rendering highlights in text content
 */
export const HighlightRenderer = React.memo(function HighlightRenderer({
  containerRef,
  highlights,
  onRemoveHighlight,
}: HighlightRendererProps) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Function to create highlight mark element
    const createHighlightMark = (highlight: TextHighlight): HTMLElement => {
      const mark = document.createElement("mark");
      mark.setAttribute("data-highlight", highlight.id);
      mark.style.backgroundColor = highlight.color;
      mark.style.borderRadius = "2px";
      mark.style.cursor = "pointer";
      mark.style.transition = "background-color 0.2s, filter 0.2s";
      // Add hover effect class
      mark.className = "hover:brightness-95";

      mark.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemoveHighlight(highlight.id);
      });

      return mark;
    };

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
        const element = container.querySelector(
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

                const markElement = createHighlightMark(highlight);

                try {
                  range.surroundContents(markElement);
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

    // Cleanup function
    return () => {
      const allMarks = container.querySelectorAll("mark[data-highlight]");
      allMarks.forEach((mark) => {
        mark.removeEventListener("dblclick", () => {});
      });
    };
  }, [containerRef, highlights, onRemoveHighlight]);

  return null;
});
