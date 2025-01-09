// src/server/config/env.ts
import { z } from 'zod';

const envSchema = z
	.object({
		POSTGRES_USER: z.string(),
		POSTGRES_PASSWORD: z.string(),
		POSTGRES_DB: z.string(),
		POSTGRES_HOST: z.string(),
		POSTGRES_PORT: z.coerce.number().default(5432),
		BAHETH_API_TOKEN: z.string(),
		JWT_SECRET: z.string(),
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),
		NEXT_PUBLIC_APP_URL: z.string().url(),
		OPENAI_API_KEY: z.string().optional(),
		GEMINI_API_KEY: z.string().optional(),
	})
	.refine((data) => Boolean(data.OPENAI_API_KEY || data.GEMINI_API_KEY), {
		message: 'Either OPENAI_API_KEY or GEMINI_API_KEY must be provided',
	});;

export const env = envSchema.parse(process.env);
