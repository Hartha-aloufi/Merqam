import React, { useRef, useCallback } from "react";
import { useHighlightState } from "@/hooks/highlights/use-highlights-state";
import { useHighlightStorage } from "@/hooks/highlights/use-highlights-storage";
import { useHighlightSelection } from "@/hooks/highlights/use-highlight-selection";
import { useSession } from "@/hooks/use-auth-query";
import { HighlightToolbar } from "./HighlightToolbar";
import { UnauthorizedToolbar } from "./UnauthorizedToolbar";
import { HighlightRenderer } from "./HighlightRenderer";
import { HighlightPopoverProvider } from "./HighlightPopover";
import { HighlightColorKey } from "@/constants/highlights";
import { cn } from "@/lib/utils";

interface HighlightContainerProps {
  topicId: string;
  lessonId: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Container component that provides highlighting functionality
 * Manages highlighting state, storage, selection, and UI components
 */
export const HighlightContainer: React.FC<HighlightContainerProps> = ({
  topicId,
  lessonId,
  children,
  className,
}) => {
  // Reference to the container element for highlight positioning
  const containerRef = useRef<HTMLDivElement>(null);

  // Authentication state
  const { data: session } = useSession();
  const isAuthenticated = !!session?.data.session;

  // Highlighting state and storage
  const state = useHighlightState();
  const storage = useHighlightStorage(topicId, lessonId, state.activeColor);

  // Handle text selection for new highlights
  const handleSelection = useHighlightSelection({
    isEnabled: state.isEnabled,
    containerRef,
    highlights: storage.highlights,
    onAddHighlight: storage.addHighlight,
    onRemoveHighlights: storage.removeHighlight,
  });

  // Handle color updates for existing highlights
  const handleUpdateHighlight = useCallback(
    (id: string, color: HighlightColorKey) => {
      storage.updateHighlight(id, { color });
    },
    [storage]
  );

  // Render unauthorized state
  if (!isAuthenticated) {
    return (
      <div className="relative">
        <UnauthorizedToolbar />
        <div className="pt-14">{children}</div>
      </div>
    );
  }

  return (
    <HighlightPopoverProvider
      onRemoveHighlight={storage.removeHighlight}
      onUpdateHighlight={handleUpdateHighlight}
    >
      <div className="relative">
        {/* Toolbar */}
        <HighlightToolbar
          isEnabled={state.isEnabled}
          onToggle={state.toggleHighlighting}
          activeColor={state.activeColor}
          onColorChange={state.setActiveColor}
          highlightsCount={storage.highlights.length}
        />

        {/* Content with highlights */}
        <div className="pt-14">
          <div
            ref={containerRef}
            onMouseUp={state.isEnabled ? handleSelection : undefined}
            onTouchEnd={state.isEnabled ? handleSelection : undefined}
            className={cn(
              "relative transition-colors duration-200",
              state.isEnabled && "cursor-text",
              className
            )}
          >
            {/* Highlight overlay */}
            <HighlightRenderer
              containerRef={containerRef}
              highlights={storage.highlights}
              onRemoveHighlight={storage.removeHighlight}
            />

            {/* Original content */}
            {children}
          </div>
        </div>

        {/* Loading indicator */}
        {storage.isLoading && (
          <div className="fixed bottom-4 left-4 z-50 rounded-full bg-background/95 p-2 shadow-md backdrop-blur">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent" />
          </div>
        )}
      </div>
    </HighlightPopoverProvider>
  );
};
