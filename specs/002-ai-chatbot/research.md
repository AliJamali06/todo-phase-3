# Research: AI-Powered Chatbot Interface

**Branch**: `002-ai-chatbot` | **Date**: 2026-02-08

## Research Topics

### R-1: OpenAI Agents SDK Integration with FastAPI

**Decision**: Use OpenAI Agents SDK to create a todo management agent that receives messages and invokes MCP tools. The agent runs synchronously within a FastAPI endpoint handler.

**Rationale**: The OpenAI Agents SDK provides a high-level abstraction for creating agents with tool-calling capabilities. It handles the conversation loop (user message → agent reasoning → tool call → response) natively. Running it within FastAPI allows direct integration with the existing backend.

**Pattern**:
1. Define agent with system prompt and tool definitions
2. On each chat request, load conversation history from DB
3. Build messages array (history + new user message)
4. Run agent with messages and tools
5. Agent decides which tool(s) to call based on user intent
6. Extract agent response and tool call results
7. Persist user message and agent response to DB
8. Return response to client

**Key considerations**:
- Agent is stateless — created fresh per request or reused with new messages
- System prompt instructs the agent on its role, capabilities, and response format
- Tool descriptions are critical for correct tool selection
- Use `openai` Python package (Agents SDK is part of the OpenAI Python SDK)

**Alternatives considered**:
- LangChain: More ecosystem tools but adds significant dependency complexity
- CrewAI: Multi-agent framework — overkill for single-agent chat
- Custom tool calling: Direct OpenAI API function calling — lower-level but more control

### R-2: Official MCP SDK for Python Tool Definitions

**Decision**: Use the Official MCP Python SDK (`mcp` package) to define tool schemas and expose them to the agent. Tools are registered as MCP tools with typed parameters and return values.

**Rationale**: The MCP SDK provides a standardized way to define tools that can be consumed by any MCP-compatible agent. The hackathon scoring awards +200 points for using subagents/skills with MCP.

**Key practices**:
- Define each tool with `@mcp.tool()` decorator (or equivalent SDK pattern)
- Tools accept typed parameters (Pydantic models)
- Tools return structured results (success/error)
- Each tool calls the Phase 2 REST API internally using `httpx` or `requests`
- Tools are stateless — each invocation is independent

**Tool definitions** (5 tools):
1. `add_task(user_id, title, description?)` → creates task via POST
2. `list_tasks(user_id, status?)` → retrieves tasks via GET
3. `complete_task(user_id, task_id)` → toggles completion via PATCH
4. `delete_task(user_id, task_id)` → removes task via DELETE
5. `update_task(user_id, task_id, title?, description?)` → modifies task via PUT

### R-3: OpenAI ChatKit Frontend Integration

**Decision**: Use OpenAI ChatKit React component for the chat UI at `/chat`. ChatKit provides a complete chat interface with message bubbles, input field, send button, and scroll handling.

**Rationale**: ChatKit is the specified frontend technology. It provides a professional chat UI with minimal code, handling message rendering, typing indicators, and responsive layout.

**Key considerations**:
- ChatKit requires domain allowlist configuration on OpenAI Platform
- Steps: Deploy frontend → get URL → add to OpenAI allowlist → get domain key → set env var
- For local development, ChatKit may work without allowlist on localhost
- ChatKit connects to a backend endpoint for sending/receiving messages
- Messages are rendered in chat bubble format (user on right, assistant on left)

**Integration pattern**:
- ChatKit component receives a `sendMessage` handler
- Handler calls backend POST `/api/{user_id}/chat`
- Response is displayed in the chat UI
- History is loaded on page mount via GET endpoint

**Alternatives considered**:
- Custom React chat UI: Full control but significant effort for chat bubble rendering, scroll management, loading states
- Vercel AI SDK `useChat`: Good alternative but ChatKit is the specified technology

### R-4: Stateless Conversation Architecture

**Decision**: Store all conversation state in the database. Each request loads history, processes the message, and saves results. No in-memory state on the server.

**Rationale**: Constitution mandates stateless chat endpoint. This enables horizontal scaling — any server instance can handle any request. Server restarts don't lose data.

**Flow per request**:
1. Receive `POST /api/{user_id}/chat` with `{ message, conversation_id? }`
2. If no `conversation_id`: create new conversation in DB, return its ID
3. If `conversation_id`: verify it belongs to authenticated user
4. Fetch all messages for this conversation from DB (ordered by created_at)
5. Append new user message to DB
6. Build messages array for agent: system prompt + history + new message
7. Run agent → get response (may include tool calls)
8. Save assistant response to DB
9. Return `{ conversation_id, response, tool_calls }`

**Performance note**: For hackathon scale, loading full conversation history per request is acceptable. For production, a sliding window or pagination would be needed.

### R-5: MCP Tools → Phase 2 REST API Communication

**Decision**: MCP tools call Phase 2 REST API endpoints via HTTP using `httpx` (async HTTP client). Tools pass the user's auth token to maintain authentication.

**Rationale**: Constitution mandates that MCP tools must NOT access the database directly. They must call the Phase 2 REST API, which handles validation, auth, and business logic.

**Communication pattern**:
```
User Chat Message
  → Chat Endpoint (FastAPI)
    → OpenAI Agent (Agents SDK)
      → MCP Tool (e.g., add_task)
        → HTTP POST to /api/{user_id}/tasks (Phase 2 API)
        ← Phase 2 API response (envelope format)
      ← Tool result
    ← Agent response
  ← Chat response to client
```

**Key considerations**:
- MCP tools need the user's auth token (JWT cookie) to call Phase 2 API
- Pass the token through the tool context or as a parameter
- For local development, backend calls itself at `http://localhost:8000`
- Use the `BACKEND_URL` env var for the base URL
- Handle Phase 2 API errors gracefully in tool responses

### R-6: Conversation Database Schema Design

**Decision**: Two new tables — `conversations` and `messages` — added to the existing Neon PostgreSQL database via SQLModel `create_all`.

**Schema**:
- `conversations`: id (SERIAL PK), user_id (FK→users ON DELETE CASCADE), created_at (TIMESTAMP), updated_at (TIMESTAMP)
- `messages`: id (SERIAL PK), conversation_id (FK→conversations ON DELETE CASCADE), role (VARCHAR: 'user' or 'assistant'), content (TEXT NOT NULL), created_at (TIMESTAMP)

**Key considerations**:
- One conversation per user (enforced at application level, not DB constraint)
- Messages ordered by `created_at ASC` within a conversation
- Index on `conversation_id` for fast message retrieval
- Index on `user_id` for fast conversation lookup
- CASCADE delete: deleting a user removes their conversations and messages
- `updated_at` on conversations tracks last activity

## Summary

All 6 research topics resolved. No NEEDS CLARIFICATION items remain. Proceeding to Phase 1 design artifacts.
