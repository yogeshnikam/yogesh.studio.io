# API — FastAPI

REST + WebSocket service for yogesh.studio.io.

## Setup

```powershell
..\..\scripts\setup-api.ps1
```

## Run

From repo root:

```bash
npm run dev:api
```

Or directly:

```bash
cd backend/api
.venv\Scripts\activate   # Windows
uvicorn app.main:app --reload --port 8000
```

Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Environment

Copy `.env.example` to `.env`. Defaults match local Docker LiveKit keys (`devkey` / `secret`).
