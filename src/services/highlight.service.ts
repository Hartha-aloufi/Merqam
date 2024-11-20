// services/highlight.service.ts
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { HighlightColorKey } from '@/constants/highlights';

type HighlightRow = Database['public']['Tables']['highlights']['Row'];
type HighlightInsert = Omit<Database['public']['Tables']['highlights']['Insert'], 'color'> & {
    color: HighlightColorKey;
};
type HighlightUpdate = Omit<Database['public']['Tables']['highlights']['Update'], 'color'> & {
    color?: HighlightColorKey;
};

export type CreateHighlightDto = Omit<HighlightInsert, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'is_deleted'>;

export const highlightService = {
    getHighlights: async (topicId: string, lessonId: string) => {
        const { data, error } = await supabase
            .from('highlights')
            .select()
            .eq('topic_id', topicId)
            .eq('lesson_id', lessonId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as (HighlightRow & { color: HighlightColorKey })[];
    },

    createHighlight: async (highlight: CreateHighlightDto) => {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await supabase
            .from('highlights')
            .insert({
                ...highlight,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) throw error;
        return data as (HighlightRow & { color: HighlightColorKey });
    },

    updateHighlight: async (id: string, updates: Partial<CreateHighlightDto>) => {
        const { data, error } = await supabase
            .from('highlights')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as (HighlightRow & { color: HighlightColorKey });
    },

    deleteHighlight: async (id: string) => {
        const { error } = await supabase
            .from('highlights')
            .update({ is_deleted: true })
            .eq('id', id);

        if (error) throw error;
    },
};

// Export the service types
export type { HighlightRow, HighlightInsert, HighlightUpdate };