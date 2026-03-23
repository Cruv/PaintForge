# Stage 1: Build the web app
FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npx expo export --platform web

# Stage 2: Backend dependencies
FROM node:22-alpine AS backend-build

WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

# Stage 3: Production image
FROM node:22-alpine

LABEL org.opencontainers.image.source=https://github.com/Cruv/PaintForge
LABEL org.opencontainers.image.description="PaintForge — Miniature paint collection, recipe, and project manager"

RUN apk add --no-cache nginx curl shadow

WORKDIR /app

# Copy built web app
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Copy backend
COPY --from=backend-build /app/node_modules ./server/node_modules
COPY server/ ./server/

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create directories
RUN mkdir -p /app/data /var/log/nginx /var/lib/nginx /run/nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost/api/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
