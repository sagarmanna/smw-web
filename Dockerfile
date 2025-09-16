# Use official Node.js LTS image as base
FROM node:20-alpine

# Add bash for better scripting capabilities
RUN apk add --no-cache bash

# Set working directory
WORKDIR /apps

# Copy necessary files for package installation
COPY package.json ./
#un comment this if you are using yarn
# COPY yarn.lock ./
COPY tsconfig.json ./

# Install dependencies while skipping scripts to avoid running `npx projen`
RUN npm install --legacy-peer-deps --ignore-scripts

# Copy the web app source code
COPY . ./

# Expose the port your app runs on
EXPOSE 3000

# Set the default command to build and then start the app
CMD ["sh", "-c", "npm run build && npm run start"]