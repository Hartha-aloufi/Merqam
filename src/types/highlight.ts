// types/highlight.ts
import { HighlightColorKey } from '@/constants/highlights';

export interface TextHighlight {
  id: string;
  startOffset: number;
  endOffset: number;
  elementId: string;
  color: HighlightColorKey;
  createdAt: string;
  text?: string; // Optional since we reconstruct it from DOM
}