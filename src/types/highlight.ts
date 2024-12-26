// types/highlight.ts
import { HighlightColorKey } from '@/constants/highlights';

export interface HighlightGroup {
	id: string;
	color: HighlightColorKey;
}

export interface HighlightItem {
	id: string;
	elementId: string;
	startOffset: number;
	endOffset: number;
	color: HighlightColorKey;
	createdAt: string;
	updatedAt: string;
	groupId?: string;
}

export interface TextHighlight extends Omit<HighlightItem, 'updatedAt'> {
	text?: string;
	isGrouped?: boolean;
	isFirstInGroup?: boolean;
	isLastInGroup?: boolean;
}

export interface BatchUpdateHighlightsDto {
	topicId: string;
	lessonId: string;
	highlights: HighlightItem[];
}

// Type for the stored data in Supabase
export interface StoredHighlightData {
	highlights: HighlightItem[];
	groups?: {
		[groupId: string]: {
			color: HighlightColorKey;
		};
	};
}
