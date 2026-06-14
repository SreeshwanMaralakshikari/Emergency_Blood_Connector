# Backend Deployment — Render

## Steps

### 1. Push to GitHub
Make sure `.env` is in `.gitignore` (already set). Push the backend folder to a GitHub repo.

### 2. Create a Web Service on Render
- Go to https://render.com → New → Web Service
- Connect your GitHub repo
- Set the following settings:
  - **Name**: ebc-backend (or any name)
  - **Root Directory**: leave blank if backend is the root, else set to `backend/`
  - **Runtime**: Node
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`

### 3. Set Environment Variables in Render Dashboard
Under your service → Environment → Add the following:

| Key | Value |
|---|---|
| `PORT` | `5000` |
| `DB_URL` | Your MongoDB Atlas connection string |
| `SECRET_KEY` | A long random string (keep secret) |
| `FRONTEND_URL` | Your Vercel frontend URL e.g. `https://ebc.vercel.app` |

### 4. MongoDB Atlas Setup
- Go to https://cloud.mongodb.com
- Create a free M0 cluster
- Create a database user with read/write access
- Under Network Access → Allow access from anywhere (0.0.0.0/0) for Render
- Copy the connection string and paste it as DB_URL in Render

### 5. After deploy
- Copy your Render service URL (e.g. `https://ebc-backend.onrender.com`)
- Paste it into your Vercel frontend's Environment Variable as `VITE_API_BASE_URL`
- Redeploy the frontend

## Cookie / CORS Note
The backend uses HTTP-only cookies for JWT. Render uses HTTPS by default, so cookies work correctly.
Make sure `FRONTEND_URL` in Render matches your exact Vercel URL (no trailing slash).
