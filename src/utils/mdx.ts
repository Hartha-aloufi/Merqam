import fs from 'fs';
import path from 'path';
import { Topic, Lesson } from '@/types';

const DATA_PATH = path.join(process.cwd(), 'src/data');

/**
 * Retrieves all available topics from the data directory
 * @returns Array of Topic objects with their metadata
 */
export async function getTopics(): Promise<Topic[]> {
    const topicFolders = fs.readdirSync(DATA_PATH);

    return topicFolders.map(folder => {
        const metaPath = path.join(DATA_PATH, folder, 'meta.json');
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

        return {
            id: folder,
            title: meta.title,
            description: meta.description,
            lessons: getLessons(folder)
        };
    });
}

/**
 * Retrieves all lessons for a specific topic
 * @param topicId - The folder name of the topic
 * @returns Array of Lesson objects
 */
export function getLessons(topicId: string): Lesson[] {
    const topicPath = path.join(DATA_PATH, topicId);
    const metaPath = path.join(topicPath, 'meta.json');
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

    const mdxFiles = fs.readdirSync(topicPath)
        .filter(file => file.endsWith('.mdx'));

    return mdxFiles.map(file => {
        const id = file.replace('.mdx', '');
        const content = fs.readFileSync(path.join(topicPath, file), 'utf-8');

        return {
            id,
            title: meta.lessons[id]?.title || id,
            youtubeUrl: meta.lessons[id]?.youtubeUrl || '',
            content
        };
    });
}

/**
 * Retrieves a specific lesson by topic and lesson ID
 * @param topicId - The folder name of the topic
 * @param lessonId - The filename of the lesson (without .mdx)
 * @returns Lesson object or null if not found
 */
export function getLesson(topicId: string, lessonId: string): Lesson | null {
    try {
        const lessons = getLessons(topicId);
        return lessons.find(lesson => lesson.id === lessonId) || null;
    } catch {
        return null;
    }
}