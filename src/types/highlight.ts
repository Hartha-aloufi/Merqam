// src/types/highlight.ts
import { HighlightColorKey } from '@/constants/highlights';

export interface HighlightItem {
	id: string;
	elementId: string;
	startOffset: number;
	endOffset: number;
	color: HighlightColorKey;
	text?: string;
	createdAt: string;
	updatedAt: string;
	groupId?: string;
}

export interface BatchUpdateHighlightsDto {
	topicId: string;
	lessonId: string;
	highlights: HighlightItem[];
}

export interface StoredHighlightData {
	highlights: HighlightItem[];
	groups?: {
		[groupId: string]: {
			color: HighlightColorKey;
		};
	};
}
