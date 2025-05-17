// src/server/services/baheth.service.ts
import { env } from '../config/env';
import type { paths } from '@/types/baheth-api';

export type BahethMedium =
	paths['/api/medium']['get']['responses']['200']['content']['application/json'];
export type BahethMediumParams =
	paths['/api/medium']['get']['parameters']['query'];

export class BahethService {
	private token: string;
	private apiUrl = 'https://baheth.ieasybooks.com/api';

	constructor() {
		this.token = env.BAHETH_API_TOKEN;
	}

	private async fetchFromBaheth(
		endpoint: string,
		params: Record<string, string>
	) {
		const searchParams = new URLSearchParams({
			...params,
			token: this.token,
		});

		// delete empty values
		for (const key in params) {
			if (!params[key]) {
				searchParams.delete(key);
			}
		}

		const response = await fetch(
			`${this.apiUrl}${endpoint}?${searchParams}`,
			{ headers: { Accept: 'application/json' } }
		);

		if (!response.ok) {
			throw new Error(`Baheth API error: ${response.statusText}`);
		}

		return response.json();
	}

	async searchSpeakers(query: string, page = 1, limit = 10) {
		return this.fetchFromBaheth('/speakers', {
			query,
			page: String(page),
			limit: String(limit),
		});
	}

	async getSpeakerById(id: string) {
		return this.fetchFromBaheth(`/speakers/${id}`, {});
	}

	async getMediumByYoutubeId(
		youtubeId: string
	): Promise<BahethMedium | null> {
		const params = {
			reference_id: `https://www.youtube.com/watch?v=${youtubeId}`,
			reference_type: 'youtube_link',
		} as const;

		const searchParams = new URLSearchParams(params);
		// Add expand parameters separately to handle array properly
		searchParams.append('expand[]', 'speakers');
		// searchParams.append('expand[]', 'playlist');

		try {
			return (await this.fetchFromBaheth(
				'/medium',
				Object.fromEntries(searchParams)
			)) as Promise<BahethMedium>;
		} catch (error) {
			console.error('Error fetching medium from Baheth:', error);
			return null;
		}
	}
}
