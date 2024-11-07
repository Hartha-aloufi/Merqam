// components/admin/editor/editor-config.ts
import {
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    BlockTypeSelect,
    UndoRedo,
    BoldItalicUnderlineToggles,
    toolbarPlugin,
} from "@mdxeditor/editor";

export const defaultEditorPlugins = [
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    thematicBreakPlugin(),
    markdownShortcutPlugin(),
    toolbarPlugin({
        toolbarContents: () => (
            <>
            <UndoRedo />
            < BoldItalicUnderlineToggles />
            <BlockTypeSelect />
            </>
        ),
    }),
];

export const defaultEditorStyles = {
    minHeight: "500px",
    outline: "none",
};