# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including dev dependencies for build
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application with environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_AZURE_AD_CLIENT_ID=5a367da2-80e3-422b-8719-bccf6a61612e
ENV NEXT_PUBLIC_AZURE_AD_TENANT_ID=4e478318-c461-4365-8da2-f6b0809542b1
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application from .next/standalone to root
# This ensures all static files are available
RUN cp -r .next/standalone/* . && rm -rf .next/standalone

# Ensure static files are in correct location
RUN mkdir -p .next/static && \
    if [ -d ".next/static" ]; then echo "Static files exist"; else echo "No static files found"; fi

# Set correct permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]