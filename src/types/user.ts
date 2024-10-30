// src/types/user.ts
export interface UserSettings {
    fontSize: 'small' | 'medium' | 'large';
    theme: 'light' | 'dark' | 'sepia';
}

export interface ReadingProgress {
    [lessonId: string]: {
        progress: number;
        lastRead: string;
        completed: boolean;
    };
}

export interface UserMetadata {
    id: string;
    reading_progress: ReadingProgress;
    settings: UserSettings;
    last_read_lesson: string | null;
    created_at: string;
}

export interface SupabaseUser {
    id: string;
    email?: string;
    user_metadata: {
        name?: string;
        avatar_url?: string;
    };
}