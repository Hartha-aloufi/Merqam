// src/components/admin/editor/jsx-components-config.ts
import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";
import ABC from "../../../components/video/EditableVideoTimeAt";

/**
 * JSX component descriptors for the MDX editor
 * Each descriptor defines how a component should be handled in the editor
 */
export const jsxComponentDescriptors: JsxComponentDescriptor[] = [
  {
    name: "VideoTimeAt",
    kind: "flow", // block level component
    source: "../../../../../../components/video/EditableVideoTimeAt", // virtual import source
    props: [
      { name: "startTime", type: "number" },
      { name: "endTime", type: "number" },
    ],
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: "EditableVideoTimeAt",
    kind: "flow",
    source: "../../../../../../components/video/EditableVideoTimeAt",
    props: [
      { name: "startTime", type: "number" },
      { name: "endTime", type: "number" },
      {
        name: "onChange",
        type: "expression",
        defaultValue: "({ startTime, endTime }) => void",
      },
    ],
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
];

/**
 * Factory function to create toolbar button content for inserting JSX components
 */
export const createInsertJsxButtons = (insertJsx: (options: any) => void) => {
  return {
    insertVideoTimeAt: () => {
      insertJsx({
        name: "VideoTimeAt",
        kind: "flow",
        props: {
          startTime: 0,
          endTime: 10,
        },
      });
    },
    insertEditableVideoTimeAt: () => {
      insertJsx({
        name: "EditableVideoTimeAt",
        kind: "flow",
        props: {
          startTime: 0,
          endTime: 10,
          onChange: {
            type: "expression",
            value:
              "({ startTime, endTime }) => console.log(startTime, endTime)",
          },
        },
      });
    },
  };
};
