// src/services/highlight.service.ts
import { supabase } from '@/lib/supabase';
import type {
	BatchUpdateHighlightsDto,
	HighlightItem,
} from '@/types/highlight';
import { Database } from '@/types/supabase';

type DbHighlightInsert = Database['public']['Tables']['highlights']['Insert'];

/**
 * Service for managing highlights with the new data model
 * Each lesson-user pair has a single row containing an array of highlights
 */
export const highlightService = {
	/**
	 * Get highlights for a specific lesson
	 */
	getHighlights: async (
		topicId: string,
		lessonId: string
	): Promise<{ highlights: HighlightItem[] }> => {
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();
		if (userError) throw userError;
		if (!user) throw new Error('No authenticated user');

		const { data, error } = await supabase
			.from('highlights')
			.select()
			.eq('user_id', user.id)
			.eq('topic_id', topicId)
			.eq('lesson_id', lessonId)
			.maybeSingle();

		if (error) throw error;

		if (!data) {
			return { highlights: [] };
		}

		return {
			highlights: ((data.highlights as any[]) || []).map((h) => ({
				id: h.id,
				elementId: h.elementId,
				startOffset: h.startOffset,
				endOffset: h.endOffset,
				color: h.color,
				createdAt: h.createdAt,
				updatedAt: h.updatedAt,
			})),
		};
	},

	/**
	 * Batch update highlights for a lesson
	 * This will create or update the entire highlights array
	 */
	batchUpdateHighlights: async ({
		topicId,
		lessonId,
		highlights,
	}: BatchUpdateHighlightsDto) => {
		// Get current user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();
		if (userError) throw userError;
		if (!user) throw new Error('No authenticated user');

		const now = new Date().toISOString();

		// Use upsert to create or update the row
		const { data, error } = await supabase
			.from('highlights')
			.upsert(
				{
					user_id: user.id,
					topic_id: topicId,
					lesson_id: lessonId,
					highlights,
					updated_at: now,
					// Only set created_at if it's a new row
					created_at: now,
				} satisfies DbHighlightInsert,
				{
					onConflict: 'user_id,lesson_id',
				}
			)
			.select()
			.single();

		if (error) throw error;
		return data;
	},
};
