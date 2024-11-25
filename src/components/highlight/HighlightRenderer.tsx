// components/highlight/HighlightRenderer.tsx
import React, { useEffect } from "react";
import { TextHighlight } from "@/types/highlight";
import { processHighlights } from "@/lib/highlight-utils";
import { getHighlightColor } from "@/constants/highlights";
import { useHighlightPopover } from "./HighlightPopover";

interface HighlightRendererProps {
  containerRef: React.RefObject<HTMLElement>;
  highlights: TextHighlight[];
  onRemoveHighlight: (id: string) => void;
}

export const HighlightRenderer = React.memo(function HighlightRenderer({
  containerRef,
  highlights,
}: HighlightRendererProps) {
  const { showPopover } = useHighlightPopover();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
          mark.replaceWith(document.createTextNode(mark.textContent || ""));
        });

        // Normalize text nodes
        element.normalize();

        // Process highlights
        const processedHighlights = processHighlights(elementHighlights);

        // Apply highlights
        processedHighlights.forEach((highlight) => {
          try {
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
                mark.setAttribute("data-highlight", highlight.id);
                mark.setAttribute("data-color", highlight.color);
                mark.style.backgroundColor = getHighlightColor(highlight.color);
                mark.style.borderRadius = "2px";
                mark.style.cursor = "pointer";
                mark.style.transition = "background-color 0.2s";
                mark.className = "hover:brightness-95";

                // Handle click events on marks
                mark.addEventListener("click", (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  // Make sure we use the current state of the highlight
                  const currentHighlight = highlights.find(
                    (h) => h.id === highlight.id
                  );
                  if (currentHighlight) {
                    showPopover(currentHighlight, {
                      getBoundingClientRect: () => mark.getBoundingClientRect(),
                      contextElement: mark,
                    });
                  }
                });

                range.surroundContents(mark);
                break;
              }

              currentOffset = nodeEndOffset;
            }
          } catch (error) {
            console.error("Error applying highlight:", error);
          }
        });
      }
    );

    // Cleanup
    return () => {
      const allMarks = container.querySelectorAll("mark[data-highlight]");
      allMarks.forEach((mark) => {
        mark.removeEventListener("click", () => {});
        mark.replaceWith(document.createTextNode(mark.textContent || ""));
      });
    };
  }, [containerRef, highlights, showPopover]);

  return null;
});
