# Use the official Node.js LTS image
FROM node:22-alpine
# Set working directory
WORKDIR /app
COPY back/configuration.dist.json ./configuration.json
RUN node -e "const fs=require('fs');const p='configuration.json';const c=JSON.parse(fs.readFileSync(p,'utf8'));c.staticFilesPath='./front';fs.writeFileSync(p,JSON.stringify(c,null,2));"
COPY back/dist ./back
COPY back/package-lock.json ./back/package-lock.json
COPY back/package.json ./back/package.json
RUN npm --prefix ./back ci --omit=dev


COPY front/dist/pagemaster-front/browser ./front


# Start the application
CMD ["node", "back/index.js"]