# Deploy TeamFlow on Railway — Simple Steps

Your code is here: https://github.com/kajal-yadav0612/Teamflow

You need **3 things** on Railway:
1. MongoDB (database)
2. Backend (API)
3. Frontend (website)

Do the steps **in order**. Do not skip.

---

## BEFORE YOU START

- Use Chrome or Edge.
- Log in to [railway.app](https://railway.app) with **GitHub**.
- If an old deploy failed, open your Railway project and **delete** any broken service that has a red “Failed” status (right-click → Delete). Keep only what this guide tells you to create.

---

## STEP 1 — New Railway project

1. Go to https://railway.app/dashboard
2. Click **+ New Project**
3. Click **Deploy from GitHub repo**
4. Choose **Teamflow** (`kajal-yadav0612/Teamflow`)
5. Railway may create one service — if deploy **fails** (red X), that is OK. We fix it in the next steps.

---

## STEP 2 — Add MongoDB (database)

1. Inside your project, click **+ New**
2. Click **Database**
3. Click **Add MongoDB**
4. Wait 1–2 minutes until it says **Active** (green)
5. Click the **MongoDB** box (not the other services)
6. Open the **Variables** tab
7. You should see `MONGO_URL` — leave this tab open; you will use it in Step 4

---

## STEP 3 — Add BACKEND (API)

1. Click **+ New** again
2. Click **GitHub Repo**
3. Select **Teamflow** again (same repo)
4. Click the **new service** Railway created
5. Click **Settings** (top)
6. Find **Root Directory** → click **Edit**
7. Type exactly: `backend` → Save

### Backend variables

8. Click **Variables** tab
9. Click **+ New Variable** and add these **one by one**:

| Name | Value |
|------|--------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `MyTeamFlowSecretKey2026ChangeLater` |
| `FRONTEND_URL` | `https://temp.com` |

10. For **DATABASE_URL** — click **+ New Variable**:
    - Name: `DATABASE_URL`
    - Click **Add Reference** (or the `{}` icon)
    - Choose your **MongoDB** service → variable **`MONGO_URL`**
    - After it inserts, click in the value box and at the **end** type: `/team_task_manager`  
      (So it looks like: `${{MongoDB.MONGO_URL}}/team_task_manager`)

### Backend public URL

11. Still in **Settings** → scroll to **Networking**
12. Click **Generate Domain**
13. Copy the URL (example: `https://teamflow-production-xxxx.up.railway.app`)
14. Open a new browser tab and go to: `YOUR-BACKEND-URL/api/health`  
    - Good: `{"status":"ok",...}`  
    - Bad: wait 2 minutes and try again, or check **Deployments** → **View Logs**

**Write your backend URL here:** _______________________________

---

## STEP 4 — Add FRONTEND (website)

1. Click **+ New** → **GitHub Repo** → **Teamflow**
2. Click the new service → **Settings**
3. **Root Directory** → set to: `frontend` → Save

### Frontend variable (important)

4. Click **Variables**
5. Add one variable:

| Name | Value |
|------|--------|
| `VITE_API_URL` | `YOUR-BACKEND-URL/api` |

Example: if backend is `https://teamflow-production-xxxx.up.railway.app`  
then set: `https://teamflow-production-xxxx.up.railway.app/api`

### Frontend public URL

6. **Settings** → **Networking** → **Generate Domain**
7. Copy the frontend URL

**Write your frontend URL here:** _______________________________

---

## STEP 5 — Connect backend and frontend

1. Open the **backend** service (root directory `backend`)
2. **Variables** → edit `FRONTEND_URL`
3. Change it to your **real frontend URL** from Step 4 (no `/` at the end)  
   Example: `https://teamflow-web-xxxx.up.railway.app`
4. Save (Railway redeploys the backend)

5. Open the **frontend** service
6. Click **Deployments** → three dots on latest deploy → **Redeploy**  
   (This rebuilds the site with the correct API URL)

---

## STEP 6 — Test the app

1. Open your **frontend URL** in the browser
2. Click **Create account** / Sign up
3. Make a project and a task

If signup works, you are done.

---

## If something failed — quick fixes

### “Failed” on a service with no root folder set
- **Settings** → **Root Directory** must be `backend` OR `frontend`, not empty.

### Backend failed in logs: “Can’t reach database”
- Check `DATABASE_URL` = MongoDB reference + `/team_task_manager` at the end.

### Backend failed: “Prisma” error
- Open **Deployments** → **View Logs** on backend. Redeploy after fixing `DATABASE_URL`.

### Signup works locally but “Server error” online
- Backend not connected to MongoDB → fix `DATABASE_URL`.
- Or `FRONTEND_URL` wrong → must match frontend URL exactly.

### Frontend loads but login/signup does nothing / network error
- `VITE_API_URL` must be `https://YOUR-BACKEND-URL/api`
- Then **Redeploy frontend** (Step 5).

### CORS error in browser (F12 → Console)
- Set `FRONTEND_URL` on backend to exact frontend URL, save, wait for redeploy.

### Too many services / confused
Your project should look like this:

```
[ MongoDB ]
[ backend ]  ← root: backend
[ frontend ] ← root: frontend
```

Delete any extra failed services from the root folder.

---

## Optional: use MongoDB Atlas instead of Railway MongoDB

If Railway MongoDB keeps failing:

1. https://www.mongodb.com/cloud/atlas → free account → create cluster
2. Database Access → create user + password
3. Network Access → Add IP → **Allow access from anywhere**
4. Connect → copy connection string
5. Replace password, add database name:  
   `mongodb+srv://user:PASS@cluster.mongodb.net/team_task_manager`
6. Paste as `DATABASE_URL` on backend (no reference variable needed)

---

## Need to push code updates later?

```powershell
cd "c:\Users\hp\New folder"
git add .
git commit -m "update"
git push
```

Railway redeploys automatically.
