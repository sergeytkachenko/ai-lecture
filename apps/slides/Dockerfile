# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy slides package files
COPY apps/slides/package.json apps/slides/

# Install dependencies
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy slides source
COPY apps/slides/ apps/slides/

# Build slides with base path /slides/
RUN pnpm --filter slides build

# Production stage
FROM nginx:alpine

# Copy built slides
COPY --from=build /app/apps/slides/dist /usr/share/nginx/html/slides

# Create nginx config for slides
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location /slides/ { \
        try_files $uri $uri/ /slides/index.html; \
    } \
    \
    location = /healthz { \
        default_type text/plain; \
        return 200 "ok"; \
    } \
    \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
