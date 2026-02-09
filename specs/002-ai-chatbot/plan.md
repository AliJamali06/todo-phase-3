# Implementation Plan: AI-Powered Chatbot Interface

**Branch**: `002-ai-chatbot` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-ai-chatbot/spec.md`

## Summary

Extend the Phase 2 full-stack web application with a conversational AI interface for task management. The backend adds a chat endpoint powered by OpenAI Agents SDK with MCP (Model Context Protocol) tools that wrap the existing Phase 2 REST API. The frontend adds a `/chat` route using OpenAI ChatKit. Conversation state is persisted in Neon PostgreSQL (new `conversations` and `messages` tables). All changes are additive — no Phase 2 code is modified.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: OpenAI Agents SDK, Official MCP SDK (Python), OpenAI ChatKit (frontend), FastAPI, SQLModel
**Storage**: Neon Serverless PostgreSQL (same database as Phase 2)
**Testing**: Manual testing via browser and curl
**Target Platform**: Web browsers (same as Phase 2)
**Project Type**: Web application (extend existing monorepo)
**Performance Goals**: Chat response < 3 seconds (including AI inference)
**Constraints**: Stateless server — no in-memory conversation state; MCP tools call Phase 2 REST API (no direct DB access for tasks)
**Scale/Scope**: Hackathon demo scale (~10 concurrent users)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | spec.md complete with 16 FRs, 7 SCs, 4 user stories |
| II. Reusable Intelligence | PASS | MCP tools are reusable; agent skills documented |
| III. Progressive Complexity | PASS | Phase 3 extends Phase 2; no breaking changes; additive only |
| IV. Production-Grade Quality | PASS | Error handling, auth enforcement, data isolation, stateless design |
| Phase 3: Stateless Chat Endpoint | PASS | All state in database; no in-memory conversation storage |
| Phase 3: MCP-Based Tools | PASS | 5 tools (add, list, complete, delete, update) via MCP SDK |
| Phase 3: Database-Backed Conversations | PASS | conversations + messages tables in Neon DB |
| Phase 3: API Wrapper Pattern | PASS | MCP tools call Phase 2 REST endpoints, not direct DB |
| Anti-Pattern: No Breaking Changes | PASS | Phase 2 endpoints and UI untouched |
| Anti-Pattern: No Direct DB Access | PASS | MCP tools use HTTP calls to Phase 2 API |
| Anti-Pattern: No Silent Failures | PASS | Structured error responses; user-friendly messages |

All gates PASS. Proceeding to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/002-ai-chatbot/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           # Chat API contract
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/sp.tasks)
```

### Source Code (repository root — new/modified files only)

```text
backend/
├── main.py              # EXTEND (register chat router)
├── models.py            # EXTEND (add Conversation, Message models)
├── mcp/                 # NEW
│   ├── __init__.py
│   ├── server.py        # MCP server setup with Official SDK
│   └── tools.py         # 5 MCP tool implementations
├── agents/              # NEW
│   ├── __init__.py
│   └── todo_agent.py    # OpenAI Agent configuration + system prompt
├── routes/
│   ├── chat.py          # NEW — POST /api/{user_id}/chat
│   └── conversations.py # NEW — GET conversations/messages
└── requirements.txt     # EXTEND (add openai, mcp)

frontend/
├── app/
│   └── chat/            # NEW
│       └── page.tsx     # ChatKit integration page
├── lib/
│   └── chatApi.ts       # NEW — chat endpoint client
└── middleware.ts         # EXTEND (protect /chat route)
```

**Structure Decision**: Extend existing Phase 2 monorepo. New directories (`backend/mcp/`, `backend/agents/`, `frontend/app/chat/`) and new files only. No Phase 2 files deleted or renamed.

## Architecture Decisions

### AD-1: MCP Tools Wrap Phase 2 REST API (Not Direct DB)

**Decision**: MCP tools call the existing Phase 2 REST API endpoints via HTTP.
**Rationale**: Constitution mandates "no direct DB access" for Phase 3+ services. Using the REST API ensures data validation, auth checks, and business logic are applied consistently. Also makes MCP tools portable — they work against any REST-compatible backend.
**Alternative rejected**: Direct SQLModel queries from tools — faster but violates constitution and bypasses validation.

### AD-2: OpenAI Agents SDK for Agent Orchestration

**Decision**: Use OpenAI Agents SDK (not LangChain, CrewAI, or custom).
**Rationale**: Constitution specifies OpenAI Agents SDK. It provides built-in tool calling, conversation management, and works natively with OpenAI models.
**Alternative rejected**: LangChain — more ecosystem but not required stack; CrewAI — multi-agent overkill for single-agent chat.

