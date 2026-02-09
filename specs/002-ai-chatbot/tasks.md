# Tasks: AI-Powered Chatbot Interface

**Input**: Design documents from `/specs/002-ai-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Not explicitly requested in spec. Manual testing only (per quickstart.md test scenarios).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` and `frontend/` at repository root

---

## Phase 1: Setup (New Dependencies & Directories)

**Purpose**: Add Phase 3 dependencies and create new directory structure. No Phase 2 files modified.

- [x] T001 Create backend directory structure: `backend/mcp/`, `backend/agents/`, create `backend/mcp/__init__.py` and `backend/agents/__init__.py`
- [x] T002 [P] Update `backend/requirements.txt` — append new dependencies: `openai`, `mcp`, `httpx` (keep all existing Phase 2 dependencies)
- [x] T003 [P] Update `backend/.env.example` — append new variables: `OPENAI_API_KEY=sk-your-openai-api-key`, `BACKEND_URL=http://localhost:8000`
- [x] T004 [P] Update `frontend/.env.example` — append new variable: `NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-your-domain-key`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database models and config extensions that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Extend `backend/models.py` — add Conversation model (`table=True`: id SERIAL PK, user_id VARCHAR FK→users ON DELETE CASCADE NOT NULL, created_at TIMESTAMP DEFAULT NOW, updated_at TIMESTAMP DEFAULT NOW) with index on user_id. Add Message model (`table=True`: id SERIAL PK, conversation_id INTEGER FK→conversations ON DELETE CASCADE NOT NULL, role VARCHAR(10) NOT NULL CHECK IN ('user', 'assistant'), content TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW) with index on conversation_id. Maintain existing User and Task models unchanged
- [x] T006 Extend `backend/config.py` — add loading of new environment variables: `OPENAI_API_KEY` (required), `BACKEND_URL` (default: `http://localhost:8000`)
- [x] T007 Verify `backend/main.py` lifespan `create_db_and_tables()` picks up new Conversation and Message models automatically via SQLModel metadata (no code change needed if models are imported — verify import chain)

**Checkpoint**: Backend runs, /health returns 200, `conversations` and `messages` tables created in Neon DB alongside existing Phase 2 tables.

---

## Phase 3: User Story 1 — Chat-Based Task Management (Priority: P1) 🎯 MVP

**Goal**: A logged-in user navigates to the chat interface and manages tasks using natural language. The system understands varied phrasings for each operation (add, list, complete, delete, update), executes the requested task operation via MCP tools calling Phase 2 REST API, and confirms actions with clear, human-readable feedback.

**Independent Test**: Log in, navigate to `/chat`, type "Add buy groceries to my list", see confirmation. Type "Show my tasks", see the new task listed. Type "Mark it as done", see confirmation. Type "Delete the groceries task", see confirmation. Verify all changes reflected.

### Backend: MCP Tools

- [x] T008 [US1] Create `backend/mcp/tools.py` — implement 5 MCP tool functions using httpx async HTTP client to call Phase 2 REST API:
  1. `add_task(user_id, title, description?)` → POST `/api/{user_id}/tasks`
  2. `list_tasks(user_id, status?)` → GET `/api/{user_id}/tasks` (filter by status: "all", "pending", "completed")
  3. `complete_task(user_id, task_id)` → PATCH `/api/{user_id}/tasks/{task_id}/complete`
  4. `delete_task(user_id, task_id)` → DELETE `/api/{user_id}/tasks/{task_id}`
  5. `update_task(user_id, task_id, title?, description?)` → PUT `/api/{user_id}/tasks/{task_id}`
  Each tool: reads `BACKEND_URL` from config, passes user auth token via cookie header, returns structured result `{task_id, status, title}` or `{tasks: [...]}`, handles Phase 2 API errors gracefully

- [x] T009 [US1] Create `backend/mcp/server.py` — MCP server setup using Official MCP Python SDK. Register all 5 tools from `tools.py` with typed parameters (Pydantic models for input validation), clear tool descriptions for agent tool selection, and structured return types

### Backend: Agent

- [x] T010 [US1] Create `backend/agents/todo_agent.py` — OpenAI Agent configuration using Agents SDK:
  - System prompt instructing the agent on its role as a task management assistant
  - System prompt includes: available operations, response format guidelines, ambiguity handling instructions, polite redirection for non-task messages
  - Register MCP tools from `backend/mcp/server.py`
  - Agent function that accepts messages array and user context, runs the agent, returns response text and tool call results

