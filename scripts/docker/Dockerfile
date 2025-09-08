# Base stage for installing dependencies
FROM node:22-bookworm-slim AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/shared/package.json ./packages/shared/
RUN npm install

# Builder stage for building frontend and backend
FROM base AS builder
WORKDIR /app
COPY . .
RUN npm run build --workspaces

# Final stage
FROM node:22-bookworm-slim
WORKDIR /app

# Create a non-root user and group
RUN addgroup --system --gid 101 nginx && \
    adduser --system --disabled-password --ingroup nginx --no-create-home --home /nonexistent --shell /bin/false --uid 101 nginx

# Install nginx
RUN apt-get update && apt-get install -y nginx bash

# Create and set permissions for nginx directories
RUN mkdir -p /var/lib/nginx/body /var/log/nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/lib/nginx /var/log/nginx /var/cache/nginx && \
    touch /run/nginx.pid && \
    chown -R nginx:nginx /run/nginx.pid

# Copy nginx configuration
COPY --from=builder --chown=nginx:nginx /app/scripts/docker/nginx.conf /etc/nginx/nginx.conf

# Copy frontend build from builder
COPY --from=builder --chown=nginx:nginx /app/packages/frontend/dist /var/www/html

# Copy production node_modules from base stage
COPY --from=base --chown=nginx:nginx /app/node_modules ./node_modules
COPY --from=base --chown=nginx:nginx /app/package.json ./
COPY --from=base --chown=nginx:nginx /app/package-lock.json ./

# Copy backend build from builder
COPY --from=builder --chown=nginx:nginx /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder --chown=nginx:nginx /app/packages/backend/package.json ./packages/backend/
COPY --from=builder --chown=nginx:nginx /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nginx:nginx /app/packages/shared/package.json ./packages/shared/

# Copy start script and set permissions
COPY --from=builder --chown=nginx:nginx /app/scripts/docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port 80 for nginx
EXPOSE 80

# Set backend port
ENV PORT=3001

# Switch to non-root user
USER nginx

# Start backend server and nginx using the start script
CMD ["/app/start.sh"]

