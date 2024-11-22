// src/components/highlight/ColorPicker.tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HIGHLIGHT_COLORS, HighlightColorKey } from "@/constants/highlights";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  activeColor: HighlightColorKey;
  onColorChange: (color: HighlightColorKey) => void;
  disabled?: boolean;
}

/**
 * Color picker component that supports mouse, touch, and pen input
 * Uses a dropdown menu for better mobile experience
 */
export function ColorPicker({
  activeColor,
  onColorChange,
  disabled,
}: ColorPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={disabled}
          // Add touch action none to prevent iOS double-tap zoom
          style={{ touchAction: "none" }}
        >
          <div
            className="h-4 w-4 rounded transition-colors"
            style={{
              backgroundColor: HIGHLIGHT_COLORS[activeColor].background,
            }}
          />
          <span className="sr-only">اختر لون التظليل</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(HIGHLIGHT_COLORS).map(([key, { background }]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onColorChange(key as HighlightColorKey)}
            // Use larger touch targets for better mobile experience
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              "hover:bg-accent",
              "active:bg-accent/80", // Feedback for touch/pen
              // Show active state
              key === activeColor && "bg-accent"
            )}
            // Improve touch handling
            style={{ touchAction: "manipulation" }}
          >
            {/* Color preview */}
            <div
              className={cn(
                "h-5 w-5 rounded transition-transform",
                "hover:scale-110",
                // Scale effect on active color
                key === activeColor && "scale-110"
              )}
              style={{ backgroundColor: background }}
            />
            {/* Color label */}
            <span className="flex-1 text-sm capitalize">
              {getColorLabel(key as HighlightColorKey)}
            </span>
            {/* Active indicator */}
            {key === activeColor && (
              <div className="h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper function to get Arabic color labels
function getColorLabel(color: HighlightColorKey): string {
  const labels: Record<HighlightColorKey, string> = {
    yellow: "أصفر",
    green: "أخضر",
    blue: "أزرق",
    purple: "بنفسجي",
  };
  return labels[color];
}
