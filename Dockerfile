# Stage 1: Build
FROM node:20-alpine AS builder

# Optional: install bash if needed
RUN apk add --no-cache bash

WORKDIR /app

# Copy dependency definitions
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy required build/config files
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY next.config.ts ./

# Copy the source code
COPY src ./src
COPY public ./public

# Build the Next.js app
RUN yarn build

# Stage 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Only copy what's needed for runtime
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["yarn", "start"]
