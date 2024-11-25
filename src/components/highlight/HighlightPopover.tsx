import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HighlightColorKey, HIGHLIGHT_COLORS } from "@/constants/highlights";
import { PopoverClose } from "@radix-ui/react-popover";

interface HighlightPopoverProps {
  children: React.ReactNode;
  onDelete: () => void;
  color: HighlightColorKey;
  text: string;
  className?: string;
}

/**
 * A popover component that shows highlight actions (delete)
 * Appears when user clicks on a highlight
 */
export default function HighlightPopover({
  children,
  onDelete,
  color,
  text,
  className,
}: HighlightPopoverProps) {
  // Track popover open state
  const [isOpen, setIsOpen] = useState(false);

  // Keep button ref for keyboard handling
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  // Delete handler with confirmation
  const handleDelete = useCallback(() => {
    setIsOpen(false);
    onDelete();
  }, [onDelete]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "relative cursor-pointer transition-all",
            "hover:opacity-90",
            "active:opacity-80",
            className
          )}
          style={{
            backgroundColor: HIGHLIGHT_COLORS[color].background,
            touchAction: "manipulation", // Better touch handling
          }}
        >
          {children}
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-64 p-3 space-y-3"
        onOpenAutoFocus={(e) => {
          // Prevent focus trap issues
          e.preventDefault();
          deleteButtonRef.current?.focus();
        }}
      >
        {/* Show highlighted text */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {text}
        </p>

        <div className="flex items-center justify-between gap-2">
          {/* Delete button */}
          <Button
            ref={deleteButtonRef}
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 ml-2" />
            حذف التظليل
          </Button>

          {/* Cancel button */}
          <PopoverClose asChild>
            <Button variant="outline" size="sm" className="w-full">
              إلغاء
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
