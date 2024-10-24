// src/utils/exercise.ts (server-side utilities)
import fs from 'fs';
import path from 'path';
import { Exercise } from '@/types/exercise';

const DATA_PATH = path.join(process.cwd(), 'src/data');

export async function getExercise(topicId: string, lessonId: string): Promise<Exercise | null> {
    try {
        const exercisePath = path.join(
            DATA_PATH,
            topicId,
            `${lessonId}-exercise.json`
        );
        const exerciseContent = fs.readFileSync(exercisePath, 'utf-8');
        return JSON.parse(exerciseContent) as Exercise;
    } catch {
        console.error(`Exercise not found or not valid json for ${topicId}/${lessonId}`);
        return null;
    }
}