// services/admin/lessons.service.ts
type Lesson = {
  id: string;
  title: string;
  content: string;
  youtubeUrl?: string;
}

export const adminLessonsService = {
  getLesson: async (topicId: string, lessonId: string): Promise<Lesson> => {
    // Only run in development
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Admin API is only available in development mode');
    }

    const response = await fetch(
      `/api/admin/lessons/${encodeURIComponent(topicId)}/${encodeURIComponent(lessonId)}`
    );
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Failed to fetch lesson');
    }
    
    return response.json();
  },

  updateLesson: async (topicId: string, lessonId: string, data: Partial<Lesson>): Promise<Lesson> => {
    // Only run in development
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Admin API is only available in development mode');
    }

    const response = await fetch(
      `/api/admin/lessons/${encodeURIComponent(topicId)}/${encodeURIComponent(lessonId)}`, 
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Failed to update lesson');
    }

    return response.json();
  }
};