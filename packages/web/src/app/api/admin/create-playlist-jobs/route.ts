import { NextRequest, NextResponse } from 'next/server';
import { createPlaylistJobs } from '@/app/admin/jobs/lessons-queue/actions';

export async function POST(request: NextRequest) {
	try {
		const input = await request.json();

		if (!input.url || !input.userId) {
			return NextResponse.json(
				{ error: 'URL and userId are required' },
				{ status: 400 }
			);
		}

		const result = await createPlaylistJobs(input);

		// Handle partial failures where we still want to return data but with an error
		if (!result.success) {
			return NextResponse.json(
				{
					error: result.message || 'Failed to create jobs',
					jobIds: result.jobIds,
					skippedVideos: result.skippedVideos,
				},
				{ status: result.jobIds.length > 0 ? 207 : 400 } // 207 Multi-Status for partial success
			);
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error('Error creating playlist jobs:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
