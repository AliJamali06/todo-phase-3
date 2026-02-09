# Quickstart: AI-Powered Chatbot Interface

**Branch**: `002-ai-chatbot` | **Date**: 2026-02-08

## Prerequisites

- Phase 2 application fully functional (backend + frontend + database)
- Python 3.13+ with UV package manager
- Node.js 18+ with npm
- OpenAI API key (with GPT-4 or GPT-4o access)
- Neon PostgreSQL (same database as Phase 2)

## 1. Backend Setup (Extended)

```bash
cd backend

# Activate existing virtual environment
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Install new dependencies
uv pip install -r requirements.txt

# Add new environment variables to .env:
# OPENAI_API_KEY=sk-...
# BACKEND_URL=http://localhost:8000  (for MCP tools to call Phase 2 API)

# Start the backend (same as Phase 2)
uvicorn main:app --reload --port 8000
```

**Verify**: Visit `http://localhost:8000/health` — should still return healthy.

## 2. Frontend Setup (Extended)

```bash
cd frontend

# Install any new dependencies
npm install

# Add new environment variables to .env.local:
# NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-...  (from OpenAI Platform, after domain allowlist)

# Start the frontend (same as Phase 2)
npm run dev
```

**Verify**: Visit `http://localhost:3000/chat` — should show the chat interface.

## 3. New Environment Variables

### Backend `.env` (additions)

```env
# OpenAI API key for Agents SDK
OPENAI_API_KEY=sk-your-openai-api-key

# Backend URL for MCP tools to call Phase 2 REST API
BACKEND_URL=http://localhost:8000
```

### Frontend `.env.local` (additions)

```env
# OpenAI ChatKit domain key (required for production)
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-your-domain-key
```

## 4. Test the Chat Flow

1. Open `http://localhost:3000` and sign in
2. Navigate to `/chat`
3. See greeting message
4. Type: "Add buy groceries to my list"
5. Agent responds with confirmation
6. Type: "Show me all my tasks"
7. Agent lists tasks including the new one
8. Navigate to `/dashboard` — task appears there too
9. Mark task complete on dashboard
10. Return to `/chat`, ask "What have I completed?"
11. Agent includes the completed task

## 5. Chat API Quick Test (curl)

```bash
# Send a chat message (use auth cookie from browser)
curl -b cookies.txt -X POST \
  -H "Content-Type: application/json" \
  -d '{"message": "Add buy groceries to my list"}' \
  http://localhost:8000/api/{user_id}/chat

# Get conversation history
curl -b cookies.txt \
  http://localhost:8000/api/{user_id}/conversations

# Get messages for a conversation
curl -b cookies.txt \
  http://localhost:8000/api/{user_id}/conversations/{conversation_id}/messages
```

## 6. OpenAI ChatKit Domain Allowlist (Production)

1. Deploy frontend to Vercel (get production URL)
2. Go to https://platform.openai.com/settings/organization/security/domain-allowlist
3. Add your production domain (e.g., `your-app.vercel.app`)
4. Copy the domain key
5. Set `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` in Vercel environment variables
6. Redeploy frontend

## Common Issues

**"OpenAI API key invalid"**: Ensure `OPENAI_API_KEY` is set in backend `.env` and has GPT-4/4o access.

**ChatKit shows CORS error**: Domain allowlist not configured. Add your domain to OpenAI Platform allowlist.

**Chat responds but tasks not created**: Check that `BACKEND_URL` in backend `.env` points to the running backend (default: `http://localhost:8000`).

**"Conversation not found"**: The conversation_id does not belong to the authenticated user. Check auth token.

**Phase 2 dashboard broken**: Verify no Phase 2 files were modified. Check `/health` endpoint.
