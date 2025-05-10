'use server';

import { db } from '@/server/config/db';

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
