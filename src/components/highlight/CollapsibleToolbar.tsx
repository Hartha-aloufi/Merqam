// components/highlight/CollapsibleToolbar.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CollapsibleToolbarProps {
  children: React.ReactNode;
  pullTabContent: React.ReactNode;
  className?: string;
}

export const CollapsibleToolbar: React.FC<CollapsibleToolbarProps> = ({
  children,
  pullTabContent,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-40 transition-all duration-300",
        // Place it below the header (z-50)
        "top-16 md:top-[4.5rem]",
        isCollapsed ? "-translate-y-full" : "translate-y-0",
        className
      )}
    >
      {/* Main Toolbar */}
      <div
        className={cn(
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "border-b px-4 py-2 shadow-sm",
          "flex items-center gap-3"
        )}
      >
        {/* Toolbar Content */}
        <div className="flex-1 flex items-center gap-3">{children}</div>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 shrink-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Pull Tab (visible when collapsed) */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-1/2 -bottom-6 -translate-x-1/2"
          >
            <Button
              variant="outline"
              size="sm"
              className="h-6 rounded-t-none rounded-b-lg border-t-0 bg-background/95 px-2 py-0 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60"
              onClick={() => setIsCollapsed(false)}
            >
              {pullTabContent}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
