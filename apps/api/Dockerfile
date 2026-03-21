# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy shared package and api package files
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

# Install dependencies
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/

# Build shared package then API
RUN pnpm --filter @lecture-poll/shared build && \
    pnpm --filter api build

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

RUN corepack enable && corepack prepare pnpm@9 --activate

# Install all dependencies (including dev for drizzle-kit migrations)
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy built shared package
COPY --from=builder /app/packages/shared/dist packages/shared/dist

# Copy built API
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist apps/api/dist

# Copy drizzle config and schema for migrations
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/drizzle.config.ts apps/api/
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/src/db apps/api/src/db

USER nestjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/api/dist/main"]
