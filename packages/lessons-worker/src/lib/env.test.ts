import { describe, it, expect, beforeEach } from 'vitest';
import { createTestEnv } from '../test/env-helper';

describe('Environment Configuration', () => {
  let testEnv: ReturnType<typeof createTestEnv>;

  beforeEach(() => {
    testEnv = createTestEnv();
  });

  it('should create valid test environment', () => {
    expect(testEnv.POSTGRES_USER).toBe('test_user');
    expect(testEnv.POSTGRES_PASSWORD).toBe('test_password');
    expect(testEnv.POSTGRES_DB).toBe('test_db');
    expect(testEnv.POSTGRES_HOST).toBe('localhost');
    expect(testEnv.POSTGRES_PORT).toBe(5432);
  });

  it('should have Redis configuration', () => {
    expect(testEnv.REDIS_HOST).toBe('localhost');
    expect(testEnv.REDIS_PORT).toBe(6379);
  });

  it('should have AI service configuration', () => {
    expect(Array.isArray(testEnv.GEMINI_API_KEYS)).toBe(true);
    expect(testEnv.GEMINI_API_KEYS).toContain('test_gemini_key_1');
    expect(testEnv.GEMINI_API_KEYS).toContain('test_gemini_key_2');
  });

  it('should validate environment configuration', () => {
    expect(testEnv).toBeDefined();
    expect(typeof testEnv).toBe('object');
  });
}); 