# Stage 1: Build with Gradle and Java
FROM gradle:8.12.1-jdk-alpine AS build
WORKDIR /usr/src/app

# Install dependencies
RUN apk add --update --no-cache curl nodejs npm

# Check installations
RUN java -version && gradle --version && node -v && npm -v

# Copy gradle configuration files first (for better layer caching)
COPY app/build.gradle.kts settings.gradle.kts ./app/
COPY gradle ./app/gradle
COPY ./gradlew ./gradlew.bat ./app/

# Copy the rest of the source code
COPY . .

# Build the application
RUN gradle build
RUN gradle installProdDependencies

# Stage 2: Runtime image with Node.js
FROM node:22-alpine AS runtime
WORKDIR /app
RUN apk add --update --no-cache curl

# Copy necessary files from the build stage
COPY --from=build /usr/src/app/app/node_modules ./node_modules
COPY --from=build /usr/src/app/app/dist ./dist
COPY --from=build /usr/src/app/app/package.json ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]