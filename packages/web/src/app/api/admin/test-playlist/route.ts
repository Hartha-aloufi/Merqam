import { NextRequest, NextResponse } from 'next/server';
import {
	extractYoutubePlaylistId,
	getPlaylistVideos,
} from '@/app/admin/jobs/lessons-queue/actions';

export async function POST(request: NextRequest) {
	try {
		const { url } = await request.json();

		if (!url) {
			return NextResponse.json(
				{ error: 'URL is required' },
				{ status: 400 }
			);
		}

		// Extract playlist ID
		const playlistId = await extractYoutubePlaylistId(url);

		if (!playlistId) {
			return NextResponse.json({
				status: 'error',
				message: 'Not a valid YouTube playlist URL',
				url,
			});
		}

		// Get videos from playlist
		const videos = await getPlaylistVideos(playlistId);

		return NextResponse.json({
			status: 'success',
			playlistId,
			videoCount: videos.length,
			videos: videos.slice(0, 5), // Return only first 5 for preview
		});
	} catch (error) {
		console.error('Error testing playlist:', error);
		return NextResponse.json(
			{
				status: 'error',
				message: 'Error testing playlist',
				error: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
