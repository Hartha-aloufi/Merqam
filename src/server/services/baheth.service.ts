// src/server/services/baheth.service.ts
import { env } from '../config/env';

const BAHETH_API_URL = 'https://baheth.ieasybooks.com/api';

export class BahethService {
	private token: string;

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

		const response = await fetch(
			`${BAHETH_API_URL}${endpoint}?${searchParams}`
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
}