### Backend: Chat Endpoint

- [x] T011 [US1] Create `backend/routes/chat.py` — POST `/api/{user_id}/chat` endpoint:
  - Require authentication (reuse `get_current_user` from `backend/auth.py`)
  - Verify user_id matches authenticated user (403 FORBIDDEN if mismatch)
  - Accept `{message: string, conversation_id?: int}`
  - If no conversation_id: create new Conversation in DB, assign its ID
  - If conversation_id provided: verify it belongs to authenticated user (404 CONVERSATION_NOT_FOUND)
  - Validate message not empty (400 MESSAGE_EMPTY)
  - Load all messages for conversation from DB (ORDER BY created_at ASC)
  - Save user message to DB
  - Build messages array: system prompt + history + new user message
  - Run todo agent with messages and user context (pass auth token for MCP tools)
  - Save assistant response to DB
  - Update conversation `updated_at`
  - Return envelope: `{success: true, data: {conversation_id, response, tool_calls}}`
  - Catch agent errors → 500 CHAT_ERROR with user-friendly message

- [x] T012 [US1] Register chat router in `backend/main.py` — import and include `backend/routes/chat.py` router (additive only, no changes to existing routes)

### Frontend: Chat API Client

- [x] T013 [P] [US1] Create `frontend/lib/chatApi.ts` — chat endpoint client functions:
  - `sendMessage(userId: string, message: string, conversationId?: number)` → POST `/api/{userId}/chat` with `credentials: 'include'`
  - `getConversations(userId: string)` → GET `/api/{userId}/conversations`
  - `getMessages(userId: string, conversationId: number)` → GET `/api/{userId}/conversations/{conversationId}/messages`
  - Use same `ApiResponse` envelope types from `frontend/lib/types.ts`
  - Add new types: `ChatResponse`, `ConversationResponse`, `MessagesResponse`

### Frontend: Chat UI

- [x] T014 [US1] Create `frontend/app/chat/page.tsx` — chat page using OpenAI ChatKit:
  - Client component with 'use client'
  - Load conversation history on mount (if exists) via `getConversations` + `getMessages`
  - Display messages in ChatKit message bubble format (user right, assistant left)
  - Send message handler: call `sendMessage`, append response to display
  - Show initial greeting message when no prior conversation: "Hi! I can help manage your tasks. Try 'Show my tasks' or 'Add a task'."
  - Loading state while waiting for AI response
  - Error display for failed messages
  - Responsive layout (works on mobile and desktop)

- [x] T015 [US1] Update `frontend/middleware.ts` — extend protected routes to include `/chat` alongside `/dashboard` (redirect to `/signin` if no auth cookie)

- [x] T016 [US1] Update `frontend/components/Header.tsx` — add navigation link to `/chat` page (e.g., "Chat" link next to dashboard context). Add navigation link to `/dashboard` from chat context. Both pages should be easily navigable

**Checkpoint**: Full flow works: login → navigate to /chat → "Add buy groceries" → confirmation → "Show my tasks" → see task → "Mark it as done" → confirmed → "Delete the groceries task" → confirmed. All via natural language through MCP tools calling Phase 2 REST API.

---

## Phase 4: User Story 2 — Conversation Persistence (Priority: P1)

**Goal**: A user's chat history is preserved across sessions. When they return to the chat interface, previous messages are visible and the assistant maintains context from earlier interactions.

**Independent Test**: Send a few chat messages, close the browser, reopen the chat page — all previous messages displayed in order.

### Backend: Conversation History Endpoints

- [x] T017 [US2] Create `backend/routes/conversations.py` — GET `/api/{user_id}/conversations` endpoint:
  - Require authentication, verify user_id matches authenticated user
  - Query conversation WHERE user_id = authenticated user
  - Return envelope with conversation object (or null if none exists)
  - Single conversation per user (application-level enforcement)

- [x] T018 [US2] Add GET `/api/{user_id}/conversations/{conversation_id}/messages` endpoint to `backend/routes/conversations.py`:
  - Require authentication, verify user_id matches authenticated user
  - Verify conversation belongs to user (404 CONVERSATION_NOT_FOUND if not)
  - Query messages WHERE conversation_id = id, ORDER BY created_at ASC
  - Return envelope with messages array (id, conversation_id, role, content, created_at)

