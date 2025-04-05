import { z } from 'zod';

function getGeminiKeys(): string[] {
  const keys = [];
  let i = 1;
  while (true) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (!key) break;
    keys.push(key);
    i++;
  }
  return keys;
}

const testEnvSchema = z
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

export type TestEnv = z.infer<typeof testEnvSchema>;

export function createTestEnv(): TestEnv {
  const testEnv = {
    POSTGRES_USER: 'test_user',
    POSTGRES_PASSWORD: 'test_password',
    POSTGRES_DB: 'test_db',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: 5432,
    REDIS_HOST: 'localhost',
    REDIS_PORT: 6379,
    GEMINI_API_KEYS: ['test_gemini_key_1', 'test_gemini_key_2'],
  };

  return testEnvSchema.parse(testEnv);
} 