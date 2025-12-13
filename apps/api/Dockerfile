# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy root package files for monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy API package.json
COPY apps/api/package.json ./apps/api/

# Install all dependencies (needed for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the API
RUN pnpm --filter api run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm for running with proper module resolution
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy the full node_modules from builder (includes .pnpm with all deps)
COPY --from=builder /app/node_modules ./node_modules

# Copy API-specific node_modules (symlinks to production deps)
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Copy built application from builder
COPY --from=builder /app/apps/api/dist ./dist

# Copy package files for module resolution
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

USER nestjs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/ || exit 1

# Start the application with proper NODE_PATH
ENV NODE_PATH=/app/apps/api/node_modules:/app/node_modules
CMD ["node", "dist/src/main.js"]
