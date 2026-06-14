# Frontend Deployment — Vercel

## Steps

### 1. Push to GitHub
Make sure `.env.local` is in `.gitignore` (already set). Push the frontend folder to a GitHub repo.

### 2. Import on Vercel
- Go to https://vercel.com → New Project
- Import your GitHub repo
- Set the following settings:
  - **Framework Preset**: Vite
  - **Root Directory**: leave blank if frontend is the root, else set to `frontend/`
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  - **Install Command**: `npm install`

### 3. Set Environment Variables in Vercel Dashboard
Under your project → Settings → Environment Variables → Add:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | Your Render backend URL e.g. `https://ebc-backend.onrender.com` |

### 4. Redeploy
After adding the environment variable, trigger a redeploy so it picks up the new value.

### 5. Update Backend CORS
Once you have your Vercel URL (e.g. `https://ebc.vercel.app`):
- Go to Render → your backend service → Environment
- Update `FRONTEND_URL` to your exact Vercel URL
- Render will auto-redeploy

## vercel.json Note
The `vercel.json` file rewrites all routes to `index.html` so React Router
handles client-side navigation correctly. This is already configured.

## Local Development
For local dev, your `.env.local` (not committed to git) should contain:
```
VITE_API_BASE_URL=http://localhost:5000
```
