# Todo Evolution - Full-Stack Web Application with AI Chatbot

A multi-user task management web application with an AI-powered chatbot interface, built with Next.js, FastAPI, and OpenAI Agents SDK.

## Architecture

```
frontend/ (Next.js 16 + TypeScript + Tailwind CSS)
  ├── app/           # App Router pages
  │   ├── chat/      # AI Chat interface (Phase 3)
  │   └── dashboard/ # Task management dashboard (Phase 2)
  ├── components/    # React components
  └── lib/           # API client, auth, chat API, types

backend/ (FastAPI + SQLModel + PostgreSQL)
  ├── routes/        # API endpoints
  │   ├── tasks.py   # Task CRUD (Phase 2)
  │   ├── chat.py    # AI Chat endpoint (Phase 3)
  │   └── conversations.py  # Chat history (Phase 3)
  ├── agents/        # OpenAI Agents SDK (Phase 3)
  │   └── todo_agent.py     # Task management agent
  ├── mcp/           # MCP Tools (Phase 3)
  │   ├── tools.py   # 5 task tools wrapping REST API
  │   └── server.py  # Tool registry
  ├── models.py      # Database models
  ├── schemas.py     # Request/response schemas
  └── auth.py        # JWT authentication
```

### MCP Tools → REST API Architecture (Phase 3)

```
User Chat Message
  → POST /api/{user_id}/chat (FastAPI)
    → OpenAI Agent (Agents SDK)
      → MCP Tool (e.g., add_task)
        → HTTP POST to /api/{user_id}/tasks (Phase 2 API)
        ← Phase 2 API response
      ← Tool result
    ← Agent response
  ← Chat response to client
```

MCP tools NEVER access the database directly — they call the Phase 2 REST API endpoints, ensuring data consistency between the chat and dashboard interfaces.

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp .env.example .env          # Edit with your values
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local    # Edit with your values
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | JWT signing secret (shared with frontend) |
| `FRONTEND_URL` | Frontend URL for CORS (`http://localhost:3000`) |
| `OPENAI_API_KEY` | OpenAI API key for Agents SDK (Phase 3) |
| `BACKEND_URL` | Backend URL for MCP tools (`http://localhost:8000`) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (`http://localhost:8000`) |
| `BETTER_AUTH_SECRET` | JWT signing secret (shared with backend) |
| `BETTER_AUTH_URL` | This app's URL (`http://localhost:3000`) |
| `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` | ChatKit domain key (production only) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/signin` | Sign in |
| POST | `/api/auth/signout` | Sign out |
| GET | `/api/{user_id}/tasks` | List tasks |
| POST | `/api/{user_id}/tasks` | Create task |
| GET | `/api/{user_id}/tasks/{id}` | Get task |
| PUT | `/api/{user_id}/tasks/{id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle complete |
| POST | `/api/{user_id}/chat` | Send chat message (Phase 3) |
| GET | `/api/{user_id}/conversations` | Get conversation (Phase 3) |
| GET | `/api/{user_id}/conversations/{id}/messages` | Get messages (Phase 3) |

## MCP Tools (Phase 3)

| Tool | Description | REST API Call |
|------|-------------|---------------|
| `add_task` | Create a new task | POST `/api/{user_id}/tasks` |
| `list_tasks` | List tasks (all/pending/completed) | GET `/api/{user_id}/tasks` |
| `complete_task` | Mark task as done | PATCH `/api/{user_id}/tasks/{id}/complete` |
| `delete_task` | Remove a task | DELETE `/api/{user_id}/tasks/{id}` |
| `update_task` | Change task title/description | PUT `/api/{user_id}/tasks/{id}` |

## Deployment

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set root directory: `frontend/`
3. Add environment variables
4. Deploy

### Backend (Render)
1. Create Web Service on Render
2. Set root directory: `backend/`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

### Database (Neon)
1. Create project at neon.tech
2. Copy connection string to backend `DATABASE_URL`
3. Tables auto-created on first startup
