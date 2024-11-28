// src/app/api/admin/lessons/generate/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { TxtToMdxConverter } from '@/lib/txt-to-mdx';

const DATA_PATH = path.join(process.cwd(), 'src/data');

export async function POST(request: Request) {
    try {
        const { url, title, topicId } = await request.json();

        // Create topic directory if it doesn't exist
        const topicPath = path.join(DATA_PATH, topicId);
        await fs.mkdir(topicPath, { recursive: true });

        // Generate unique lesson ID
        const lessonId = `${Date.now()}`;

        // TODO: Download transcripts and generate MDX
        const converter = new TxtToMdxConverter();
        await converter.processContent(url, topicId, lessonId, title);

        // TODO: Update topic metadata
        const metaPath = path.join(topicPath, 'meta.json');
        let meta = { title: topicId, lessons: {} };

        try {
            const metaContent = await fs.readFile(metaPath, 'utf8');
            meta = JSON.parse(metaContent);
        } catch (error) {
            // Meta file doesn't exist, use default
        }

        meta.lessons[lessonId] = {
            title,
            youtubeUrl: url
        };

        await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));

        return NextResponse.json({ topicId, lessonId });
    } catch (error) {
        console.error('[ADMIN API] Error generating lesson:', error);
        return new NextResponse('Failed to generate lesson', { status: 500 });
    }
}