// components/admin/editor/editor-toolbar.tsx
"use client";

import { SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditorToolbarProps {
  onSave: () => void;
  isSaving: boolean;
}

export function EditorToolbar({ onSave, isSaving }: EditorToolbarProps) {
  return (
    <div className="container py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                disabled={isSaving}
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                {isSaving ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>حفظ التغييرات (Ctrl + S)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
