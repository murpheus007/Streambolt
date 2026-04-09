# Stage 1: Build React
FROM node:20-slim AS build-stage
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Stage 2: Final Production
FROM node:20-slim
WORKDIR /app
ENV DENO_INSTALL="/usr/local"
ENV PATH="/usr/local/bin:${PATH}"
ENV PORT=3000

# Install FFmpeg and Python (Required for yt-dlp)
RUN apt-get update && apt-get install -y ffmpeg python3 curl unzip && rm -rf /var/lib/apt/lists/*

# Install Deno from the official distribution because node:20-slim does not expose a native apt package.
RUN curl -fsSL https://deno.land/install.sh | sh

# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp

# Setup Backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# Copy React build to Backend's public folder
COPY --from=build-stage /app/frontend/dist ./public

EXPOSE 3000
CMD ["node", "index.js"]
