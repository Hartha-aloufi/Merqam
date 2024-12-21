// components/highlight/HighlightToolbar.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Highlighter, ChevronDown } from "lucide-react";
import { CollapsibleToolbar } from "./CollapsibleToolbar";
import { ColorPicker } from "./ColorPicker";
import { HIGHLIGHT_COLORS, HighlightColorKey } from "@/constants/highlights";

interface HighlightToolbarProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  activeColor: HighlightColorKey;
  onColorChange: (color: HighlightColorKey) => void;
  highlightsCount: number;
}

/**
 * Toolbar component for highlight controls
 * Simplified version without delete mode
 */
export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  isEnabled,
  onToggle,
  activeColor,
  onColorChange,
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
          onClick={() => onToggle(!isEnabled)}
          className="h-9 w-9"
        >
          <Highlighter className="h-4 w-4" />
        </Button>

        {isEnabled && (
          <ColorPicker
            activeColor={activeColor}
            onColorChange={onColorChange}
          />
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
