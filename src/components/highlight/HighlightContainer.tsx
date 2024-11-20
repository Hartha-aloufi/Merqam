// components/highlight/HighlightContainer.tsx
import React, { useRef } from "react";
import { useHighlightState } from "@/hooks/highlights/use-highlights-state";
import { useHighlightStorage } from "@/hooks/highlights/use-highlights-storage";
import { useHighlightSelection } from "@/hooks/highlights/use-highlight-selection";
import { useSession } from "@/hooks/use-auth-query";
import { usePathname } from "next/navigation";
import { HighlightToolbar } from "./HighlightToolbar";
import { UnauthorizedToolbar } from "./UnauthorizedToolbar";
import { HighlightRenderer } from "./HighlightRenderer";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HighlightContainerProps {
  topicId: string;
  lessonId: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Container component that provides highlighting functionality for authenticated users
 * and a friendly prompt for unauthorized users
 */
export const HighlightContainer: React.FC<HighlightContainerProps> = ({
  topicId,
  lessonId,
  children,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const isAuthenticated = !!session?.data.session;
  const pathname = usePathname();

  // Only initialize these hooks if user is authenticated
  const state = useHighlightState();
  const storage = useHighlightStorage(topicId, lessonId, state.activeColor);

  // Handle text selection
  const handleSelection = useHighlightSelection({
    isEnabled: state.isEnabled,
    containerRef,
    highlights: storage.highlights,
    onAddHighlight: storage.addHighlight,
    onRemoveHighlights: storage.removeHighlight,
  });

  // If not authenticated, show unauthorized toolbar and content
  if (!isAuthenticated) {
    return (
      <div className="relative">
        <UnauthorizedToolbar returnUrl={pathname} className={className} />
        <div>{children}</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading State */}
      {storage.isLoading && (
        <div className="fixed bottom-4 left-4 z-50 rounded-full bg-background/95 p-2 shadow-md backdrop-blur">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* Toolbar */}
      <HighlightToolbar
        isEnabled={state.isEnabled}
        isDeleteMode={state.isDeleteMode}
        onToggle={state.toggleHighlighting}
        onToggleDeleteMode={state.toggleDeleteMode}
        activeColor={state.activeColor}
        onColorChange={state.setActiveColor}
        onClear={storage.clearHighlights}
        highlightsCount={storage.highlights.length}
      />

      {/* Content Container */}
      <div
        ref={containerRef}
        onMouseUp={!state.isDeleteMode ? handleSelection : undefined}
        className={cn(
          "relative transition-colors duration-200",
          state.isEnabled && !state.isDeleteMode && "cursor-text",
          state.isEnabled && state.isDeleteMode && "cursor-pointer",
          className
        )}
      >
        {/* Highlight Renderer */}
        <HighlightRenderer
          containerRef={containerRef}
          highlights={storage.highlights}
          onRemoveHighlight={storage.removeHighlight}
        />

        {/* Content */}
        {children}
      </div>
    </div>
  );
};
