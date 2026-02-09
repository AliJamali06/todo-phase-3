---
id: 009
title: Phase 3 AI Chatbot Implementation
stage: green
date: 2026-02-08
surface: agent
model: claude-opus-4-6
feature: 002-ai-chatbot
branch: 002-ai-chatbot
user: ALIjamali
command: /sp.implement
labels: ["implementation", "phase3", "chatbot", "ai", "mcp", "agents-sdk", "openai", "fastapi", "nextjs"]
links:
  spec: specs/002-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/mcp_tools/__init__.py
  - backend/mcp_tools/tools.py
  - backend/mcp_tools/server.py
  - backend/agent/__init__.py
  - backend/agent/todo_agent.py
  - backend/routes/chat.py
  - backend/routes/conversations.py
  - backend/models.py
  - backend/config.py
  - backend/main.py
  - backend/requirements.txt
  - backend/.env.example
  - frontend/lib/chatApi.ts
  - frontend/app/chat/page.tsx
  - frontend/middleware.ts
  - frontend/components/Header.tsx
  - frontend/.env.example
  - README.md
tests:
  - Frontend build: PASS (all routes compile including /chat)
  - Python syntax: PASS (all 7 new/modified files parse clean)
  - Module imports: PASS (openai-agents SDK, mcp_tools, agent modules)
---

## Prompt

/sp.implement

User triggered implementation of Phase 3 AI-Powered Chatbot Interface from tasks.md (T001-T030).

## Response snapshot

Implemented all 30 tasks across 7 phases for the Phase 3 AI Chatbot feature:

**Phase 1: Setup (T001-T004)**
- Created `backend/mcp_tools/` and `backend/agent/` directories with `__init__.py`
- Added `openai-agents` and `httpx` to requirements.txt
- Updated `.env.example` files with Phase 3 variables (OPENAI_API_KEY, BACKEND_URL, NEXT_PUBLIC_OPENAI_DOMAIN_KEY)

**Phase 2: Foundational (T005-T007)**
- Extended `models.py` with Conversation and Message SQLModel entities (FK relationships, indexes, cascade deletes)
- Extended `config.py` with OPENAI_API_KEY and BACKEND_URL
- Verified `main.py` import chain registers new models for `create_all`

**Phase 3: US1 — Chat-Based Task Management (T008-T016)**
- Created 5 MCP tools in `mcp_tools/tools.py` using `@function_tool` decorator: add_task, list_tasks, complete_task, delete_task, update_task — all calling Phase 2 REST API via httpx
- Created tool registry in `mcp_tools/server.py`
- Created OpenAI Agent in `agent/todo_agent.py` with comprehensive system prompt (capabilities, ambiguity handling, error handling, off-topic redirection)
- Created POST `/api/{user_id}/chat` endpoint in `routes/chat.py` (stateless: load history, run agent, persist messages)
- Registered chat router in `main.py`
- Created `frontend/lib/chatApi.ts` with sendMessage, getConversations, getMessages
- Created `frontend/app/chat/page.tsx` with chat bubble UI, history loading, greeting message, error handling
- Updated `middleware.ts` to protect `/chat` route
- Updated `Header.tsx` with Dashboard/Chat navigation links

**Phase 4: US2 — Conversation Persistence (T017-T020)**
- Created `routes/conversations.py` with GET conversations and GET messages endpoints
- Registered conversations router in `main.py`
- Chat page loads history on mount (already built into T014)

**Phase 5: US3 — Dual UI Consistency (T021-T022)**
- Verified MCP tools call same Phase 2 REST API endpoints as dashboard
- Verified dashboard re-fetches on mount (no stale cache)

**Phase 6: US4 — Error & Ambiguity Handling (T023-T026)**
- Agent system prompt includes comprehensive error/ambiguity handling
- MCP tools handle HTTP errors, network errors, timeouts gracefully
- Chat endpoint validates empty messages (MESSAGE_EMPTY)
- Frontend displays errors inline, handles session expiry

**Phase 7: Polish (T027-T030)**
- Verified .env.example files complete
- Updated README.md with Phase 3 architecture, MCP tools table, new endpoints, new env vars
- Frontend build PASS, Python syntax PASS, imports PASS

**Key fix**: Renamed `agents/` → `agent/` and `mcp/` → `mcp_tools/` to avoid shadowing the `openai-agents` and `mcp` Python packages.

## Outcome

- Impact: Complete Phase 3 AI Chatbot implementation — 30/30 tasks complete
- Tests: Frontend build PASS, Python syntax PASS (all 7 files), Module imports PASS
- Files: 17 files created/modified (8 new, 9 extended)
- Next prompts: Test the application end-to-end (start backend, start frontend, test chat flow), then /sp.git.commit_pr
- Reflection: Directory naming collision (agents/ shadowing openai-agents, mcp/ shadowing mcp package) was caught during import testing and fixed by renaming to agent/ and mcp_tools/. The OpenAI Agents SDK uses `@function_tool` decorator which integrates cleanly — MCP tools are function tools that wrap REST API calls. Stateless architecture works well: each chat request loads history from DB, runs agent, persists result.

## Evaluation notes (flywheel)

- Failure modes observed: Python package name collision (local `agents/` and `mcp/` directories shadowed pip packages `openai-agents` and `mcp`). Fixed by renaming directories.
- Graders run and results (PASS/FAIL): Frontend build PASS; Python syntax check (ast.parse) PASS for all 7 files; Module import test PASS (agents SDK, mcp_tools, agent modules); Checklist (requirements.md) 16/16 PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run full end-to-end test with OPENAI_API_KEY configured to verify agent actually processes natural language and calls tools correctly
