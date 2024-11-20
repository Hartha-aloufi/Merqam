// components/highlight/HighlightToolbar.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Highlighter, Trash2, X, ChevronDown } from "lucide-react";
import { HIGHLIGHT_COLORS, HighlightColorKey } from "@/constants/highlights";
import { CollapsibleToolbar } from "./CollapsibleToolbar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ColorButtonProps {
  color: HighlightColorKey;
  isActive: boolean;
  onClick: () => void;
}

const ColorButton: React.FC<ColorButtonProps> = ({
  color,
  isActive,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full p-4 rounded-lg transition-all",
      "hover:bg-muted",
      isActive && "bg-muted"
    )}
  >
    <div
      className="h-6 w-6 rounded"
      style={{ backgroundColor: HIGHLIGHT_COLORS[color].background }}
    />
    <span className="text-base capitalize">{color}</span>
    {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
  </button>
);

interface HighlightToolbarProps {
  isEnabled: boolean;
  isDeleteMode: boolean;
  onToggle: (enabled: boolean) => void;
  onToggleDeleteMode: (enabled: boolean) => void;
  activeColor: HighlightColorKey;
  onColorChange: (color: HighlightColorKey) => void;
  onClear: () => void;
  highlightsCount: number;
}

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  isEnabled,
  isDeleteMode,
  onToggle,
  onToggleDeleteMode,
  activeColor,
  onColorChange,
  onClear,
  highlightsCount,
}) => {
  // Create the content for the pull tab
  const pullTabContent = (
    <>
      <Highlighter className="ml-2 h-3 w-3" />
      {isEnabled ? (
        <div className="flex items-center gap-2">
          <span className="text-xs">التظليل مفعل</span>
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: HIGHLIGHT_COLORS[activeColor].background,
            }}
          />
        </div>
      ) : (
        <span className="text-xs">تفعيل التظليل</span>
      )}
      <ChevronDown className="mr-2 h-3 w-3" />
    </>
  );

  return (
    <CollapsibleToolbar pullTabContent={pullTabContent}>
      {/* Main Controls */}
      <div className="flex items-center gap-3">
        {/* Highlight Toggle */}
        <Button
          variant={isEnabled ? "default" : "outline"}
          size="icon"
          onClick={() => {
            onToggle(!isEnabled);
            if (isDeleteMode) onToggleDeleteMode(false);
          }}
          className="h-8 w-8"
        >
          <Highlighter className="h-4 w-4" />
        </Button>

        {isEnabled && (
          <>
            {/* Color Picker Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <div
                    className="h-4 w-4 rounded"
                    style={{
                      backgroundColor: HIGHLIGHT_COLORS[activeColor].background,
                    }}
                  />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>اختر لون التظليل</SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-2">
                  {Object.keys(HIGHLIGHT_COLORS).map((key) => (
                    <SheetClose asChild key={key}>
                      <ColorButton
                        color={key as HighlightColorKey}
                        isActive={key === activeColor}
                        onClick={() => onColorChange(key as HighlightColorKey)}
                      />
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Delete Mode Toggle */}
            {highlightsCount > 0 && (
              <Button
                variant={isDeleteMode ? "destructive" : "outline"}
                size="icon"
                onClick={() => onToggleDeleteMode(!isDeleteMode)}
                className="h-8 w-8"
              >
                {isDeleteMode ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </>
        )}
      </div>

      {/* Additional Info */}
      {isEnabled && (
        <div className="text-sm text-muted-foreground">
          {highlightsCount > 0 ? (
            <span>{highlightsCount} تظليلات</span>
          ) : (
            <span>لا توجد تظليلات</span>
          )}
        </div>
      )}
    </CollapsibleToolbar>
  );
};
