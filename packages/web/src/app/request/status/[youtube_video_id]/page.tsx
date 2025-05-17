import { db } from '@/server/config/db';
import { redirect } from 'next/navigation';
import { RequestSuccess } from '@/client/components/requestSuccess';
import { BahethService } from '@/server/services/baheth.service';

interface RequestStatusPageProps {
	params: {
		youtube_video_id: string;
	};
}

export default async function RequestStatusPage({
	params,
}: RequestStatusPageProps) {
	const { youtube_video_id } = params;

	// Check if job exists and get status
	const job = await db
		.selectFrom('generation_jobs')
		.where(
			'url',
			'=',
			`https://www.youtube.com/watch?v=${youtube_video_id}`
		)
		.select(['status', 'result'])
		.executeTakeFirst();

	if (!job) {
		// Check if the video exists as a lesson already
		const lesson = await db
			.selectFrom('lessons')
			.where('youtube_video_id', '=', youtube_video_id)
			.select(['id', 'playlist_id'])
			.executeTakeFirst();

		if (lesson) {
			// Redirect to the lesson if it exists
			redirect(`/playlists/${lesson.playlist_id}/lessons/${lesson.id}`);
		}

		// If no job or lesson exists, redirect to home with error
		redirect(
			`/?error=${encodeURIComponent('لم يتم العثور على طلب لهذا الدرس')}`
		);
	}

	// Try to get title from job result if available
	let title = '';
	try {
		if (job.result) {
			const metadata =
				typeof job.result === 'string'
					? JSON.parse(job.result)
					: job.result;

			title = metadata.baheth_title || '';
		}
	} catch (e) {
		// Ignore parse errors
	}

	// If no title in metadata, try to fetch from Baheth
	if (!title) {
		try {
			const bahethService = new BahethService();
			const bahethMedium = await bahethService.getMediumByYoutubeId(
				youtube_video_id
			);
			if (bahethMedium) {
				title = bahethMedium.title;
			}
		} catch (e) {
			console.error('Error fetching title from Baheth:', e);
		}
	}

	// Default title if still not found
	if (!title) {
		title = `درس من فيديو: ${youtube_video_id}`;
	}

	return <RequestSuccess title={title} />;
}
