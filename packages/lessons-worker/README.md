# Lessons Worker

A Node.js worker service for processing and managing Merqam content

## Setup

1. Install dependencies:

```bash
bun install
```

2. Build the Python components:

```bash
bun run build:python
```

## Development

-   `bun run dev` - Start development server
-   `bun run build` - Build the project
-   `bun run test` - Run tests
-   `bun run test:youtube` - Test YouTube subtitle functionality

## Testing

Run all tests:

```bash
bun run test
```

Test specific components:

```bash
bun run test:youtube  # Test YouTube subtitle functionality
```

## Requirements

-   Node.js 18+
-   Bun
-   Python 3.x (for subtitle processing)