### AD-3: Official MCP SDK for Tool Interface

**Decision**: Use the Official MCP Python SDK to expose tools.
**Rationale**: Constitution specifies Official MCP SDK. Standardized tool protocol enables future extensibility and interoperability.
**Alternative rejected**: Custom tool functions without MCP — simpler but doesn't meet hackathon scoring requirements (+200 for subagents/skills).

### AD-4: Single Conversation Per User

**Decision**: One active conversation per user, auto-created on first chat.
**Rationale**: Simplest model for hackathon scope. Spec explicitly states single thread. Multi-conversation support is out of scope.
**Alternative rejected**: Multiple threads — unnecessary complexity for demo.

### AD-5: OpenAI ChatKit for Frontend Chat UI

**Decision**: Use OpenAI ChatKit component (not custom chat UI).
**Rationale**: Constitution specifies ChatKit. Provides polished chat UI with message bubbles, typing indicators, and scroll handling out of the box. Requires domain allowlist configuration on OpenAI Platform.
**Alternative rejected**: Custom React chat component — more control but significant effort for a solved UI problem.

### AD-6: Conversation History Passed to Agent Per Request

**Decision**: On each chat request, load full conversation history from DB and pass as messages array to the agent.
**Rationale**: Stateless server design — no in-memory state. Agent receives full context on every request. For hackathon scale, conversation lengths are short enough that this is performant.
**Alternative rejected**: Sliding window of recent messages — adds complexity; full history is sufficient for demo scale.

## Component Responsibility Matrix

| Component | Responsibility | Dependencies |
|-----------|---------------|-------------|
| Frontend: Chat Page | ChatKit UI at `/chat`, send/receive messages | ChatKit, chat API client |
| Frontend: Chat API Client | HTTP requests to chat endpoint | fetch API |
| Backend: Chat Route | Accept messages, orchestrate agent, persist messages | Agent, DB |
| Backend: Todo Agent | OpenAI Agent with system prompt and MCP tools | OpenAI Agents SDK, MCP Server |
| Backend: MCP Server | Register and expose 5 task tools | Official MCP SDK |
| Backend: MCP Tools | Execute task operations via Phase 2 REST API | HTTP client, Phase 2 API |
| Backend: Conversation Models | SQLModel entities for conversations/messages | SQLModel, PostgreSQL |
| Database: Neon | Persist conversations and messages | PostgreSQL engine |

## Development Phases

### Phase 3A: Database Schema Extension (Day 1)

- Add Conversation and Message SQLModel models
- Ensure create_all picks up new tables
- Test conversation/message CRUD independently

### Phase 3B: MCP Tools + Agent (Days 2-3)

- Implement 5 MCP tools (add_task, list_tasks, complete_task, delete_task, update_task)
- Configure OpenAI Agent with system prompt and tool definitions
- Test agent + tools independently via Python script

### Phase 3C: Chat API Endpoint (Day 4)

- Create POST `/api/{user_id}/chat` endpoint
- Implement stateless conversation flow (load history, run agent, persist messages)
- Create GET endpoint for conversation history
- Test via curl

### Phase 3D: Frontend Chat UI (Days 5-6)

- Create `/chat` page with OpenAI ChatKit
- Create chat API client
- Protect `/chat` route in middleware
- Add navigation between dashboard and chat
- Test end-to-end flow

### Phase 3E: Integration & Polish (Day 7)

- Verify dual UI consistency (chat ↔ dashboard)
- Test edge cases and error handling
- Configure ChatKit domain allowlist (production)
- Update environment variables and documentation

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OpenAI Agents SDK + MCP integration complexity | Medium | High | Follow official examples; test tools independently first |
| ChatKit domain allowlist blocking production | High | High | Deploy frontend early; configure allowlist immediately |
| Agent selecting wrong tool for ambiguous commands | Medium | Medium | Clear tool descriptions; test with varied phrasings |
| Latency from MCP→REST API chain | Low | Medium | Local API calls are fast; optimize if needed |
| Phase 2 regression | Low | High | Only additive changes; no existing files modified (except extending models.py and main.py) |

## Complexity Tracking

> No constitution violations requiring justification.

| Decision | Complexity | Justification |
|----------|-----------|---------------|
| MCP→REST API wrapper | Low | Required by constitution; HTTP calls are straightforward |
| OpenAI Agents SDK | Medium | New dependency; follow official SDK patterns |
| ChatKit integration | Medium | Requires domain allowlist setup on OpenAI Platform |
| Conversation history in DB | Low | Standard SQL; SQLModel handles it |
