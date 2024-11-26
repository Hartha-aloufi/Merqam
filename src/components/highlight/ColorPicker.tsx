import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { HIGHLIGHT_COLORS, HighlightColorKey } from "@/constants/highlights";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  activeColor: HighlightColorKey;
  onColorChange: (color: HighlightColorKey) => void;
  disabled?: boolean;
}

// Color names in Arabic
const colorNames: Record<HighlightColorKey, string> = {
  yellow: 'أصفر',
  green: 'أخضر',
  blue: 'أزرق',
  purple: 'بنفسجي'
};

export const ColorPicker = React.memo(function ColorPicker({ 
  activeColor, 
  onColorChange, 
  disabled 
}: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleColorSelect = React.useCallback((color: HighlightColorKey) => {
    onColorChange(color);
    setOpen(false);
  }, [onColorChange]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            // Fixed width
            "w-[100px] sm:w-[120px]",
            // Base styles
            "h-9 gap-2 pr-2 pl-1.5",
            "border border-input",
            // Mobile optimizations
            "touch-none select-none active:scale-95",
            // States
            "hover:bg-accent",
            "data-[state=open]:bg-accent",
            // Disabled state
            disabled && "opacity-50 cursor-not-allowed",
            // Font
            "font-normal"
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-1.5 flex-1">
            {/* Current Color Preview */}
            <div 
              className={cn(
                "h-5 w-5 rounded-sm shrink-0",
                "ring-1 ring-inset ring-input",
                "transition-transform"
              )}
              style={{ 
                backgroundColor: HIGHLIGHT_COLORS[activeColor].background
              }} 
            />
            {/* Color Name - Hide on small screens */}
            <span className="hidden sm:inline text-sm truncate">
              {colorNames[activeColor]}
            </span>
          </div>
          <ChevronDownIcon className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-[200px] p-1.5"
        sideOffset={8}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div 
          className="grid gap-0.5" 
          style={{ touchAction: 'none' }}
          onPointerDown={(e) => e.preventDefault()}
        >
          {Object.entries(HIGHLIGHT_COLORS).map(([key, { background }]) => {
            const isActive = key === activeColor;
            
            return (
              <button
                key={key}
                onClick={(e) => {
                  e.preventDefault();
                  handleColorSelect(key as HighlightColorKey);
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleColorSelect(key as HighlightColorKey);
                }}
                className={cn(
                  // Base styles
                  "flex items-center gap-3 w-full",
                  "px-3 py-2.5",
                  "rounded-md text-sm",
                  // Interactive states
                  "transition-all duration-150",
                  "hover:bg-accent active:bg-accent/80",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "touch-none select-none active:scale-[0.98]",
                  // Active state
                  isActive && "bg-accent"
                )}
                role="menuitem"
                aria-label={`Select ${colorNames[key as HighlightColorKey]} color`}
                style={{ touchAction: 'none' }}
              >
                {/* Color Preview */}
                <div 
                  className={cn(
                    "h-6 w-6 rounded-sm shrink-0",
                    "ring-1 ring-inset ring-input",
                    isActive && "ring-2 ring-primary"
                  )}
                  style={{ backgroundColor: background }}
                />
                
                {/* Color Name */}
                <span className="flex-1 text-right">
                  {colorNames[key as HighlightColorKey]}
                </span>
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default ColorPicker;