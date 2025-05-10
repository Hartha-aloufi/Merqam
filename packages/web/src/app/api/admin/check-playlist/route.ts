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

		// Check if this is a playlist URL
		const playlistId = await extractYoutubePlaylistId(url);

		if (!playlistId) {
			return NextResponse.json({ isPlaylist: false });
		}

		// Get playlist videos
		const videos = await getPlaylistVideos(playlistId);

		return NextResponse.json({
			isPlaylist: true,
			playlistId,
			videos,
		});
	} catch (error) {
		console.error('Error checking playlist:', error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: 'Failed to check playlist',
			},
			{ status: 500 }
		);
	}
}
