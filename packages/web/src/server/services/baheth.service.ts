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

		// delete empty values
		for (const key in params) {
			if (!params[key]) {
				searchParams.delete(key);
			}
		}

		const response = await fetch(
			`${BAHETH_API_URL}${endpoint}?${searchParams}`,
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
}
