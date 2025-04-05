import { beforeAll } from 'vitest';
import path from 'path';
import dotenv from 'dotenv';

// Load test environment variables before any tests run
beforeAll(() => {
  // First try to load .env.test
  dotenv.config({
    path: path.resolve(process.cwd(), '.env.test'),
  });

  // Set default environment variables for testing if not provided
  const defaults = {
    NODE_ENV: 'test',
    POSTGRES_USER: 'test_user',
    POSTGRES_PASSWORD: 'test_password',
    POSTGRES_DB: 'test_db',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: '5432',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
    GEMINI_API_KEY_1: 'test_gemini_key_1',
    GEMINI_API_KEY_2: 'test_gemini_key_2',
  };

  // Set each default value if not already set
  Object.entries(defaults).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}); 