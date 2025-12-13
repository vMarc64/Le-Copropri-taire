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

# Prune dev dependencies, keep only prod
RUN pnpm prune --prod

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy the pruned node_modules from builder (monorepo structure)
COPY --from=builder /app/node_modules ./node_modules

# Copy built application from builder
COPY --from=builder /app/apps/api/dist ./dist

# Copy package.json for reference
COPY --from=builder /app/apps/api/package.json ./package.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

USER nestjs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/ || exit 1

# Start the application
CMD ["node", "dist/src/main.js"]
