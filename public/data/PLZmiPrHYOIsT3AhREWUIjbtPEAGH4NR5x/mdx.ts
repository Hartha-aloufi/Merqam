// utils/mdx.ts
import fs from 'fs';
import path from 'path';
import { Topic, Lesson } from '@/types';
import { cache } from 'react';

const DATA_PATH = path.join(process.cwd(), 'public/data');

export const getTopics = cache(async (): Promise<Topic[]> => {
  try {
    const topicFolders = fs.readdirSync(DATA_PATH)
      .filter(folder => 
        fs.statSync(path.join(DATA_PATH, folder)).isDirectory() &&
        fs.existsSync(path.join(DATA_PATH, folder, 'meta.json'))
      );

    return topicFolders.map(folder => {
      const metaPath = path.join(DATA_PATH, folder, 'meta.json');
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      const lessons = getLessons(folder);

      return {
        id: folder,
        title: meta.title,
        description: meta.description,
        lessons
      };
    });
  } catch (error) {
    console.error('Error getting topics:', error);
    return [];
  }
});

export const getLessons = cache((topicId: string): Lesson[] => {
  try {
    const topicPath = path.join(DATA_PATH, topicId);
    const metaPath = path.join(topicPath, 'meta.json');
    
    if (!fs.existsSync(metaPath)) {
      return [];
    }

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
  } catch (error) {
    console.error(`Error getting lessons for topic ${topicId}:`, error);
    return [];
  }
});

export const getLesson = cache((topicId: string, lessonId: string): Lesson | null => {
  try {
    const lessons = getLessons(topicId);
    return lessons.find(lesson => lesson.id === lessonId) || null;
  } catch (error) {
    console.error(`Error getting lesson ${lessonId} for topic ${topicId}:`, error);
    return null;
  }
});