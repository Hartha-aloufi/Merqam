FROM oven/bun:alpine AS base

# Add common logging setup
RUN echo "=== Base Image Information ===" && \
    echo "Alpine Version: $(cat /etc/alpine-release)" && \
    echo "Bun Version: $(bun --version)"

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./

# Log the dependencies stage environment
RUN echo "=== Dependencies Stage Environment Variables ===" && \
    env | sort && \
    echo "=== Installing Dependencies ===" && \
    bun install 

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY .env.production ./
COPY . .
ENV POSTGRES_HOST=postgres

# Log environment variables before building
RUN echo "=== Builder Stage Environment Variables ===" && \
    env | sort && \
    echo "=== Contents of .env.production ===" && \
    cat .env.production | grep -v "PASSWORD\|SECRET\|KEY" && \
    echo "=== Available Next.js Environment Variables ===" && \
    grep -r "process.env" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" . | sort | uniq && \
    echo "=== Starting Build Process ===" && \
    bun run build || (echo "=== Build Failed! ===" && exit 1)

# Log build output contents
RUN echo "=== Build Output Structure ===" && \
    ls -la .next/

# Stage 3: Production server
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Log runtime environment 
RUN echo "=== Runner Stage Environment Variables ===" && \
    env | sort

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Verify the copied files
RUN echo "=== Production Files Structure ===" && \
    ls -la && \
    echo "=== Static Files ===" && \
    ls -la .next/static 2>/dev/null || echo "No static directory found!"

EXPOSE 3000

# Create healthcheck script
COPY --from=builder /app/package.json ./package.json
RUN echo '#!/bin/sh' > /app/healthcheck.sh && \
    echo 'curl -f http://localhost:3000/ || exit 1' >> /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh

# Add healthcheck instruction
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD [ "/app/healthcheck.sh" ]

CMD echo "=== Starting Next.js Server ===" && bun run server.js