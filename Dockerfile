# ================================================
# Stage 1: Build the application
# ================================================
FROM node:22.14-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY app/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY app/ ./

# Build the TypeScript application
RUN npm run build

# ================================================
# Stage 2: Production Image
# ================================================
FROM node:22.14-alpine

RUN apk update && apk upgrade
RUN apk --no-cache add curl

# Set working directory
WORKDIR /usr/src/app

# Copy only the necessary files from the build stage
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/dist ./dist

# Install only production dependencies
RUN npm install --only=production

# Expose the application port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]