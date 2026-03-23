# Stage 1: Build the web app
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npx expo export --platform web

# Stage 2: Production image
FROM node:22-alpine

LABEL org.opencontainers.image.source=https://github.com/Cruv/PaintForge
LABEL org.opencontainers.image.description="PaintForge — Miniature paint collection, recipe, and project manager"

RUN apk add --no-cache nginx curl shadow

# Copy built web app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create directories for nginx
RUN mkdir -p /var/log/nginx /var/lib/nginx /run/nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost/ || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
