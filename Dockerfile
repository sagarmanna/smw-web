# Use official Node.js LTS image as base
FROM node:20-alpine

# Add bash for better scripting capabilities
RUN apk add --no-cache bash

# Set working directory
WORKDIR /apps

# Copy necessary files for package installation
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./

# Install dependencies with Yarn
RUN yarn install --frozen-lockfile

# Copy the web app source code
COPY . ./

# Expose the port your app runs on
EXPOSE 3000

# Set the default command to build and then start the app
CMD ["sh", "-c", "yarn build && yarn start"]
