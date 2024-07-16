# Base image
FROM node:21-alpine as development
# Alpine setup for pnpm
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production image
FROM node:21-alpine as production
RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

# Copy only the dist directory and necessary files
COPY --from=development /usr/src/app/dist ./dist
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod

# Command to run the application with path aliases resolved
CMD ["node", "-r", "tsconfig-paths/register", "dist/src/main.js"]
