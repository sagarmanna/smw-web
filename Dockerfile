# Stage 1: Build the application
FROM node:20-alpine AS builder

# Add bash for better scripting capabilities
RUN apk add --no-cache bash

# Set working directory
WORKDIR /apps

# Copy package files first for better caching
COPY package.json yarn.lock ./

# Install dependencies with Yarn
RUN yarn install --frozen-lockfile

# Copy configuration files needed for build
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY next.config.ts ./

# Copy source code
COPY src ./src
COPY public ./public

# Build the Next.js application
# This creates .next directory with all chunks
RUN yarn build

# Stage 2: Production runtime
FROM node:20-alpine AS runner

WORKDIR /apps

# Add bash
RUN apk add --no-cache bash

# Copy package files
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy built application from builder stage
COPY --from=builder /apps/.next ./.next
COPY --from=builder /apps/public ./public
COPY --from=builder /apps/next.config.ts ./next.config.ts
COPY --from=builder /apps/package.json ./package.json

# Expose the port
EXPOSE 3000

# Start the application (no build needed - already built)
CMD ["yarn", "start"]