- [x] T019 [US2] Register conversations router in `backend/main.py` — import and include `backend/routes/conversations.py` router (additive only)

### Frontend: History Loading

- [x] T020 [US2] Update `frontend/app/chat/page.tsx` — enhance with full persistence:
  - On mount: call `getConversations` to check for existing conversation
  - If conversation exists: call `getMessages` to load all messages, display in chronological order
  - Store `conversationId` in component state, pass to subsequent `sendMessage` calls
  - New messages from `sendMessage` response appended to displayed history
  - Scroll to bottom on load and after new messages
  - Show loading spinner while fetching history
  - Handle case: server restart — history still loads from DB (stateless verification)

**Checkpoint**: Send messages → close browser → reopen /chat → all messages displayed. Server restart → history preserved.

---

## Phase 5: User Story 3 — Dual UI Consistency (Priority: P2)

**Goal**: Changes made through the chat interface are immediately visible in the traditional dashboard, and vice versa. Both interfaces operate on the same underlying data.

**Independent Test**: Create a task via chat, switch to `/dashboard`, verify it appears. Complete a task via dashboard, switch to `/chat`, ask "What have I completed?" — verify the completed task is listed.

- [x] T021 [US3] Verify MCP tools in `backend/mcp/tools.py` call the same Phase 2 REST API endpoints used by the dashboard — confirm add_task → POST `/api/{user_id}/tasks`, list_tasks → GET `/api/{user_id}/tasks`, complete_task → PATCH `/api/{user_id}/tasks/{task_id}/complete`, delete_task → DELETE `/api/{user_id}/tasks/{task_id}`, update_task → PUT `/api/{user_id}/tasks/{task_id}`. No separate data store. Add integration comments documenting this shared-data guarantee
- [x] T022 [US3] Verify `frontend/app/dashboard/page.tsx` refreshes task list on mount — ensure navigating from `/chat` to `/dashboard` (and vice versa) always shows current state by re-fetching data on page mount. No stale cache

**Checkpoint**: Create task via chat → see in dashboard. Complete task via dashboard → chat reports it completed. Delete via dashboard → chat confirms it's gone.

---

## Phase 6: User Story 4 — Graceful Error & Ambiguity Handling (Priority: P2)

**Goal**: The chat assistant handles errors, edge cases, ambiguous requests, and invalid input gracefully with helpful messages rather than cryptic errors or silence.

**Independent Test**: Try deleting a nonexistent task, adding a task exceeding character limits, asking to "delete the task" when multiple exist, and sending gibberish — the assistant responds helpfully in all cases.

- [x] T023 [US4] Enhance agent system prompt in `backend/agents/todo_agent.py` — add explicit instructions for:
  - Ambiguous requests: when user says "delete the task" with multiple tasks, list matching tasks and ask which one
  - Non-task messages: respond politely and redirect to task management capabilities
  - Empty task lists: respond with "You have no tasks yet" and suggest adding one
  - Character limit feedback: if task title exceeds 200 chars, inform the user of the constraint
  - Tool errors: communicate issues without exposing technical details (e.g., "I couldn't find that task" not "404 TASK_NOT_FOUND")

- [x] T024 [US4] Add error handling in `backend/mcp/tools.py` — each tool function should:
  - Catch HTTP errors from Phase 2 API (404, 403, 400, 500)
  - Return structured error messages suitable for the agent to relay to the user
  - Handle network errors (backend unavailable) gracefully
  - Never expose raw API error responses or stack traces

- [x] T025 [US4] Add empty message validation in `backend/routes/chat.py` — return 400 MESSAGE_EMPTY with envelope error if message is empty or whitespace-only

- [x] T026 [US4] Add error display in `frontend/app/chat/page.tsx` — show user-friendly error messages when:
  - Chat endpoint returns an error (display inline in chat as system message)
  - Network request fails (show retry suggestion)
  - Session expires (redirect to signin)

