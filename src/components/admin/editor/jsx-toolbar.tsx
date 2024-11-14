// src/components/admin/editor/jsx-toolbar.tsx
import {
  usePublisher,
  insertJsx$,
  activeEditor$,
  useCellValue,
} from "@mdxeditor/editor";
import { $getSelection, $isRangeSelection } from "lexical";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import type { BlockContent } from "mdast";
import type { JsxProperties } from "@mdxeditor/editor";

/**
 * Creates props object with proper types for JSX insertion
 */
const createComponentProps = (): JsxProperties => {
  const commonProps: JsxProperties = {
    startTime: {
      type: "expression",
      value: "0",
    },
    endTime: {
      type: "expression",
      value: "0",
    },
  };

  return commonProps;
};

/**
 * Toolbar dropdown for inserting JSX components
 */
export function InsertVideoTime() {
  const insertJsx = usePublisher(insertJsx$);
  const editor = useCellValue(activeEditor$);

  const handleInsertVideoTime = () => {
    if (!editor) return;

    let selectedText = "";
    let shouldRemoveParent = false;
    let parentNode = null;

    // First, read the editor state
    editor.getEditorState().read(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        selectedText = selection.getTextContent();

        // Check if entire paragraph is selected
        const anchorNode = selection.anchor.getNode();
        const focusNode = selection.focus.getNode();

        if (
          anchorNode === focusNode &&
          selection.anchor.offset === 0 &&
          selection.focus.offset === anchorNode.getTextContentSize()
        ) {
          shouldRemoveParent = true;
          parentNode = anchorNode.getParent();
        }
      }
    });

    // Then, update the editor state
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        if (shouldRemoveParent && parentNode) {
          parentNode.remove();
        } else {
          selection.removeText();
        }
      }

      // Only insert if we had selected text
      if (selectedText) {
        insertJsx({
          name: "VideoTimeAt",
          kind: "flow",
          props: createComponentProps(),
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: selectedText,
                },
              ],
            } as BlockContent,
          ],
        });
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      title="Wrap with Video Time"
      onClick={handleInsertVideoTime}
    >
      <Video className="h-4 w-4" />
    </Button>
  );
}
