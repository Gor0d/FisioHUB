# Multi-stage build for production optimization
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat curl

# Install dependencies
FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production --frozen-lockfile && npm cache clean --force

# Build the application
FROM base AS builder
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --frozen-lockfile

COPY . .
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --ingroup nodejs backend

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set correct permissions
RUN chown -R backend:nodejs /app
USER backend

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${API_PORT:-3001}/health || exit 1

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production
ENV API_PORT=3001

# Start the application
CMD ["npm", "start"]