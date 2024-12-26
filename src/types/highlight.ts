// src/types/highlight.ts
import { HighlightColorKey } from '@/constants/highlights';

// Single highlight item within the array
export interface HighlightItem {
	id: string;
	elementId: string;
	startOffset: number;
	endOffset: number;
	color: HighlightColorKey;
	createdAt: string;
	updatedAt: string;
}



// DTO for creating/updating highlights
export interface UpsertHighlightDto {
	topicId: string;
	lessonId: string;
	highlight: Omit<HighlightItem, 'id' | 'createdAt' | 'updatedAt'>;
}

// DTO for removing highlights
export interface RemoveHighlightDto {
	topicId: string;
	lessonId: string;
	highlightId: string;
}

// DTO for updating highlight color
export interface UpdateHighlightColorDto {
	topicId: string;
	lessonId: string;
	highlightId: string;
	color: HighlightColorKey;
}

// Single highlight item within the array
export interface HighlightItem {
  id: string;
  elementId: string;
  startOffset: number;
  endOffset: number;
  color: HighlightColorKey;
  createdAt: string;
  updatedAt: string;
}

// The rendered version of a highlight (used in UI components)
export interface TextHighlight extends Omit<HighlightItem, 'updatedAt'> {
  text?: string; // Optional field populated from DOM
}

// Database row structure
export interface HighlightRow {
  id: string;
  userId: string;
  lessonId: string;
  topicId: string;
  highlights: HighlightItem[];
  createdAt: string;
  updatedAt: string;
}

// DTO for batch updating highlights
export interface BatchUpdateHighlightsDto {
  topicId: string;
  lessonId: string;
  highlights: HighlightItem[];
}