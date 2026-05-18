# Deploy TeamFlow to Railway

Deploy in this order: **GitHub → Railway project → MongoDB → Backend → Frontend → link URLs**.

---

## Step 1 — Push code to GitHub

Open PowerShell in the project folder:

```powershell
cd "c:\Users\hp\New folder"
git init
git add .
git commit -m "TeamFlow: full-stack task manager"
git branch -M main
```

Create a new repo on GitHub (https://github.com/new) named e.g. `team-task-manager`, then:

```powershell
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/team-task-manager.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your GitHub username.

---

## Step 2 — Create Railway project

1. Go to **https://railway.app** → sign in with **GitHub**.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your `team-task-manager` repository.
4. Railway may create one service from the repo — you will add/configure three pieces total.

---

## Step 3 — Add MongoDB database

1. In the project canvas, click **+ New** → **Database** → **MongoDB**.
2. Wait until it shows **Active**.
3. Click the **MongoDB** service → **Variables** tab.
4. Note the variable name (usually `MONGO_URL`).

---

## Step 4 — Deploy the backend (API)

### 4a. Create or configure the backend service

1. **+ New** → **GitHub Repo** → same repository (if you do not already have a second service).
2. Click the service → **Settings**:
   - **Root Directory**: `backend`
   - **Watch Paths**: `backend/**` (optional)

### 4b. Variables

Open **Variables** → **Raw Editor** and paste (adjust MongoDB service name if yours is not `MongoDB`):

```env
DATABASE_URL=${{MongoDB.MONGO_URL}}/team_task_manager
JWT_SECRET=replace-with-a-long-random-string-at-least-32-characters
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://placeholder.up.railway.app
```

- **JWT_SECRET**: use a long random string (e.g. generate at https://generate-secret.vercel.app/32).
- **FRONTEND_URL**: temporary placeholder; update after Step 5 with your real frontend URL (no trailing slash).

Click the **{}** button next to `DATABASE_URL` to insert the MongoDB reference if the UI offers it: `${{MongoDB.MONGO_URL}}/team_task_manager`.

### 4c. Networking

1. **Settings** → **Networking** → **Generate Domain**.
2. Copy the URL, e.g. `https://teamflow-api-production.up.railway.app`.
3. Test in browser: `https://YOUR-API-URL/api/health` → should show `{"status":"ok",...}`.

### 4d. Deploy

Deployments run automatically. Check **Deployments** → **View logs** if it fails. The start command runs `prisma db push` then starts the API.

---

## Step 5 — Deploy the frontend

1. **+ New** → **GitHub Repo** → same repository again.
2. **Settings** → **Root Directory**: `frontend`.

### Variables (required before build)

```env
VITE_API_URL=https://YOUR-API-URL.up.railway.app/api
```

Use the **backend domain from Step 4** + `/api` at the end.

> `VITE_*` variables are baked in at **build time**. If you change this later, click **Redeploy**.

### Networking

1. **Generate Domain** for the frontend service.
2. Copy the URL, e.g. `https://teamflow-web-production.up.railway.app`.

### Redeploy backend with correct CORS

1. Open the **backend** service → **Variables**.
2. Set `FRONTEND_URL` to your frontend URL exactly (no trailing slash):

   ```
   FRONTEND_URL=https://teamflow-web-production.up.railway.app
   ```

3. Save — backend redeploys automatically.

---

## Step 6 — Verify

1. Open your **frontend** URL in the browser.
2. **Sign up** with a new account.
3. Create a project and a task.
4. If signup fails, check backend **Deploy logs** and MongoDB connection.

---

## Quick reference

| Service   | Root directory | Key variables |
|-----------|----------------|---------------|
| MongoDB   | (plugin)       | — |
| Backend   | `backend`      | `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `FRONTEND_URL` |
| Frontend  | `frontend`     | `VITE_API_URL` |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **Server error on signup** | Backend logs: MongoDB not connected. Check `DATABASE_URL` includes `/team_task_manager` after the Mongo reference. |
| **CORS error in browser** | `FRONTEND_URL` on backend must match frontend URL exactly (https, no trailing `/`). Redeploy backend. |
| **Frontend calls wrong API** | Set `VITE_API_URL` on frontend, then **Redeploy** frontend (not just restart). |
| **Build failed (frontend)** | Ensure `VITE_API_URL` is set before the build runs. |
| **Prisma / db push failed** | MongoDB service must be running; `DATABASE_URL` must be valid. |
| **502 / app not loading** | Check deploy logs; confirm `PORT` is provided by Railway (do not hardcode in Dockerfile). |

---

## Optional: MongoDB Atlas instead of Railway MongoDB

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/team_task_manager`
3. Set as `DATABASE_URL` on the backend service (Atlas includes replica set — works with Prisma).

---

## Architecture

```
[Browser] → [Frontend on Railway] → [Backend API on Railway] → [MongoDB on Railway/Atlas]
```

Local dev uses in-memory MongoDB via `npm run dev` in `backend/` — production always uses `DATABASE_URL` from Railway.
