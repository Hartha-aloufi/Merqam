import React, { useEffect } from "react";
import { TextHighlight } from "@/types/highlight";
import { processHighlights } from "@/lib/highlight-utils";
import { getHighlightColor } from "@/constants/highlights";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HighlightRendererProps {
  containerRef: React.RefObject<HTMLElement>;
  highlights: TextHighlight[];
  onRemoveHighlight: (id: string) => void;
}

export const HighlightRenderer = React.memo(function HighlightRenderer({
  containerRef,
  highlights,
  onRemoveHighlight,
}: HighlightRendererProps) {
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

        // Process highlights
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
                mark.setAttribute("data-highlight", highlight.id);
                mark.style.backgroundColor = getHighlightColor(highlight.color);
                mark.style.borderRadius = "2px";
                mark.style.cursor = "pointer";
                mark.style.transition = "background-color 0.2s";
                mark.className = "hover:brightness-95";

                // Add popover elements
                const popoverTrigger = document.createElement("div");
                popoverTrigger.setAttribute("data-state", "closed");
                popoverTrigger.setAttribute("role", "button");
                popoverTrigger.className = "inline-block";

                mark.onclick = (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  // Create and show popover content
                  const popover = document.createElement("div");
                  popover.className = cn(
                    "z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
                    "data-[state=open]:animate-in data-[state=open]:fade-in-0",
                    "fixed"
                  );

                  // Position popover
                  const rect = mark.getBoundingClientRect();
                  popover.style.top = `${rect.bottom + 5}px`;
                  popover.style.left = `${rect.left}px`;

                  // Add delete button
                  const button = document.createElement("button");
                  button.className = cn(
                    "inline-flex items-center justify-center whitespace-nowrap",
                    "rounded-md text-sm font-medium transition-colors",
                    "bg-destructive text-destructive-foreground shadow hover:bg-destructive/90",
                    "h-9 px-4 py-2 w-full"
                  );
                  button.innerHTML =
                    '<svg class="h-4 w-4 ml-2" viewBox="0 0 24 24"><path d="M3 6h18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>حذف التظليل';

                  button.onclick = () => {
                    onRemoveHighlight(highlight.id);
                    popover.remove();
                  };

                  popover.appendChild(button);
                  document.body.appendChild(popover);

                  // Close popover when clicking outside
                  const closePopover = (e: MouseEvent) => {
                    if (
                      !popover.contains(e.target as Node) &&
                      !mark.contains(e.target as Node)
                    ) {
                      popover.remove();
                      document.removeEventListener("click", closePopover);
                    }
                  };

                  // Add delay to avoid immediate trigger
                  setTimeout(() => {
                    document.addEventListener("click", closePopover);
                  }, 0);
                };

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

    // Cleanup function
    return () => {
      const allMarks = container.querySelectorAll("mark[data-highlight]");
      allMarks.forEach((mark) => {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(
            document.createTextNode(mark.textContent || ""),
            mark
          );
        }
      });
    };
  }, [containerRef, highlights, onRemoveHighlight]);

  return null;
});
