# Backend Dockerfile for AutoBalancer
FROM node:20-alpine AS builder

# Build stage: install devDependencies and build TypeScript
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

FROM node:20-alpine

# Production image: only production dependencies and built assets
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy build artifacts from builder
COPY --from=builder /app/dist ./dist

# Create necessary directories
RUN mkdir -p data logs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

# Start the application
CMD ["npm", "start"]