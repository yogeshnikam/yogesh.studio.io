# yogesh.studio.io

Cross-device live streaming platform — web dashboard, mobile broadcaster, real-time engine, and Python API.

## Architecture

```
Mobile App (React Native + Expo)
        ↓
   WebRTC Stream
        ↓
LiveKit Server
        ↓
FastAPI Backend (+ WebSocket)
        ↓
Next.js Frontend Dashboard
```

## Phase 2 — Quick start

### 1. Infrastructure (Docker)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
npm run infra:up
```

Starts **MongoDB** (`27017`), **Redis** (`6379`), and **LiveKit** (`7880`) with dev keys `devkey` / `secret`.

### 2. API (FastAPI)

```powershell
# Windows — one-time setup
.\scripts\setup-api.ps1

# Start API on http://localhost:8000
npm run dev:api
```

Endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | API alive |
| GET | `/health/ready` | MongoDB + Redis |
| POST | `/api/v1/rooms` | Create stream room |
| GET | `/api/v1/rooms/{id}` | Get room |
| POST | `/api/v1/rooms/{id}/token` | LiveKit JWT |
| WS | `/ws` | Real-time channel (ping/pong) |

### 3. Web dashboard

```bash
cp apps/web/.env.local.example apps/web/.env.local
npm install
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000) — status panel checks API, MongoDB, and Redis.

### 4. Mobile app

```bash
cp apps/mobile/.env.example apps/mobile/.env
npm run dev:mobile
```

On a **physical device**, set `EXPO_PUBLIC_API_URL` to your PC’s LAN IP (e.g. `http://192.168.1.10:8000`).

## Monorepo layout

| Path | Purpose |
|------|---------|
| `apps/web` | Next.js dashboard (Vercel) |
| `apps/mobile` | React Native + Expo client |
| `backend/api` | FastAPI REST + WebSocket |
| `streaming/livekit` | LiveKit config + webhooks (Phase 3+) |
| `packages/shared-types` | Shared TypeScript types |
| `infrastructure/docker` | docker-compose for local stack |

## Tech stack

| Layer | Tech |
|-------|------|
| Web | Next.js 16 |
| Mobile | Expo 56 |
| API | FastAPI |
| Real-time | WebSocket (`/ws`) |
| Streaming | LiveKit |
| Database | MongoDB |
| Cache | Redis |

See `docs/architecture/README.md` for system design.
