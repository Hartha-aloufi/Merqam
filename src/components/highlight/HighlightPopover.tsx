import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { Trash2 } from "lucide-react";
import { TextHighlight } from "@/types/highlight";
import {
  FloatingPortal,
  useFloating,
  useInteractions,
  useDismiss,
  useHover,
  useClick,
  useFocus,
  arrow,
  offset,
  flip,
  shift,
} from "@floating-ui/react";
import { cn } from "@/lib/utils";
import { HIGHLIGHT_COLORS, HighlightColorKey } from "@/constants/highlights";

interface PopoverState {
  highlight: TextHighlight | null;
  anchorElement: HTMLElement | null;
}

interface PopoverContextType {
  showPopover: (highlight: TextHighlight, element: HTMLElement) => void;
  hidePopover: () => void;
  onRemoveHighlight?: (id: string) => void | Promise<void>;
  onUpdateHighlight?: (
    id: string,
    color: HighlightColorKey
  ) => void | Promise<void>;
}

const PopoverContext = createContext<PopoverContextType | null>(null);
interface ColorButtonProps {
  color: HighlightColorKey;
  isActive: boolean;
  onClick: () => void;
}

const ColorButton = React.memo(
  ({ color, isActive, onClick }: ColorButtonProps) => (
    <button
      onClick={onClick}
      className={cn(
        "w-6 h-6 rounded-full transition-all duration-150",
        "hover:scale-110 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "focus:ring-primary focus:ring-offset-background",
        isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      style={{ backgroundColor: HIGHLIGHT_COLORS[color].background }}
      title={`Change to ${color}`}
    />
  )
);

ColorButton.displayName = "ColorButton";

interface HighlightPopoverProviderProps {
  children: React.ReactNode;
  onRemoveHighlight?: (id: string) => void | Promise<void>;
  onUpdateHighlight?: (
    id: string,
    color: HighlightColorKey
  ) => void | Promise<void>;
}

/**
 * Provider component that manages highlight popovers
 */
export function HighlightPopoverProvider({
  children,
  onRemoveHighlight,
  onUpdateHighlight,
}: HighlightPopoverProviderProps) {

  const [popoverState, setPopoverState] = useState<PopoverState>({
    highlight: null,
    anchorElement: null,
  });

  const arrowRef = useRef(null);

  const { refs, floatingStyles, context, middlewareData } = useFloating({
    open: !!popoverState.highlight,
    placement: "top",
    middleware: [
      offset(8),
      flip({
        fallbackPlacements: ["bottom"],
      }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: (reference, floating, update) => {
      const cleanup = update();
      return cleanup;
    },
  });

  // Setup interactions (hover, click, focus)
  const { getFloatingProps } = useInteractions([
    useHover(context, { delay: { open: 0, close: 150 } }),
    useFocus(context),
    useClick(context),
    useDismiss(context, { outsidePress: true }),
  ]);

  const showPopover = useCallback(
    (highlight: TextHighlight, element: HTMLElement) => {
      setPopoverState({ highlight, anchorElement: element });
      refs.setReference(element);
    },
    [refs]
  );

  const hidePopover = useCallback(() => {
    setPopoverState({ highlight: null, anchorElement: null });
  }, []);

  return (
    <PopoverContext.Provider
      value={{ showPopover, hidePopover, onRemoveHighlight, onUpdateHighlight }}
    >
      {children}
      {popoverState.highlight && popoverState.anchorElement && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className={cn(
              // Base styles
              "z-50 bg-popover rounded-xl border shadow-lg",
              // Spacing and layout
              "p-2.5",
              "flex items-center gap-3",
              // Animation
              "animate-in fade-in-0 zoom-in-95 duration-150",
              // Extra styles for better visibility
              "backdrop-blur-sm bg-opacity-95"
            )}
            onMouseDown={(e) => e.preventDefault()} // Prevent text selection
          >
            {/* Color Options */}
            <div className="flex items-center gap-2">
              {Object.entries(HIGHLIGHT_COLORS).map(([key]) => (
                <ColorButton
                  key={key}
                  color={key as HighlightColorKey}
                  isActive={key === popoverState.highlight?.color}
                  onClick={() => {
                    onUpdateHighlight?.(
                      popoverState.highlight!.id,
                      key as HighlightColorKey
                    );
                    hidePopover();
                  }}
                />
              ))}
            </div>

            {/* Separator with improved visibility */}
            <div className="w-px h-6 bg-border/50" />

            {/* Delete Button with improved hover states */}
            <button
              onClick={() => {
                onRemoveHighlight?.(popoverState.highlight!.id);
                hidePopover();
              }}
              className={cn(
                "h-7 w-7 flex items-center justify-center",
                "rounded-full transition-colors duration-150",
                "hover:bg-destructive hover:text-destructive-foreground",
                "focus:outline-none focus:ring-2 focus:ring-destructive",
                "active:scale-95"
              )}
              title="Delete highlight"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Arrow with improved styling */}
            <div
              ref={arrowRef}
              className={cn(
                "absolute -bottom-2 rotate-45",
                "w-4 h-4 bg-popover border",
                "border-t-0 border-l-0",
                "shadow-lg"
              )}
              style={{
                left:
                  middlewareData.arrow?.x != null
                    ? `${middlewareData.arrow.x}px`
                    : "",
                top:
                  middlewareData.arrow?.y != null
                    ? `${middlewareData.arrow.y}px`
                    : "",
              }}
            />
          </div>
        </FloatingPortal>
      )}
    </PopoverContext.Provider>
  );
}

export function useHighlightPopover() {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error(
      "useHighlightPopover must be used within a HighlightPopoverProvider"
    );
  }
  return context;
}
