// src/hooks/use-reading-progress.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { ReadingProgress, ReadingProgressUpdate, ReadingProgressMap } from '@/types/reading-progress';
import { useAuth } from './use-auth';

export const useReadingProgress = (topicId?: string, lessonId?: string) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<ReadingProgressMap>({});

  useEffect(() => {
    if (user) {
      loadProgress();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      // Transform to map for easier access
      const progressMap: ReadingProgressMap = {};
      data.forEach((item: ReadingProgress) => {
        if (!progressMap[item.topic_id]) {
          progressMap[item.topic_id] = {};
        }
        progressMap[item.topic_id][item.lesson_id] = {
          lastRead: item.last_read_paragraph,
          latestRead: item.latest_read_paragraph,
          updatedAt: item.updated_at
        };
      });

      setProgress(progressMap);
    } catch (error) {
      console.error('Error loading reading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (update: ReadingProgressUpdate) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('update_reading_progress', {
          p_topic_id: update.topic_id,
          p_lesson_id: update.lesson_id,
          p_last_read: update.last_read_paragraph,
          p_latest_read: update.latest_read_paragraph
        });

      if (error) throw error;

      // Update local state
      setProgress(prev => ({
        ...prev,
        [update.topic_id]: {
          ...prev[update.topic_id],
          [update.lesson_id]: {
            lastRead: update.last_read_paragraph,
            latestRead: update.latest_read_paragraph,
            updatedAt: new Date().toISOString()
          }
        }
      }));

      return data;
    } catch (error) {
      console.error('Error updating reading progress:', error);
      throw error;
    }
  };

  const getCurrentProgress = () => {
    if (!topicId || !lessonId) return null;
    return progress[topicId]?.[lessonId] ?? null;
  };

  return {
    progress,
    isLoading,
    updateProgress,
    getCurrentProgress
  };
};