# Use the official Node.js LTS image
FROM node:22-alpine
# Set working directory
WORKDIR /app
COPY configuration.dist.json ./configuration.json

COPY back/dist ./back
COPY back/package-lock.json ./back/package-lock.json
COPY back/package.json ./back/package.json
RUN npm --prefix ./back ci --omit=dev


COPY front/dist/pagemaster-front/browser ./front


# Start the application
CMD ["node", "back/index.js"]