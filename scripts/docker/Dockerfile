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

# Install nginx
RUN apt-get update && apt-get install -y nginx

# Copy nginx configuration
COPY --from=builder /app/scripts/docker/nginx.conf /etc/nginx/nginx.conf

# Copy frontend build from builder
COPY --from=builder /app/packages/frontend/dist /var/www/html

# Copy backend build from builder
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/package.json ./packages/backend/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules


# Expose port 80 for nginx
EXPOSE 80

# Set backend port
ENV PORT=3001

# Start backend server and nginx
CMD ["sh", "-c", "node packages/backend/dist/server.js & nginx -g 'daemon off;'"]
