# Stage 1: Build Quartz static site
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY apps/site/package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy Quartz source files
COPY apps/site/ ./

# Copy vault content into content directory
COPY apps/vault ./content

# Build the static site
RUN npx quartz build --output public

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built static site from builder stage
COPY --from=builder /app/public /usr/share/nginx/html

# Copy nginx configuration
COPY infra/fly/site/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Fly.io internal routing
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
