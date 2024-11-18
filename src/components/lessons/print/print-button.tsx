import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PrintButtonProps {
  onClick: () => void;
  className?: string;
}

const PrintButton = ({ onClick, className }: PrintButtonProps) => {
  // Use print:hidden to ensure the button and its tooltip are hidden in print view
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={onClick}
          className={cn("print:hidden", className)}
        >
          <Printer className="h-4 w-4" />
          <span className="sr-only">تحميل كملف PDF</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>تحميل كملف PDF</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default PrintButton;
