// src/types/index.ts
export interface Topic {
    id: string;
    title: string;
    description: string;
    lessons: Lesson[];
}

export interface Lesson {
    id: string;
    title: string;
    youtubeUrl: string | null;
    content: string;
}