# Stakeholder Comment Analysis

## Overview

Upload a CSV or plain-text file of stakeholder comments and receive an automated sentiment breakdown, keyword frequency analysis, and per-comment summaries powered by an NLP service running in the background.

## Prerequisites

- Node.js 20+
- Docker
- Docker Compose

## Setup

1. **Clone and install dependencies**

   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Configure environment**

   ```bash
   cp server/.env.example server/.env
   ```

   Open `server/.env` and fill in the required values (see Environment Variables below).

3. **Start backing services (PostgreSQL + Redis)**

   ```bash
   docker compose up -d
   ```

4. **Start the API server**

   ```bash
   cd server && npm run dev
   ```

5. **Start the frontend**

   ```bash
   cd client && npm run dev
   ```

6. **Open the app**

   Navigate to http://localhost:5173

## Environment Variables

| Name | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@localhost:5432/aveek` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `ANTHROPIC_API_KEY` | API key for the NLP service | `sk-ant-...` |
| `PORT` | Port the API server listens on | `3001` |

## API Reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload a comment file (multipart/form-data, field `file`). Returns `sessionId`, `totalComments`, `jobCount`. Rate limited to 10 requests per 15 minutes. |
| `POST` | `/api/analyze/text` | Analyze a single comment body sent as JSON `{ text }`. Returns sentiment, score, and summary. |
| `GET` | `/api/jobs/:id` | Get the state and progress of a background job by ID. |
| `GET` | `/api/sessions/:id/results` | Get aggregated results for a session: sentiment counts, top keywords, and aggregate summary. |
| `GET` | `/api/sessions/:id/comments` | List comments for a session with optional filters: `sentiment`, `keyword`, `page`, `limit`. |
| `GET` | `/api/sessions/:id/export` | Download all session comments as a CSV file. |
| `DELETE` | `/api/sessions/:id` | Delete a session and all associated data. Returns 204 on success. |
