# Stage 1: Build Flutter Web App
FROM ubuntu:20.04 AS build-env

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y curl git unzip xz-utils zip libglu1-mesa \
    && rm -rf /var/lib/apt/lists/*

# Install Flutter
RUN git clone https://github.com/flutter/flutter.git -b stable /usr/local/flutter
ENV PATH="/usr/local/flutter/bin:/usr/local/flutter/bin/cache/dart-sdk/bin:${PATH}"

# Run basic check to download Dart SDK
RUN flutter doctor

WORKDIR /app
COPY queueless/ ./queueless/

WORKDIR /app/queueless
# Get dependencies and build web
RUN flutter pub get
RUN flutter build web --release

# Stage 2: Setup Node.js Backend and Serve
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy backend package files and install
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source
COPY backend/ ./

# Create a public folder and copy flutter web build into it
RUN mkdir -p /usr/src/app/public
COPY --from=build-env /app/queueless/build/web /usr/src/app/public

# Expose port (Fly.io uses 8080 by default or reads from process.env.PORT)
EXPOSE 3000
ENV PORT=3000

# Override server.js static serving in production if needed
# We will use a script to start
CMD ["node", "server.js"]
