// src/types/reading-progress.ts
export interface ReadingProgress {
  id: string;
  user_id: string;
  topic_id: string;
  lesson_id: string;
  last_read_paragraph: number[];
  latest_read_paragraph: number[];
  updated_at: string;
}

export interface ReadingProgressUpdate {
  topic_id: string;
  lesson_id: string;
  latest_read_paragraph: number;
  last_read_paragraph?: number;
}

export type ReadingProgressMap = {
  [key: string]: {
    [key: string]: {
      lastRead: number;
      latestRead: number;
      updatedAt: string;
    }
  }
}