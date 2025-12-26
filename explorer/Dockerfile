# Envio Explorer Dockerfile for AutoBalancer
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm and envio dependencies
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate types (this might not work in Docker due to binary issues)
# RUN npm run codegen || echo "Codegen skipped - using manual types"

# Expose port (Hasura default)
EXPOSE 8080

# Start the indexer
CMD ["npm", "run", "dev"]