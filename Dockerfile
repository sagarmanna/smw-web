# Use official Node.js LTS image as base
FROM node:20-alpine

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

# Build the application
RUN yarn build

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]