# System design

## Phase 2 (implemented)

- **Next.js** dashboard at `apps/web` — health checks, create room
- **Expo** mobile at `apps/mobile` — API connectivity test
- **FastAPI** at `backend/api` — rooms, LiveKit tokens, WebSocket `/ws`
- **Docker Compose** at `infrastructure/docker` — MongoDB, Redis, LiveKit

## Data flow

1. **Mobile** publishes WebRTC to **LiveKit** (room + participant tokens from FastAPI).
2. **LiveKit** distributes streams to web viewers and triggers webhooks to the API.
3. **FastAPI** persists sessions, users, and device metadata in **MongoDB**; uses **Redis** for presence, rate limits, and pub/sub fan-out.
4. **WebSocket** at `/ws` handles cross-device sync (Phase 2: ping/pong + Redis presence stub).
5. **Next.js** dashboard consumes REST + WebSocket + LiveKit client SDK (Phase 3).

## Deployment targets

- `apps/web` → Vercel
- `backend/api` → Railway
- `streaming/livekit` → Railway or LiveKit Cloud
- Static assets / edge → Cloudflare

## Feature modules (`features/`)

Planned capabilities — implement as shared packages consumed by web, mobile, and workers:

- Activity AI detection
- Auto captions during stream
- Cross-device clipboard
- Live annotation
- Gesture controls
- Real-time translation
- Multi-camera sync
- Device cloud
