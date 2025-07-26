# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Merqam (مِرْقَم) is a TypeScript monorepo for processing and serving Islamic educational content from YouTube videos. The platform creates structured transcriptions with features like highlighting, note-taking, and synchronized video playback.

## Architecture

This is a **monorepo** with two main packages:

- **`packages/web`** - Next.js 15 web application (frontend + API)
- **`packages/lessons-worker`** - Background worker service for content processing

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API routes, PostgreSQL, Kysely (query builder)
- **Worker**: BullMQ, Redis, Python scripts for content processing
- **AI**: OpenAI GPT, Google Gemini for content enhancement
- **Storage**: AWS S3 for lesson content
- **Auth**: JWT with refresh tokens, Google OAuth

## Common Commands

### Development
```bash
# Start both web and worker in development
bun run dev

# Start individual services
cd packages/web && bun run dev
cd packages/lessons-worker && bun run dev
```

### Building
```bash
# Build all packages
bun run build

# Build individual packages
cd packages/web && bun run build
cd packages/lessons-worker && bun run build
```

### Testing
```bash
# Run all tests
bun run test

# Web package tests (Jest)
cd packages/web && bun run test
cd packages/web && bun run test:watch
cd packages/web && bun run test:coverage

# Worker package tests (Vitest)
cd packages/lessons-worker && bun run test
cd packages/lessons-worker && bun run test:watch
cd packages/lessons-worker && bun run test:coverage
```

### Linting & Type Checking
```bash
# Web package
cd packages/web && bun run lint

# Both packages use TypeScript - check with:
bun run build  # Will fail on type errors
```

### Database Operations
```bash
# Run migrations
cd packages/web && bun run migrate

# Generate database types
cd packages/web && bun run generate-types
```

### Worker-Specific Operations
```bash
# Setup Python environment for content processing
cd packages/lessons-worker && bun run setup:python

# Test YouTube SRT downloader
cd packages/lessons-worker && bun run test:youtube-srt-downloader
```

## Key Architecture Components

### Database Layer
- **PostgreSQL** with **Kysely** for type-safe queries
- Migration-based schema management
- Core entities: users, speakers, playlists, lessons, notes, highlights

### Authentication System
- JWT-based authentication with refresh tokens
- Google OAuth integration
- Custom email/password registration
- Middleware-based route protection

### API Layer (Next.js App Router)
- RESTful API design with Zod validation
- Service layer architecture for business logic
- Key endpoints: `/api/auth/*`, `/api/notes/*`, `/api/highlights/*`

### Frontend Architecture
- Component organization by feature (admin, auth, lessons, notes, etc.)
- React Query for server state management
- Zustand for client-side state stores
- MDX content rendering for lessons

### Worker/Queue System
- BullMQ for job queue management
- Content processing pipeline: YouTube URL → Scraping → AI Enhancement → MDX Generation → Storage
- Multiple AI providers (OpenAI, Gemini) with factory pattern
- Enhanced logging with Winston

### Content Processing
- YouTube transcript extraction with multiple fallback scrapers
- AI-powered content enhancement and structuring
- Python scripts for SRT subtitle processing
- AWS S3 for lesson content storage

## Working with the Codebase

### Adding New Features
1. **Database changes**: Add migrations in `packages/web/src/server/db/migrations/`
2. **API endpoints**: Add to `packages/web/src/app/api/`
3. **Frontend components**: Add to `packages/web/src/client/components/`
4. **Worker jobs**: Add to `packages/lessons-worker/src/queue/`

### Testing Approach
- **Web**: Jest with React Testing Library
- **Worker**: Vitest for unit tests
- **Integration**: Database tests with test environment setup

### Environment Variables
- Check `packages/web/env.example` for required environment variables
- Worker service needs additional Python and AI service configurations

### Content Structure
- Lessons are stored as MDX files in S3
- Local development uses `lessons/` directory for sample content
- Each playlist has a `meta.json` file for metadata

### Key Services
- **`packages/web/src/server/services/`** - Business logic services
- **`packages/lessons-worker/src/services/`** - Content processing services
- **`packages/web/src/client/services/`** - Frontend API services

## Development Notes

### Database Schema
- Run `bun run generate-types` after schema changes to update TypeScript types
- Migrations are automatically applied during development

### AI Integration
- Uses factory pattern for AI service selection
- OpenAI for premium processing, Gemini for free tier
- Intelligent content chunking for large text processing

### Content Management
- Admin interface for managing speakers, playlists, and lessons
- Background job processing for content generation
- Integration with external Baheth API for Islamic content

### Performance Considerations
- S3-based content storage for scalability
- React Query for efficient data fetching and caching
- Progressive Web App capabilities for offline usage

## Security
- JWT tokens stored in HTTP-only cookies
- Secure password hashing with bcrypt
- Input validation with Zod schemas
- Protected API routes with middleware authentication