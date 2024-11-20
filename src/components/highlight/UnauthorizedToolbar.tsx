// components/highlight/UnauthorizedToolbar.tsx
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Highlighter, LogIn } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface UnauthorizedToolbarProps {
  returnUrl: string;
  className?: string;
}

export const UnauthorizedToolbar: React.FC<UnauthorizedToolbarProps> = ({
  returnUrl,
  className,
}) => {
  return (
    <div
      className={cn(
        "sticky top-16 z-10 mb-4",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "rounded-lg border p-2",
        "flex items-center gap-2 overflow-hidden",
        className
      )}
    >
      {/* Highlight Icon */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="p-2 rounded-md bg-muted">
            <Highlighter className="h-4 w-4 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>ميزة التظليل</p>
        </TooltipContent>
      </Tooltip>

      {/* Message */}
      <div className="flex-1 text-sm text-muted-foreground">
        سجل دخولك للوصول إلى ميزة التظليل والمزيد من المميزات
      </div>

      {/* Login Button */}
      <Link
        href={`/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}`}
        className="shrink-0"
      >
        <Button size="sm" className="gap-2">
          <LogIn className="h-4 w-4" />
          تسجيل الدخول
        </Button>
      </Link>
    </div>
  );
};
