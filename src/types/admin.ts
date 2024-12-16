// types/admin.ts

export interface AdminLesson {
  id: string;
  title: string;
  content: string;
  youtubeUrl?: string;
}

export interface GenerateLessonData {
  url: string;
  title: string;
  topicId: string;
  topicTitle: string;
}

export interface GenerateLessonResponse {
  topicId: string;
  lessonId: string;
  generationId: string;
}
