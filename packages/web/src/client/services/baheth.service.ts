// src/client/services/baheth.service.ts
import { httpClient } from '../lib/http-client';

export interface Speaker {
	id: number;
	slug: string;
	name: string;
	description: string;
	image: string;
	playlists_count: number;
	external_link: string;
	baheth_link: string;
}

interface SearchSpeakersResponse {
	count: number;
	page: number;
	limit: number;
	total_pages: number;
	next_page: number | null;
	previous_page: number | null;
	speakers: Speaker[];
}

export class BahethClient {
	async searchSpeakers(query: string, page = 1, limit = 10) {
		const { data } = await httpClient.get<SearchSpeakersResponse>(
			'/baheth/speakers',
			{
				params: { query, page, limit },
			}
		);
		return data;
	}
}
