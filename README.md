# TeamFlow 🚀

A full-stack team task management application that helps teams organize projects, assign tasks, and collaborate efficiently.

## Live Demo

- **Frontend:** https://insightful-stillness-production-e1b0.up.railway.app
- **Backend API:** https://teamflow-production-ab59.up.railway.app

---

## Features

- User authentication (signup, login, JWT-based sessions)
- Create and manage projects
- Create, assign, and track tasks within projects
- Team collaboration with role-based access
- Real-time task status updates

---

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Deployed on Railway

**Backend**
- Node.js + Express
- Prisma ORM
- MongoDB Atlas
- JWT Authentication
- Deployed on Railway

---

## Project Structure

```
Teamflow/
├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── railway.toml
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   └── tasks.js
│   │   ├── middleware/
│   │   ├── lib/
│   │   ├── validators/
│   │   └── server.js
│   ├── prisma/
│   ├── package.json
│   └── railway.toml
└── railway.json
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create a new project |
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create a new task |

---

## Getting Started Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/kajal-yadav0612/Teamflow.git
cd Teamflow
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.w2zk2ap.mongodb.net/teamflow?appName=Cluster0
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

Run the backend:

```bash
npm start
```

### 3. Set up the Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Run the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Deployment (Railway)

This project is deployed on [Railway](https://railway.com) as two separate services.

### Backend Service
- Root Directory: `backend`
- Start Command: `npm start`
- Environment Variables:
  - `DATABASE_URL` — MongoDB connection string
  - `JWT_SECRET` — Secret key for JWT tokens
  - `FRONTEND_URL` — Frontend deployment URL
  - `NODE_ENV` — `production`

### Frontend Service
- Root Directory: `frontend`
- Start Command: `npm start`
- Environment Variables:
  - `VITE_API_URL` — Backend API URL + `/api`

---

## Environment Variables Reference

| Variable | Service | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Backend | MongoDB Atlas connection string |
| `JWT_SECRET` | Backend | Secret for signing JWT tokens |
| `FRONTEND_URL` | Backend | Frontend URL for CORS |
| `NODE_ENV` | Backend | Set to `production` on Railway |
| `VITE_API_URL` | Frontend | Backend API base URL |

---

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Made with ❤️ by [Kajal Yadav](https://github.com/kajal-yadav0612)
