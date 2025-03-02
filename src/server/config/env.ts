// src/server/config/env.ts
import { z } from 'zod';

import { config } from 'dotenv';

config();
config({path: '../../../.env.local', override: true});

function getGeminiKeys(): string[] {
	const keys: string[] = [];
	let index = 1;

	while (true) {
		const key = process.env[`GEMINI_API_KEY_${index}`];
		if (!key) break;
		keys.push(key);
		index++;
	}

	return keys;
}

const envSchema = z
	.object({
		POSTGRES_USER: z.string(),
		POSTGRES_PASSWORD: z.string(),
		POSTGRES_DB: z.string(),
		POSTGRES_HOST: z.string(),
		POSTGRES_PORT: z.coerce.number().default(5432),
		REDIS_HOST: z.string().default('localhost'),
		REDIS_PORT: z.coerce.number().default(6379),
		REDIS_PASSWORD: z.string().optional(),
		BAHETH_API_TOKEN: z.string(),
		JWT_SECRET: z.string(),
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),
		NEXT_PUBLIC_APP_URL: z.string().url(),
		OPENAI_API_KEY: z.string().optional(),
		GEMINI_API_KEYS: z.array(z.string()).default([]).optional(),
	})
	.transform((data) => ({
		...data,
		GEMINI_API_KEYS:
			data.GEMINI_API_KEYS && data.GEMINI_API_KEYS.length > 0
				? data.GEMINI_API_KEYS
				: getGeminiKeys(),
	}))
	.refine((data) => Boolean(data.OPENAI_API_KEY || data.GEMINI_API_KEYS), {
		message: 'Either OPENAI_API_KEY or GEMINI_API_KEY must be provided',
	});

export const env = envSchema.parse(process.env);
