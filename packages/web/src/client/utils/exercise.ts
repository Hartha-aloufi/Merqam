// src/utils/exercise.ts
import fs from 'fs';
import path from 'path';
import { Exercise } from '@/types/exercise';
import { env } from '@/server/config/env';

const DATA_PATH = env.STORAGE_ROOT_URL;

/**
 * Gets exercise data for a specific lesson
 * This runs at build time for static generation
 */
export async function getExercise(topicId: string, lessonId: string): Promise<Exercise | null> {
    try {
        const exercisePath = path.join(
            DATA_PATH,
            topicId,
            'exercises',
            `${lessonId}.json`
        );

        // Ensure file exists
        if (!fs.existsSync(exercisePath)) {
            console.warn(`No exercise found for ${topicId}/${lessonId}`);
            return null;
        }

        const exerciseContent = fs.readFileSync(exercisePath, 'utf-8');
        return JSON.parse(exerciseContent) as Exercise;
    } catch (error) {
        console.error(`Error loading exercise for ${topicId}/${lessonId}:`, error);
        return null;
    }
}

/**
 * Gets all available exercises for static path generation
 */
export async function getAllExercises(): Promise<Array<{ topicId: string; lessonId: string }>> {
    const exercises: Array<{ topicId: string; lessonId: string }> = [];
    
    // Read topics directory
    const topics = fs.readdirSync(DATA_PATH);
    
    topics.forEach(topicId => {
        const exercisesPath = path.join(DATA_PATH, topicId, 'exercises');
        
        // Skip if exercises directory doesn't exist
        if (!fs.existsSync(exercisesPath)) return;
        
        // Read exercise files
        const exerciseFiles = fs.readdirSync(exercisesPath)
            .filter(file => file.endsWith('.json'));
            
        exerciseFiles.forEach(file => {
            exercises.push({
                topicId,
                lessonId: file.replace('.json', '')
            });
        });
    });
    
    return exercises;
}