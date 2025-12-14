# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments for Next.js public env vars
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy root package files for monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy Web package.json
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application with Next.js (uses NEXT_PUBLIC_API_URL)
RUN pnpm --filter web run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Next.js standalone copies the app structure, server.js is in apps/web/
# Copy the entire standalone output
COPY --from=builder /app/apps/web/.next/standalone ./

# Copy static files to the correct location
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Copy public folder
COPY --from=builder /app/apps/web/public ./apps/web/public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

USER nextjs

# Expose port
EXPOSE 3000

# Set environment
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application - server.js is in apps/web/ for monorepo
CMD ["node", "apps/web/server.js"]
