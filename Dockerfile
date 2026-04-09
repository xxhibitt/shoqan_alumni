FROM node:lts-alpine

WORKDIR /app

# We install dependencies if package.json exists.
# For local development with volume mounts, this ensures node_modules are built for the linux container.
COPY package.json package-lock.json* ./
RUN if [ -f package.json ]; then npm install; fi

# Expose port
EXPOSE 3000

# The actual start command is handled by docker-compose.yml `command: npm run dev`
CMD ["npm", "run", "dev"]
