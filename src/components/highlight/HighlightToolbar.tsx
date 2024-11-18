import React from 'react';
import { Button } from '@/components/ui/button';
import { Highlighter, Delete } from 'lucide-react';
import { HIGHLIGHT_COLORS } from '@/types/highlight';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HighlightToolbarProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  activeColor: string;
  onColorChange: (color: string) => void;
  onClear: () => void;
  highlightsCount: number;
}

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  isEnabled,
  onToggle,
  activeColor,
  onColorChange,
  onClear,
  highlightsCount
}) => {
  return (
    <div
      className={cn(
        "sticky top-16 z-10 mb-4 flex items-center justify-between",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "rounded-lg border p-2 shadow-sm"
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          variant={isEnabled ? "default" : "outline"}
          size="sm"
          onClick={() => onToggle(!isEnabled)}
          className="gap-2"
        >
          <Highlighter className="h-4 w-4" />
          {isEnabled ? "تم تفعيل التظليل" : "تفعيل التظليل"}
        </Button>

        {isEnabled && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <div
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: activeColor }}
                  />
                </Button>
              </DropdownMenuTrigger>
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
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="gap-2 text-destructive"
              >
                <Delete className="h-4 w-4" />
                مسح التظليل ({highlightsCount})
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};