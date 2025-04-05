import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  target: 'node18',
  platform: 'node',
  outDir: 'dist',
  external: [
    'fs',
    'path',
    'os',
    'crypto',
  ],
  noExternal: ['dotenv', 'bullmq', 'winston', 'kysely', 'zod', 'pg', 'openai', 'puppeteer', '@google/generative-ai'],
  env: {
    NODE_ENV: process.env.NODE_ENV || 'production',
  },
}) 