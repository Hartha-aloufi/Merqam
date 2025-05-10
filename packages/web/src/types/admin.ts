// types/admin.ts

import { AIServiceType } from "@/server/services/ai/types";

export interface AdminLesson {
  id: string;
  title: string;
  content: string;
  youtubeUrl?: string;
}

export interface GenerateLessonData {
	url: string;
	topicId: string;
	topicTitle: string;
	aiService?: AIServiceType; // Add this line
}

export interface GenerateLessonResponse {
  topicId: string;
  lessonId: string;
  generationId: string;
}

