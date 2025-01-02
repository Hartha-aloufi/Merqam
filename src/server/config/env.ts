// src/server/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
	POSTGRES_USER: z.string(),
	POSTGRES_PASSWORD: z.string(),
	POSTGRES_DB: z.string(),
	POSTGRES_HOST: z.string(),
	POSTGRES_PORT: z.coerce.number().default(5432),
	JWT_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