**Checkpoint**: Delete nonexistent task → helpful message. "Delete the task" with 3 tasks → clarification. Gibberish → polite redirection. Empty message → prompt to type. Server error → friendly message.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T027 Update `backend/.env.example` — verify all Phase 2 + Phase 3 variables documented with comments (DATABASE_URL, BETTER_AUTH_SECRET, FRONTEND_URL, OPENAI_API_KEY, BACKEND_URL)
- [x] T028 [P] Update `frontend/.env.example` — verify all Phase 2 + Phase 3 variables documented (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_OPENAI_DOMAIN_KEY)
- [x] T029 [P] Update `README.md` — add Phase 3 section: chat feature overview, new environment variables, chat API endpoints, MCP tools list, ChatKit domain allowlist setup instructions, architecture diagram showing MCP→REST API flow
- [x] T030 Run quickstart.md validation — execute all steps in `specs/002-ai-chatbot/quickstart.md`: verify backend starts, frontend starts, /chat page loads, chat flow works (add task, list tasks, complete task), conversation persists, dashboard reflects chat changes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — core chat functionality (MVP)
- **US2 (Phase 4)**: Depends on US1 (Phase 3) — conversation endpoints depend on chat endpoint creating conversations
- **US3 (Phase 5)**: Depends on US1 (Phase 3) — needs MCP tools working to verify shared data
- **US4 (Phase 6)**: Depends on US1 (Phase 3) — needs agent and tools working to add error handling
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — No dependencies on other stories. Delivers MVP.
- **US2 (P1)**: Depends on US1 — conversation history endpoints + frontend loading build on US1 chat infrastructure
- **US3 (P2)**: Depends on US1 — verification tasks require working MCP tools. Can run in parallel with US2 and US4
- **US4 (P2)**: Depends on US1 — error handling enhances existing agent/tools. Can run in parallel with US2 and US3

### Within Each User Story

- Backend before frontend (endpoints before UI that calls them)
- MCP tools before agent (agent depends on tool definitions)
- Agent before chat endpoint (endpoint orchestrates agent)
- Chat endpoint before chat UI (UI calls endpoint)
- Core implementation before integration/polish

### Parallel Opportunities

- **Phase 1**: T002, T003, T004 can all run in parallel (different files)
- **Phase 3 (US1)**: T013 (chatApi.ts) can run in parallel with T008-T012 (backend tasks — different codebases)
- **Phase 5 (US3)**: T021, T022 can run in parallel (backend vs frontend verification)
- **Phase 7**: T027, T028, T029 can run in parallel (different files)
- **Cross-story**: US3 and US4 can run in parallel after US1 completes

---

## Parallel Example: User Story 1

```bash
# Backend MCP tools, Agent, and Chat endpoint must be sequential:
T008 → T009 → T010 → T011 → T012

# Frontend chat client can be built in parallel with backend:
T013 (parallel with T008-T012)

# Frontend UI depends on both backend (T012) and client (T013):
T014 (after T012 and T013)

# Middleware and Header updates can be parallel with T014:
T015 (parallel with T014)
T016 (parallel with T014)
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T007)
3. Complete Phase 3: US1 — Chat-Based Task Management (T008-T016)
4. **STOP and VALIDATE**: Test full chat flow — add task, list tasks, complete, delete, update via natural language
5. Deploy if ready — this is a working MVP with AI chatbot

### Incremental Delivery

1. Setup + Foundational → Foundation ready (new tables, dependencies)
2. US1 → Test independently → Working chat with MCP tools (MVP!)
3. US2 → Test independently → Persistent conversation history
4. US3 + US4 (parallel) → Test independently → Data consistency + Error handling
5. Polish → Documentation, validation, deployment

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All Phase 3 changes are ADDITIVE — no Phase 2 files deleted or renamed
- Files EXTENDED (not replaced): `models.py`, `config.py`, `main.py`, `middleware.ts`, `Header.tsx`, `.env.example` files
- Files CREATED (new): `mcp_tools/tools.py`, `mcp_tools/server.py`, `agent/todo_agent.py`, `routes/chat.py`, `routes/conversations.py`, `lib/chatApi.ts`, `app/chat/page.tsx`
- MCP tools call Phase 2 REST API via HTTP — never direct DB access (constitution mandate)
- Stateless chat: all conversation state in DB, no in-memory state on server
- Manual testing only — no automated tests requested
- Stop at any checkpoint to validate story independently
- Commit after each phase completion
