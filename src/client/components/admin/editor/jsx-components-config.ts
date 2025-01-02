// src/components/admin/editor/jsx-components-config.ts
import type { JsxComponentDescriptor } from '@mdxeditor/editor';
import { VideoTimeEditor } from './video-time-editor';

/**
 * JSX component descriptors for the MDX editor
 * Each descriptor defines how a component should be handled in the editor
 */
export const jsxComponentDescriptors: JsxComponentDescriptor[] = [
  {
    name: 'VideoTimeAt',
    kind: 'text',
    source: '@/components/video',
    props: [
      { name: 'startTime', type: "string" },
      { name: 'endTime', type: 'string' },
    ],
    hasChildren: true,
    Editor: VideoTimeEditor,
  }
];