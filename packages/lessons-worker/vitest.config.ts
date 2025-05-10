import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable global test utilities
    globals: true,
    // Environment setup
    environment: 'node',
    // Include source files for coverage
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Configure coverage collection
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.{test,spec}.ts',
        'src/types/**',
        'src/**/*.d.ts',
      ],
    },
    // Setup files to run before tests
    setupFiles: ['src/test/setup.ts'],
  },
}); 