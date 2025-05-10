// src/server/config/env.ts
import { z } from 'zod';

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
		REDIS_HOST: z.string(),
		REDIS_PORT: z.coerce.number().default(6379),
		REDIS_PASSWORD: z.string().optional(),
		OPENAI_API_KEY: z.string().optional(),
		GEMINI_API_KEYS: z.array(z.string()).default([]).optional(),
		STORAGE_ROOT_URL: z.string(),
		STORAGE_TEMP_URL: z.string().optional(),
		AWS_REGION: z.string().default('us-east-1'),
		AWS_ACCESS_KEY_ID: z.string(),
		AWS_SECRET_ACCESS_KEY: z.string(),
		AWS_BUCKET_NAME: z.string().optional().default('merqam-lessons'),
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
