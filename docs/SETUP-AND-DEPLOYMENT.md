# yogesh.studio.io — Setup & Deployment Guide

Complete step-by-step guide: what to do in each account you created, where to paste values in this repo, how to run locally with Docker, and how to deploy.

**Repo root:** `yogesh.studio.io/`

---

## Table of contents

1. [How the project is organized](#1-how-the-project-is-organized)
2. [Environment files cheat sheet](#2-environment-files-cheat-sheet)
3. [Account-by-account configuration](#3-account-by-account-configuration)
4. [Run locally (Docker + apps)](#4-run-locally-docker--apps)
5. [Deploy to production](#5-deploy-to-production)
6. [Verify everything works](#6-verify-everything-works)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. How the project is organized

```
yogesh.studio.io/
├── apps/web/              → Next.js dashboard        → Deploy: Vercel
├── apps/mobile/           → Expo mobile app          → Dev: Expo Go / EAS later
├── backend/api/           → FastAPI + WebSocket      → Deploy: Railway
├── infrastructure/docker/ → MongoDB, Redis, LiveKit  → Local only
├── deploy/vercel/         → Vercel hints
├── deploy/railway/        → Railway hints
└── docs/                  → This guide
```

| Service | Local (Docker) | Production (cloud) |
|---------|----------------|---------------------|
| MongoDB | Docker `:27017` **or** Atlas | **MongoDB Atlas** |
| Redis | Docker `:6379` **or** Upstash | **Upstash** or Railway Redis |
| LiveKit | Docker `ws://localhost:7880` **or** LiveKit Cloud | **LiveKit Cloud** |
| API | `backend/api` → port 8000 | **Railway** |
| Web | `apps/web` → port 3000 | **Vercel** |
| Mobile | `apps/mobile` → Expo | Expo + production API URL |
| Domain | — | **Cloudflare** (optional) |

---

## 2. Environment files cheat sheet

| File | Create from | Who reads it |
|------|-------------|--------------|
| `backend/api/.env` | `backend/api/.env.example` | FastAPI (MongoDB, Redis, LiveKit, JWT, CORS) |
| `apps/web/.env.local` | `apps/web/.env.local.example` | Next.js dashboard |
| `apps/mobile/.env` | `apps/mobile/.env.example` | Expo app |

**Never commit** `.env` or `.env.local` (already in `.gitignore`).  
**Only commit** `.env.example` files (placeholders, no real passwords).

### Copy templates (Windows PowerShell)

```powershell
cd e:\yogesh.studio\yogesh.studio.io

copy backend\api\.env.example backend\api\.env
copy apps\web\.env.local.example apps\web\.env.local
copy apps\mobile\.env.example apps\mobile\.env
```

---

## 3. Account-by-account configuration

For each account: **where to click** → **what to copy** → **where to paste in this project**.

---

### 3.1 GitHub

**Purpose:** Store code; connect Vercel and Railway for auto-deploy.

| Step | Action |
|------|--------|
| 1 | Go to [github.com](https://github.com) → **New repository** → name e.g. `yogesh.studio.io` |
| 2 | On your PC: `cd e:\yogesh.studio\yogesh.studio.io` |
| 3 | `git remote add origin https://github.com/YOUR_USERNAME/yogesh.studio.io.git` |
| 4 | `git push -u origin main` |

**Nothing to paste in `.env`** — used only for deployment connections.

---

### 3.2 MongoDB Atlas

**Purpose:** Database for rooms, users, sessions.  
**Project file:** `backend/api/.env` → `MONGODB_URI`

| Step | Where in Atlas | What to do |
|------|----------------|------------|
| 1 | [cloud.mongodb.com](https://cloud.mongodb.com) → your project | Open cluster `yogesh-studio-cluster` (or create one) |
| 2 | **Database** → **Connect** → **Drivers** | Copy connection string |
| 3 | Replace `<password>` with your DB user password | Use user from **Database Access** |
| 4 | **Important:** Add database name before `?` | e.g. `/yogesh_studio` |

**Example URI shape:**

```text
mongodb+srv://USERNAME:PASSWORD@yogesh-studio-cluster.pob1ftv.mongodb.net/yogesh_studio?retryWrites=true&w=majority&appName=yogesh-studio-cluster
```

| Step | Where in Atlas | What to do |
|------|----------------|------------|
| 5 | **Database Access** | User needs **read/write** on `yogesh_studio` |
| 6 | **Network Access** → **Add IP Address** | For local dev: **Add Current IP** (or `0.0.0.0/0` for testing only) |
| 7 | For Railway deploy | Add Railway egress IPs or `0.0.0.0/0` temporarily, then restrict later |

**Paste into project:**

```env
# backend/api/.env
MONGODB_URI=mongodb+srv://...@....mongodb.net/yogesh_studio?retryWrites=true&w=majority&appName=...
```

**Test locally:**

```powershell
cd backend\api
.\.venv\Scripts\python.exe scripts\test_mongo.py
```

Expected: `MongoDB ping: ok`

**Local Docker alternative (no Atlas):**

```env
MONGODB_URI=mongodb://localhost:27017/yogesh_studio
```

Run `npm run infra:up` so MongoDB container is running.

---

### 3.3 Redis — Upstash (production) or Docker (local)

**Purpose:** Cache, WebSocket presence, queues.  
**Project file:** `backend/api/.env` → `REDIS_URL`

#### Option A — Local Docker (recommended if Docker is running)

| Step | Action |
|------|--------|
| 1 | From repo root: `npm run infra:up` |
| 2 | Redis runs on `localhost:6379` |

```env
# backend/api/.env
REDIS_URL=redis://localhost:6379/0
```

#### Option B — Upstash (production or local without Docker Redis)

| Step | Where in Upstash | What to do |
|------|------------------|------------|
| 1 | [console.upstash.com](https://console.upstash.com) → **Create database** | Region near your users |
| 2 | Database page → **REST** or **Redis** tab | Copy **Redis URL** (starts with `rediss://` or `redis://`) |
| 3 | Paste into `backend/api/.env` | `REDIS_URL=...` |

```env
# backend/api/.env
REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379
```

---

### 3.4 LiveKit — Docker (local) or LiveKit Cloud (production)

**Purpose:** WebRTC streaming.  
**Project files:**

- `backend/api/.env` → `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- `apps/web/.env.local` → `NEXT_PUBLIC_LIVEKIT_URL`
- `apps/mobile/.env` → `EXPO_PUBLIC_LIVEKIT_URL`

#### Option A — Local Docker (matches `infrastructure/livekit/livekit.yaml`)

| Step | Action |
|------|--------|
| 1 | `npm run infra:up` (starts LiveKit on port 7880) |
| 2 | Keys are preconfigured in repo: `devkey` / `secret` |

```env
# backend/api/.env
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

```env
# apps/web/.env.local
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880

# apps/mobile/.env
EXPO_PUBLIC_LIVEKIT_URL=ws://localhost:7880
```

Config file reference: `infrastructure/livekit/livekit.yaml` (keys section).

#### Option B — LiveKit Cloud (production)

| Step | Where in LiveKit Cloud | What to do |
|------|------------------------|------------|
| 1 | [cloud.livekit.io](https://cloud.livekit.io) → **Create project** | Note project name |
| 2 | **Settings** → **Keys** | Create / copy **API Key** and **API Secret** |
| 3 | **Settings** → **Project URL** | Copy WebSocket URL (e.g. `wss://your-project.livekit.cloud`) |

```env
# backend/api/.env (production)
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxx
LIVEKIT_API_SECRET=xxxxxxxx
```

```env
# apps/web/.env.local (production)
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud

# apps/mobile/.env (production)
EXPO_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

---

### 3.5 Docker Desktop

**Purpose:** Run MongoDB, Redis, and LiveKit locally.  
**Project folder:** `infrastructure/docker/docker-compose.yml`

| Step | Action |
|------|--------|
| 1 | Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| 2 | Start Docker Desktop (whale icon running) |
| 3 | From repo root: `npm run infra:up` |
| 4 | Check containers: `docker ps` — should see `mongodb`, `redis`, `livekit` |
| 5 | View logs: `npm run infra:logs` |
| 6 | Stop: `npm run infra:down` |

**Ports used:**

| Service | Port |
|---------|------|
| MongoDB | 27017 |
| Redis | 6379 |
| LiveKit | 7880 (WS), 7881 (TCP), 50000–50100 (UDP) |

**Note:** If you use **Atlas for MongoDB**, you can still use Docker only for Redis + LiveKit:

- Keep `MONGODB_URI` pointing to Atlas
- Run `docker compose` — MongoDB container is optional; Redis + LiveKit are what the API needs locally besides Atlas

---

### 3.6 Railway (FastAPI backend)

**Purpose:** Host `backend/api` in production.  
**Dashboard:** [railway.app](https://railway.app)

| Step | Where in Railway | What to do |
|------|------------------|------------|
| 1 | **New Project** → **Deploy from GitHub repo** | Select `yogesh.studio.io` |
| 2 | Add service → set **Root Directory** | `backend/api` |
| 3 | **Settings** → **Deploy** → **Custom Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| 4 | **Variables** tab | Add all variables from table below |
| 5 | **Settings** → **Networking** → **Generate Domain** | e.g. `https://yogesh-studio-api-production.up.railway.app` |
| 6 | Copy public URL | Used in Vercel + Expo env |

**Railway environment variables** (paste from your real accounts):

| Variable | Example / source |
|----------|------------------|
| `MONGODB_URI` | From Atlas (section 3.2) |
| `REDIS_URL` | From Upstash (section 3.3) |
| `LIVEKIT_URL` | From LiveKit Cloud `wss://...` |
| `LIVEKIT_API_KEY` | LiveKit Cloud keys |
| `LIVEKIT_API_SECRET` | LiveKit Cloud keys |
| `JWT_SECRET` | Random 32+ char string (generate once, keep secret) |
| `CORS_ORIGINS` | `https://your-app.vercel.app,https://yogesh.studio.io` |

**Optional:** `deploy/railway/` — add `railway.toml` or Dockerfile later; not required for first deploy.

---

### 3.7 Vercel (Next.js web)

**Purpose:** Host `apps/web` dashboard.  
**Dashboard:** [vercel.com](https://vercel.com)

| Step | Where in Vercel | What to do |
|------|-----------------|------------|
| 1 | **Add New** → **Project** → Import GitHub repo | |
| 2 | **Root Directory** | Click **Edit** → set to `apps/web` |
| 3 | Framework Preset | Next.js (auto-detected) |
| 4 | **Environment Variables** | Add table below |
| 5 | **Deploy** | Wait for build |
| 6 | **Settings** → **Domains** | Add `yogesh.studio.io` when ready |

**Vercel environment variables:**

| Variable | Local value | Production value |
|----------|-------------|------------------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://yogesh.studio.io` or Vercel URL |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Railway API URL |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8000` | `wss://your-api.up.railway.app` |
| `NEXT_PUBLIC_LIVEKIT_URL` | `ws://localhost:7880` | LiveKit Cloud `wss://...` |

Reference: `apps/web/.env.local.example`

---

### 3.8 Expo (mobile)

**Purpose:** Run and distribute `apps/mobile`.  
**Dashboard:** [expo.dev](https://expo.dev)

| Step | Where in Expo | What to do |
|------|---------------|------------|
| 1 | Create account / log in | |
| 2 | Optional: `npx expo login` in `apps/mobile` | Links CLI to your account |
| 3 | Configure env | `apps/mobile/.env` |

**Local (emulator / same machine):**

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_LIVEKIT_URL=ws://localhost:7880
```

**Physical phone (must use PC LAN IP, not `localhost`):**

```env
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:8000
EXPO_PUBLIC_LIVEKIT_URL=ws://192.168.1.XXX:7880
```

Find IP: PowerShell → `ipconfig` → IPv4 Address.

**Production (after Railway deploy):**

```env
EXPO_PUBLIC_API_URL=https://your-api.up.railway.app
EXPO_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

| Step | Command |
|------|---------|
| Start dev server | From repo root: `npm run dev:mobile` |
| Scan QR | Expo Go app on phone |

---

### 3.9 Cloudflare (optional — custom domain)

**Purpose:** DNS for `yogesh.studio.io`.  
**Dashboard:** [dash.cloudflare.com](https://dash.cloudflare.com)

| Step | Where in Cloudflare | What to do |
|------|---------------------|------------|
| 1 | **Add site** → `yogesh.studio.io` | Follow nameserver instructions at registrar |
| 2 | **DNS** → **Records** | |
| 3 | `CNAME` `www` | Target: `cname.vercel-dns.com` (Vercel will show exact value) |
| 4 | `CNAME` `@` or `A` | Per Vercel custom domain docs |
| 5 | `CNAME` `api` | Target: Railway custom hostname |
| 6 | Update **Railway** `CORS_ORIGINS` | Include `https://yogesh.studio.io` |
| 7 | Update **Vercel** env | `NEXT_PUBLIC_APP_URL=https://yogesh.studio.io` |

Reference folder: `deploy/cloudflare/`

---

## 4. Run locally (Docker + apps)

Use this flow when Docker Desktop is running on your machine.

### 4.1 One-time prerequisites

```powershell
cd e:\yogesh.studio\yogesh.studio.io

# Node dependencies
npm install

# Python API venv + packages
.\scripts\setup-api.ps1

# Env files (if not done)
copy backend\api\.env.example backend\api\.env
copy apps\web\.env.local.example apps\web\.env.local
copy apps\mobile\.env.example apps\mobile\.env
```

Edit `backend/api/.env` for your setup:

**Recommended hybrid (Atlas + Docker Redis/LiveKit):**

```env
MONGODB_URI=mongodb+srv://...@....mongodb.net/yogesh_studio?...
REDIS_URL=redis://localhost:6379/0
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
JWT_SECRET=local-dev-secret-change-in-production
```

**Full local Docker (no Atlas):**

```env
MONGODB_URI=mongodb://localhost:27017/yogesh_studio
REDIS_URL=redis://localhost:6379/0
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

### 4.2 Start infrastructure

```powershell
cd e:\yogesh.studio\yogesh.studio.io
npm run infra:up
```

Wait ~30 seconds, then:

```powershell
docker ps
```

You should see containers for **mongodb**, **redis**, and **livekit**.

### 4.3 Start API (Terminal 1)

```powershell
cd e:\yogesh.studio\yogesh.studio.io
npm run dev:api
```

| URL | Purpose |
|-----|---------|
| http://localhost:8000/health | API alive |
| http://localhost:8000/health/ready | MongoDB + Redis |
| http://localhost:8000/docs | Swagger UI |

### 4.4 Start web dashboard (Terminal 2)

```powershell
cd e:\yogesh.studio\yogesh.studio.io
npm run dev:web
```

Open **http://localhost:3000** — status panel should show API, MongoDB, Redis as **up** when configured correctly.

### 4.5 Start mobile (Terminal 3)

```powershell
cd e:\yogesh.studio\yogesh.studio.io
npm run dev:mobile
```

Press `w` for web, or scan QR with **Expo Go**.

### 4.6 Local run checklist

| # | Check | Pass? |
|---|--------|-------|
| 1 | `docker ps` shows 3 containers | ☐ |
| 2 | http://localhost:8000/health → `"status":"ok"` | ☐ |
| 3 | http://localhost:8000/health/ready → `"ready":true` | ☐ |
| 4 | http://localhost:3000 → dashboard loads | ☐ |
| 5 | Create room on dashboard → room ID shown | ☐ |
| 6 | Mobile app → API status **ok** | ☐ |

### 4.7 Stop local stack

```powershell
# Stop API / web / mobile: Ctrl+C in each terminal

# Stop Docker services
npm run infra:down
```

---

## 5. Deploy to production

Do these **in order** after local testing works.

### Phase 1 — Cloud data & streaming

| Order | Service | Action |
|-------|---------|--------|
| 1 | MongoDB Atlas | Production URI + Network Access for Railway |
| 2 | Upstash | Create Redis → copy `REDIS_URL` |
| 3 | LiveKit Cloud | Create project → copy URL + API key + secret |

### Phase 2 — Backend (Railway)

| Step | Action |
|------|--------|
| 1 | Railway → New Project → GitHub → repo `yogesh.studio.io` |
| 2 | Service root: `backend/api` |
| 3 | Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| 4 | Add env vars (section 3.6 table) |
| 5 | Deploy → copy public URL → test `https://YOUR-API.up.railway.app/health` |

### Phase 3 — Frontend (Vercel)

| Step | Action |
|------|--------|
| 1 | Vercel → Import repo → root `apps/web` |
| 2 | Set `NEXT_PUBLIC_*` vars to Railway + LiveKit production URLs |
| 3 | Deploy → open Vercel URL |
| 4 | Confirm dashboard + create room works |

### Phase 4 — Mobile (Expo)

| Step | Action |
|------|--------|
| 1 | Set `apps/mobile/.env` to production Railway + LiveKit URLs |
| 2 | `npm run dev:mobile` or EAS build when ready for stores |

### Phase 5 — Domain (Cloudflare)

| Step | Action |
|------|--------|
| 1 | Point DNS to Vercel and Railway |
| 2 | Update all `CORS_ORIGINS` and `NEXT_PUBLIC_*` URLs to final domain |
| 3 | Redeploy Railway + Vercel after env changes |

### Production env summary

| Location | Key variables |
|----------|----------------|
| **Railway** | `MONGODB_URI`, `REDIS_URL`, `LIVEKIT_*`, `JWT_SECRET`, `CORS_ORIGINS` |
| **Vercel** | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_LIVEKIT_URL`, `NEXT_PUBLIC_APP_URL` |
| **Expo / mobile** | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_LIVEKIT_URL` |

---

## 6. Verify everything works

### Local

```powershell
# MongoDB (Atlas)
cd backend\api
.\.venv\Scripts\python.exe scripts\test_mongo.py

# API health
Invoke-RestMethod http://localhost:8000/health
Invoke-RestMethod http://localhost:8000/health/ready
```

### Production

```powershell
Invoke-RestMethod https://YOUR-API.up.railway.app/health
Invoke-RestMethod https://YOUR-API.up.railway.app/health/ready
```

Open Vercel URL → all status indicators green → **Create room** succeeds.

---

## 7. Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| MongoDB `Authentication failed` | Wrong password or user | Atlas → Database Access → reset password → update `backend/api/.env` |
| MongoDB timeout | IP not allowed | Atlas → Network Access → Add Current IP |
| Redis down locally | Docker not running | Start Docker Desktop → `npm run infra:up` |
| `ready: false` | One of Mongo/Redis down | Check `/health/ready` which check failed |
| Web shows API offline | Wrong `NEXT_PUBLIC_API_URL` | `apps/web/.env.local` must be `http://localhost:8000` |
| Mobile can't reach API | Using `localhost` on phone | Use PC LAN IP in `apps/mobile/.env` |
| LiveKit token fails | Key mismatch | Local: `devkey`/`secret`; Cloud: match LiveKit dashboard |
| CORS error in browser | Railway blocking origin | Add Vercel URL to `CORS_ORIGINS` on Railway |
| `docker` not found | Docker not in PATH | Install Docker Desktop, restart terminal |

---

## Quick command reference

```powershell
# Repo root: e:\yogesh.studio\yogesh.studio.io

npm run infra:up          # Start MongoDB, Redis, LiveKit
npm run infra:down        # Stop containers
npm run infra:logs        # Follow logs

npm run dev:api           # FastAPI :8000
npm run dev:web           # Next.js :3000
npm run dev:mobile        # Expo

.\scripts\setup-api.ps1   # Reinstall Python deps
```

---

*Last updated for Phase 2 monorepo layout. Phase 3 will add LiveKit video SDK integration on web and mobile.*
