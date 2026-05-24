# Go live — yogesh.studio.io

Deploy in this order. Total time: ~1–2 hours first time.

**You do NOT need Docker for production** — use cloud services below.

---

## What goes where

| Part | Host | Folder in repo |
|------|------|----------------|
| Web dashboard | **Vercel** | `apps/web` |
| API + WebSocket | **Railway** | `backend/api` |
| Database | **MongoDB Atlas** | (already set up) |
| Redis | **Upstash** | env var only |
| Live streaming | **LiveKit Cloud** | env var only |
| Mobile | **Expo** | `apps/mobile` (points to live API) |
| Domain (optional) | **Cloudflare** | DNS only |

---

## Step 1 — Production secrets (cloud)

### 1a. MongoDB Atlas

1. [cloud.mongodb.com](https://cloud.mongodb.com) → your cluster  
2. **Network Access** → allow `0.0.0.0/0` (or Railway IPs later)  
3. Copy connection string with database `/yogesh_studio`  
4. Save as `MONGODB_URI`

### 1b. Upstash Redis

1. [console.upstash.com](https://console.upstash.com) → **Create database**  
2. Copy **Redis URL** (`rediss://...`)  
3. Save as `REDIS_URL`

### 1c. LiveKit Cloud

1. [cloud.livekit.io](https://cloud.livekit.io) → **Create project**  
2. **Settings → Keys** → API Key + Secret  
3. Copy **WebSocket URL** (`wss://...`)  
4. Save as `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`

### 1d. JWT secret

Generate once (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

Save as `JWT_SECRET`.

---

## Step 2 — Deploy API (Railway)

1. Push code to **GitHub** (if not already).  
2. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → select repo.  
3. Click the service → **Settings**:
   - **Root Directory:** `backend/api`
   - **Start Command:**  
     `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Variables** tab — add:

| Variable | Value |
|----------|--------|
| `MONGODB_URI` | Atlas URI |
| `REDIS_URL` | Upstash URL |
| `LIVEKIT_URL` | `wss://....livekit.cloud` |
| `LIVEKIT_API_KEY` | from LiveKit |
| `LIVEKIT_API_SECRET` | from LiveKit |
| `JWT_SECRET` | random string from 1d |
| `CORS_ORIGINS` | `https://YOUR-VERCEL-URL.vercel.app` (update after Step 3) |

5. **Settings → Networking → Generate Domain**  
6. Copy URL, e.g. `https://yogesh-studio-api-production.up.railway.app`  
7. Test: open `https://YOUR-RAILWAY-URL/health` → should show `"status":"ok"`  
8. Test: `https://YOUR-RAILWAY-URL/health/ready` → `"ready":true` when Mongo + Redis work  

---

## Step 3 — Deploy web (Vercel)

1. [vercel.com](https://vercel.com) → **Add New Project** → import same GitHub repo.  
2. **Root Directory:** `apps/web`  
3. **Environment Variables:**

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | Railway URL from Step 2 |
| `NEXT_PUBLIC_WS_URL` | `wss://YOUR-RAILWAY-URL` (same host, `wss` not `ws`) |
| `NEXT_PUBLIC_LIVEKIT_URL` | LiveKit `wss://...` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (update after deploy) |

5. **Deploy**  
6. Open Vercel URL → status panel green → **Create room** works  
7. Go back to **Railway** → set `CORS_ORIGINS` to your real Vercel URL → redeploy API  

**Build failed?** Push latest code (fixes monorepo + `next.config.ts`). Ensure Root Directory is `apps/web`, not repo root.

---

## Step 4 — Mobile (production URLs)

Edit `apps/mobile/.env` (or Expo secrets):

```env
EXPO_PUBLIC_API_URL=https://YOUR-RAILWAY-URL.up.railway.app
EXPO_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

Run: `npm run dev:mobile` — app talks to live API.

---

## Step 5 — Custom domain (optional)

1. **Vercel** → Project → **Domains** → add `yogesh.studio.io`  
2. **Cloudflare** → DNS → point to Vercel (CNAME)  
3. **Railway** → add `api.yogesh.studio.io` custom domain  
4. Update env vars:
   - Vercel: `NEXT_PUBLIC_APP_URL=https://yogesh.studio.io`
   - Vercel: `NEXT_PUBLIC_API_URL=https://api.yogesh.studio.io`
   - Railway: `CORS_ORIGINS=https://yogesh.studio.io`

---

## Go-live checklist

- [ ] GitHub repo pushed  
- [ ] Atlas + Upstash + LiveKit configured  
- [ ] Railway `/health` and `/health/ready` OK  
- [ ] Vercel dashboard loads and creates a room  
- [ ] `CORS_ORIGINS` includes Vercel URL  
- [ ] Mobile `.env` uses production URLs  

---

## Full reference

See [SETUP-AND-DEPLOYMENT.md](./SETUP-AND-DEPLOYMENT.md) for account details and troubleshooting.
