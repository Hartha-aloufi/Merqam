// src/app/api/admin/lessons/generate/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { TxtToMdxConverter } from '@/client/lib/txt-to-mdx';
import { logger } from '@/client/lib/txt-to-mdx/scrapers/logger';
import { AIServiceType } from '@/server/services/ai/types';

// Constants
const DATA_PATH = path.join(process.cwd(), 'src/data');
const TEMP_PATH = path.join(process.cwd(), 'temp');

// Configure timeout for long-running operations
export const maxDuration = 300; // 5 minutes timeout

// Error handling utilities
class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ValidationError';
	}
}

interface GenerateRequestBody {
	url: string;
	topicId: string;
	topicTitle: string;
	aiService?: AIServiceType;
}

/**
 * Route handler for lesson generation
 */
export async function POST(request: Request) {
	try {
		// Parse and validate request body
		const body = await validateRequest(request);

		// Initialize converter
		const converter = new TxtToMdxConverter(
			DATA_PATH,
			TEMP_PATH,
			body.aiService
		);

		// Process content and generate MDX
		logger.info('Starting lesson generation:', {
			topicId: body.topicId,
			url: body.url,
		});
		const result = await converter.processContent(body.url, body.topicId);
		logger.info('Conversion completed:', result);

		// Update topic metadata
		await updateTopicMetadata(body, result);

		return NextResponse.json({
			topicId: body.topicId,
			lessonId: result.videoId,
		});
	} catch (error) {
		return handleError(error);
	}
}

/**
 * Validates the incoming request body
 */
async function validateRequest(request: Request): Promise<GenerateRequestBody> {
	try {
		const body = await request.json();

		if (!body.url || !body.topicId) {
			throw new ValidationError('Missing required fields: url, topicId');
		}

		return body as GenerateRequestBody;
	} catch {
		throw new ValidationError('Invalid request body');
	}
}

/**
 * Updates the topic metadata with new lesson information
 */
async function updateTopicMetadata(
	body: GenerateRequestBody,
	result: { videoId: string; title: string }
) {
	const metaPath = path.join(DATA_PATH, body.topicId, 'meta.json');

	// Initialize default metadata
	let meta = {
		title: body.topicTitle,
		description: '',
		lessons: {},
	};

	try {
		// Load existing metadata if available
		const metaContent = await fs.readFile(metaPath, 'utf8');
		meta = JSON.parse(metaContent);
		logger.info('Existing meta loaded');
	} catch {
		logger.info('No existing meta, using default');
	}

	// Add or update lesson metadata
	meta.lessons[result.videoId] = {
		title: result.title,
		youtubeUrl: `https://www.youtube.com/watch?v=${result.videoId}`,
	};

	// Write updated metadata
	await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
	logger.info('Meta updated');
}

/**
 * Handles errors and returns appropriate responses
 */
function handleError(error: unknown): NextResponse {
	logger.error('[ADMIN API] Error generating lesson:', error);

	// Update error handling for AI service specific errors
	if (error instanceof Error) {
		if (error.message.includes('API key not configured')) {
			return new NextResponse(error.message, { status: 400 });
		}
		if (error.message.includes('QUOTA_EXCEEDED')) {
			return new NextResponse(
				'AI service quota exceeded. Please try a different service or try again later.',
				{ status: 429 }
			);
		}
	}

	if (error instanceof ValidationError) {
		return new NextResponse(error.message, { status: 400 });
	}

	if (error instanceof Error) {
		// Handle specific AI service errors
		if (error.message.includes('QUOTA_EXCEEDED')) {
			return new NextResponse(
				'AI service quota exceeded. Please try again later.',
				{
					status: 429,
				}
			);
		}

		return new NextResponse(error.message, { status: 500 });
	}

	return new NextResponse('An unexpected error occurred', { status: 500 });
}
