# Railway fix — 2 variables only

Your backend (**gallant-warmth**) only needs this:

## Step 1 — MongoDB → copy variable

1. Click **MongoDB** → **Variables**
2. Copy the full **MONGO_URL** (eye icon → copy all)

## Step 2 — Backend → paste as MONGO_URL

1. Click **gallant-warmth** → **Variables**
2. **Delete** `DATABASE_URL` if you have it (we auto-detect now)
3. Add:

| Name | Value |
|------|--------|
| `MONGO_URL` | paste exact copy from MongoDB (do not change anything) |
| `JWT_SECRET` | `TeamFlow_kajal_2026_xK9mP2vL8nQ4wR7jH5tY3sA6bC1dF0e` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://temp.com` |

4. **Settings** → Root Directory = `backend`
5. **Deployments** → **Redeploy**

The app will try several connection formats automatically (`authSource=admin`, `team_task_manager`, etc.).

## Step 3 — Test

`https://gallant-warmth-production-c4ca.up.railway.app/api/health`

## Step 4 — Frontend (reliable-victory)

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://gallant-warmth-production-c4ca.up.railway.app/api` |

Root Directory = `frontend` → Deploy

## Step 5

Set `FRONTEND_URL` on backend to your frontend URL → redeploy both.
