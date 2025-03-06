FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN npm install
# Install tsx globally
RUN npm install -g tsx

# Copy application code
COPY . .

# Command to run the worker
CMD ["tsx", "src/worker.ts"]