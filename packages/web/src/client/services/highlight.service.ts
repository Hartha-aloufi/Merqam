// src/client/services/highlight.service.ts
import { httpClient } from '../lib/http-client';
import type {
	BatchUpdateHighlightsDto,
	HighlightItem,
} from '@/types/highlight';

interface GetHighlightsResponse {
	highlights: HighlightItem[];
}

export class HighlightService {
	private baseUrl = '/highlights';

	/**
	 * Get highlights for a specific lesson
	 */
	async getHighlights(
		lessonId: string
	): Promise<GetHighlightsResponse> {
		const { data } = await httpClient.get<GetHighlightsResponse>(
			this.baseUrl,
			{
				params: {
					lesson_id: lessonId,
				},
			}
		);
		return data;
	}

	/**
	 * Batch update highlights for a lesson
	 */
	async batchUpdateHighlights(
		updateDto: BatchUpdateHighlightsDto
	): Promise<void> {
		await httpClient.post(this.baseUrl, {
			lesson_id: updateDto.lessonId,
			highlights: updateDto.highlights,
		});
	}
}
