import React from "react";
import { Button } from "@/components/ui/button";
import { Highlighter, Trash2, Palette, X } from "lucide-react";
import { HIGHLIGHT_COLORS } from "@/types/highlight";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HighlightToolbarProps {
  isEnabled: boolean;
  isDeleteMode: boolean;
  onToggle: (enabled: boolean) => void;
  onToggleDeleteMode: (enabled: boolean) => void;
  activeColor: string;
  onColorChange: (color: string) => void;
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
  return (
    <div
      className={cn(
        "sticky top-16 z-10 mb-4",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "rounded-lg border p-2 shadow-sm",
        "flex items-center gap-2"
      )}
    >
      {/* Highlight Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isEnabled ? "تعطيل التظليل" : "تفعيل التظليل"}</p>
        </TooltipContent>
      </Tooltip>

      {isEnabled && (
        <>
          {/* Color Picker */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: activeColor }}
                    />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>اختر لون التظليل</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start">
              {Object.entries(HIGHLIGHT_COLORS).map(
                ([name, { background }]) => (
                  <DropdownMenuItem
                    key={name}
                    onClick={() => onColorChange(background)}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: background }}
                    />
                    <span className="capitalize">{name}</span>
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {highlightsCount > 0 && (
            <>
              {/* Delete Mode Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{isDeleteMode ? "إلغاء وضع الحذف" : "تفعيل وضع الحذف"}</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </>
      )}
    </div>
  );
};
