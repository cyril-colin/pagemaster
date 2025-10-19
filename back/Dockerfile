# Use the official Node.js LTS image
FROM node:22-alpine
# Set working directory
WORKDIR /app

# Copy built application from dist folder
COPY dist ./dist
COPY package-lock.json ./dist/package-lock.json
COPY package.json ./dist/package.json
# Install production dependencies
RUN cd dist && npm ci --omit=dev


# Start the application
CMD ["node", "dist/index.js"]