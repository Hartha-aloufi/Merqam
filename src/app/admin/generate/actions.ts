'use server';

import { db } from '@/server/config/db';
import { TxtToMdxConverter } from '@/client/lib/txt-to-mdx';
import { revalidatePath } from 'next/cache';
import path from 'path';
import { AIServiceType } from '@/server/services/ai/types';
import { validateIsVideoNotInDatabase } from './utils';

// Constants
const DATA_PATH = path.join(process.cwd(), 'src', 'data');
const TEMP_PATH = path.join(process.cwd(), 'temp');

interface GenerateContentInput {
	url: string;
	userId: string;
	aiService: AIServiceType;
	// For existing playlist
	playlistId?: string;
	speakerId?: string;
	// For new playlist
	newPlaylistId?: string;
	newPlaylistTitle?: string;
	newSpeakerName?: string;
}

// Validate input
function validateInput(input: GenerateContentInput) {
	if (!input.url) {
		throw new Error('URL is required');
	}

	if (!input.userId) {
		throw new Error('User ID is required');
	}

	// Check for either existing playlist or new playlist data
	const hasExistingPlaylist = input.playlistId && input.speakerId;
	const hasNewPlaylist =
		input.newPlaylistId &&
		input.newPlaylistTitle &&
		(input.speakerId || input.newSpeakerName);

	if (!hasExistingPlaylist && !hasNewPlaylist) {
		throw new Error(
			'Either existing playlist or new playlist data is required'
		);
	}
}

export async function generateContent(input: GenerateContentInput) {
	try {
		// Validate input
		validateInput(input);

		// validate video is not already in the database
		await validateIsVideoNotInDatabase(input.url);

		// Initialize converter
		const converter = new TxtToMdxConverter(
			DATA_PATH,
			TEMP_PATH,
			input.aiService
		);

		// Process content
		console.log('Starting content generation:', {
			url: input.url,
			playlistId: input.playlistId || 'new',
		});

		const result = await converter.processContent(
			input.url,
			input.playlistId || 'new'
		);
		const { videoId, title, mdxPath } = result;

		// Start database transaction
		const {lessonId, playlistId} = await db.transaction().execute(async (trx) => {
			// Handle Speaker
			let speakerId: string;
			if (input.speakerId) {
				speakerId = input.speakerId;
			} else if (input.newSpeakerName) {
				const [speaker] = await trx
					.insertInto('speakers')
					.values({
						name: input.newSpeakerName,
						en_name:
							input.newSpeakerName
								.replace(/[\u0600-\u06FF]/g, '')
								.trim() || input.newSpeakerName,
					})
					.returning(['id'])
					.execute();
				speakerId = speaker.id;
			} else {
				throw new Error(
					'Either speakerId or newSpeakerName must be provided'
				);
			}

			// Handle Playlist
			let playlistId: string;
			if (input.playlistId) {
				playlistId = input.playlistId;
			} else if (input.newPlaylistId && input.newPlaylistTitle) {
				const [playlist] = await trx
					.insertInto('playlists')
					.values({
						youtube_playlist_id: input.newPlaylistId,
						title: input.newPlaylistTitle,
						speaker_id: speakerId,
					})
					.returning(['youtube_playlist_id'])
					.execute();
				playlistId = playlist.youtube_playlist_id;
			} else {
				throw new Error(
					'Either playlistId or newPlaylist details must be provided'
				);
			}

			// Create YouTube video entry
			if (videoId) {
				await trx
					.insertInto('youtube_videos')
					.values({
						youtube_video_id: videoId,
						playlist_id: playlistId,
						speaker_id: speakerId,
					})
					.onConflict((oc) =>
						oc.column('youtube_video_id').doNothing()
					)
					.execute();
			}

			// key example: '/data/playlistId/lessonId.mdx'
			const contentKey = mdxPath.split(path.resolve('src'))[1].slice(1);

			// Create lesson
			const [lesson] = await trx
				.insertInto('lessons')
				.values({
					title,
					content_key: contentKey,
					speaker_id: speakerId,
					playlist_id: playlistId,
					youtube_video_id: videoId,
					user_id: input.userId,
					tags: [],
					views_count: 0,
				})
				.returning(['id'])
				.execute();

			return {
				lessonId: lesson.id,
				playlistId,
			};
		});

		// Revalidate related paths
		revalidatePath('/playlists');
		revalidatePath(`/playlists/${playlistId}`);

		return {
			success: true,
			playlistId,
			lessonId,
		};
	} catch (error) {
		console.error('Error generating content:', error);
		throw error;
	}
}

export async function getSpeakers() {
	try {
		return await db
			.selectFrom('speakers')
			.select(['id', 'name'])
			.orderBy('name')
			.execute();
	} catch (error) {
		console.error('Error fetching speakers:', error);
		throw error;
	}
}

export async function getPlaylists() {
	try {
		return await db
			.selectFrom('playlists')
			.innerJoin('speakers', 'speakers.id', 'playlists.speaker_id')
			.select([
				'playlists.youtube_playlist_id',
				'playlists.title',
				'playlists.speaker_id',
				'speakers.name as speaker_name',
			])
			.orderBy('playlists.title')
			.execute();
	} catch (error) {
		console.error('Error fetching playlists:', error);
		throw error;
	}
}
