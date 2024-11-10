// src/components/admin/editor/jsx-toolbar.tsx
import { usePublisher } from "@mdxeditor/editor";
import { insertJsx$ } from "@mdxeditor/editor";
import { createInsertJsxButtons } from "./jsx-components-config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Video } from "lucide-react";

/**
 * Toolbar dropdown for inserting JSX components
 */
export function InsertJsxComponents() {
  const insertJsx = usePublisher(insertJsx$);
  const jsxButtons = createInsertJsxButtons(insertJsx);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Insert JSX Component">
          <Video className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={jsxButtons.insertVideoTimeAt}>
          Insert Video Time
        </DropdownMenuItem>
        <DropdownMenuItem onClick={jsxButtons.insertEditableVideoTimeAt}>
          Insert Editable Video Time
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
