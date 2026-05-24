# Railway — API deployment

Deploy **`backend/api`** as a Railway service.

## Service settings

| Setting | Value |
|---------|--------|
| Root directory | `backend/api` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

## Environment variables

Copy from `backend/api/.env.example` — use production values from Atlas, Upstash, and LiveKit Cloud.

See **[docs/SETUP-AND-DEPLOYMENT.md](../../docs/SETUP-AND-DEPLOYMENT.md)** §3.6 and §5.
