// services/admin/lessons.service.ts
type Lesson = {
    id: string;
    title: string;
    content: string;
    youtubeUrl?: string;
}

export const adminLessonsService = {
    getLesson: async (topicId: string, lessonId: string): Promise<Lesson> => {
        const response = await fetch(`/api/admin/lessons/${topicId}/${lessonId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch lesson');
        }
        return response.json();
    },

    updateLesson: async (topicId: string, lessonId: string, data: Partial<Lesson>): Promise<Lesson> => {
        const response = await fetch(`/api/admin/lessons/${topicId}/${lessonId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to update lesson');
        }

        return response.json();
    }
};