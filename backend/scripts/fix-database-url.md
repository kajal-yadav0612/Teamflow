# Fix DATABASE_URL on Railway (stops Prisma P1012 crash)

## Easy method — copy/paste

1. Railway → click **MongoDB** service
2. **Variables** tab → find **MONGO_URL**
3. Click the **eye** icon to show the full value → **Copy** it

4. Click **gallant-warmth** (backend) → **Variables**
5. Edit or add **DATABASE_URL**
6. Paste the copied URL, then add **`/team_task_manager`** right after the port:

### If your URL looks like this:
```
mongodb://mongo:PASSWORD@containers-us-west-123.railway.app:7654
```

### Set DATABASE_URL to:
```
mongodb://mongo:PASSWORD@containers-us-west-123.railway.app:7654/team_task_manager
```

### If your URL already has `?` at the end:
```
mongodb://...@host:port/railway?authSource=admin
```

Change to:
```
mongodb://...@host:port/team_task_manager?authSource=admin
```
(Replace `railway` with `team_task_manager` before the `?`)

7. **Save** → **Deployments** → **Redeploy**
