// services/admin/lessons.service.ts
import {
  AdminLesson,
  GenerateLessonData,
  GenerateLessonResponse,
} from "@/types/admin";

export const adminLessonsService = {
  getLesson: async (
    topicId: string,
    lessonId: string
  ): Promise<AdminLesson> => {
    // Only run in development
    if (process.env.NODE_ENV === "production") {
      throw new Error("Admin API is only available in development mode");
    }

    const response = await fetch(
      `/api/admin/lessons/${encodeURIComponent(topicId)}/${encodeURIComponent(
        lessonId
      )}`
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Failed to fetch lesson");
    }

    return response.json();
  },

  updateLesson: async (
    topicId: string,
    lessonId: string,
    data: Partial<AdminLesson>
  ): Promise<AdminLesson> => {
    // Only run in development
    if (process.env.NODE_ENV === "production") {
      throw new Error("Admin API is only available in development mode");
    }

    const response = await fetch(
      `/api/admin/lessons/${encodeURIComponent(topicId)}/${encodeURIComponent(
        lessonId
      )}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Failed to update lesson");
    }

    return response.json();
  },

  generateLesson: async (
    data: GenerateLessonData
  ): Promise<GenerateLessonResponse> => {
    const response = await fetch("/api/admin/lessons/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to generate lesson");
    }

    return response.json();
  },
};
