# Quickstart: Phase 2 Full-Stack Web Application

**Branch**: `001-fullstack-webapp` | **Date**: 2026-02-07

## Prerequisites

- Python 3.13+ with UV package manager
- Node.js 18+ with npm
- Git
- Neon PostgreSQL account (free tier)
- Better Auth account/configuration

## 1. Clone and Setup

```bash
git clone <repository-url>
cd todo-phase-3
git checkout 001-fullstack-webapp
```

## 2. Backend Setup

```bash
cd backend

# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uv pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your values:
# DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
# BETTER_AUTH_SECRET=your-secret-key
# FRONTEND_URL=http://localhost:3000

# Start the backend server
uvicorn main:app --reload --port 8000
```

**Verify**: Visit `http://localhost:8000/health` — should
return `{"status": "healthy", "database": "connected"}`

## 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# BETTER_AUTH_SECRET=your-secret-key (same as backend)

# Start the frontend
npm run dev
```

**Verify**: Visit `http://localhost:3000` — should show the
landing page.

## 4. Test the Full Flow

1. Open `http://localhost:3000`
2. Click "Sign Up"
3. Enter email, password, name
4. Submit — redirected to dashboard
5. Add a task: title "Buy groceries", description "Milk"
6. Task appears in the list
7. Mark it complete (checkbox)
8. Edit the description
9. Delete the task
10. Log out

## 5. Environment Variables

### Backend `.env.example`

```env
DATABASE_URL=postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require
BETTER_AUTH_SECRET=change-me-to-a-random-string
BETTER_AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=change-me-to-a-random-string
BETTER_AUTH_URL=http://localhost:3000
```

## 6. API Quick Test (curl)

```bash
# Health check
curl http://localhost:8000/health

# Signup (via frontend Better Auth, not direct API)
# Use the web UI to create an account

# After signing in via web UI, test task endpoints:
# (Cookie is set automatically by Better Auth)

# List tasks
curl -b cookies.txt http://localhost:8000/api/{user_id}/tasks

# Create task
curl -b cookies.txt -X POST \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","description":"Testing"}' \
  http://localhost:8000/api/{user_id}/tasks
```

## 7. Production Deployment

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set root directory: `frontend/`
3. Add environment variables in Vercel dashboard
4. Deploy

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repo
3. Set root directory: `backend/`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables
7. Deploy

### Database (Neon)
1. Create project on neon.tech
2. Copy connection string to backend `.env`
3. Tables auto-created on first backend startup

## Common Issues

**CORS errors**: Ensure `FRONTEND_URL` in backend `.env`
matches the actual frontend URL (including protocol).

**Database connection timeout**: Neon free tier may have
cold starts. First request after idle period may be slow.

**Auth cookie not sent**: Ensure frontend and backend are
on the same domain in production, or configure
`sameSite: 'none'` with HTTPS.

**"Module not found"**: Run `uv pip install -r requirements.txt`
(backend) or `npm install` (frontend) again.
