// src/app/api/admin/lessons/generate/route.ts
// src/app/api/admin/lessons/generate/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { TxtToMdxConverter } from '@/client/lib/txt-to-mdx';

if (!process.env.OPENAI_API_KEY) {
	throw new Error('OPENAI_API_KEY is required');
}

const DATA_PATH = path.join(process.cwd(), 'src/data');
const converter = new TxtToMdxConverter(process.env.OPENAI_API_KEY, DATA_PATH);

export const maxDuration = 300; // 5 minutes timeout

export async function POST(request: Request) {
	try {
		const { url, topicId, topicTitle } = await request.json();

		if (!url || !topicId) {
			return new NextResponse('Missing required fields: url, topicId', {
				status: 400,
			});
		}

		// Convert transcript to MDX
		console.log('Starting lesson generation:', { topicId, url });
		const result = await converter.processContent(url, topicId);
		console.log('Conversion completed:', result);

		// Update topic metadata
		const metaPath = path.join(DATA_PATH, topicId, 'meta.json');
		let meta = {
			title: topicTitle,
			description: '',
			lessons: {},
		};

		try {
			const metaContent = await fs.readFile(metaPath, 'utf8');
			meta = JSON.parse(metaContent);
			console.log('Existing meta loaded');
		} catch (error) {
			console.log('No existing meta, using default');
		}

		// Add lesson to meta with youtube URL
		meta.lessons[result.videoId] = {
			title: result.title,
			youtubeUrl: `https://www.youtube.com/watch?v=${result.videoId}`,
		};

		await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
		console.log('Meta updated');

		return NextResponse.json({
			topicId,
			lessonId: result.videoId,
		});
	} catch (error) {
		console.error('[ADMIN API] Error generating lesson:', error);
		return new NextResponse(
			error instanceof Error
				? error.message
				: 'Failed to generate lesson',
			{ status: 500 }
		);
	}
}
