# StreamBolt

[![Tech Stack](https://img.shields.io/badge/Stack-React%2019%20%7C%20Express%205%20%7C%20Docker-blue.svg)](#tech-stack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A multi-platform social media video downloader supporting 12+ platforms including Facebook, Instagram, TikTok, Twitter/X, and more. Built with React 19 and Express 5, containerized with Docker for easy deployment.

## Features

- **12+ platforms** supported via yt-dlp integration
- **3 entry points** — Web UI, API, and programmatic access
- **Streaming downloads** — no waiting for full download before playback
- **Dockerized** — one command to deploy the full stack
- **SQLite** for lightweight persistence

## Tech Stack

- **Frontend:** React 19, Vite, TailwindCSS
- **Backend:** Express 5, Node.js, yt-dlp
- **Database:** SQLite
- **Deployment:** Docker, Docker Compose

## Quick Start

```bash
git clone https://github.com/murpheus007/Streambolt.git
cd Streambolt
cp .env.example .env
docker compose up -d
```

Access the app at `http://localhost:3000`.

## Project Structure

```
Streambolt/
├── frontend/          # React 19 + Vite SPA
├── backend/           # Express 5 API + yt-dlp integration
├── docker-compose.yml # Full stack orchestration
└── Dockerfile         # Multi-stage build
```

## License

MIT
