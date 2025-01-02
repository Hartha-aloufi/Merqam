// services/highlight.service.ts
import { supabase } from '@/client/lib/supabase';
import type {
	BatchUpdateHighlightsDto,
	HighlightItem,
} from '@/types/highlight';
import { Database } from '@/types/supabase';

type DbHighlightInsert = Database['public']['Tables']['highlights']['Insert'];

interface StoredHighlightData {
	highlights: HighlightItem[];
	groups?: { [groupId: string]: { color: string } };
}

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

		// Parse stored data
		const storedData = data.highlights as StoredHighlightData;
		return {
			highlights: (storedData.highlights || []).map((h) => ({
				...h,
				// Ensure groupId is preserved if it exists
				...(h.groupId &&
					storedData.groups?.[h.groupId] && {
						groupId: h.groupId,
						color: storedData.groups[h.groupId].color,
					}),
			})),
		};
	},

	/**
	 * Batch update highlights for a lesson
	 * Now preserves group information
	 */
	batchUpdateHighlights: async ({
		topicId,
		lessonId,
		highlights,
	}: BatchUpdateHighlightsDto) => {
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();
		if (userError) throw userError;
		if (!user) throw new Error('No authenticated user');

		// Extract and organize group information
		const groups: { [groupId: string]: { color: string } } = {};
		highlights.forEach((h) => {
			if (h.groupId) {
				groups[h.groupId] = { color: h.color };
			}
		});

		const now = new Date().toISOString();

		// Prepare data for storage
		const storedData: StoredHighlightData = {
			highlights,
			...(Object.keys(groups).length > 0 && { groups }),
		};

		// Use upsert to create or update the row
		const { data, error } = await supabase
			.from('highlights')
			.upsert(
				{
					user_id: user.id,
					topic_id: topicId,
					lesson_id: lessonId,
					highlights: storedData,
					updated_at: now,
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
