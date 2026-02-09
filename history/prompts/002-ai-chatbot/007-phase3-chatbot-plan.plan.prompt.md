---
id: 007
title: Phase 3 Chatbot Implementation Plan
stage: plan
date: 2026-02-08
surface: agent
model: claude-opus-4-6
feature: 002-ai-chatbot
branch: 002-ai-chatbot
user: ALIjamali
command: /sp.plan
labels: ["plan", "phase3", "chatbot", "ai", "mcp", "agents-sdk", "architecture"]
links:
  spec: specs/002-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-ai-chatbot/plan.md
  - specs/002-ai-chatbot/research.md
  - specs/002-ai-chatbot/data-model.md
  - specs/002-ai-chatbot/contracts/api.md
  - specs/002-ai-chatbot/quickstart.md
  - CLAUDE.md
tests:
  - none
---

## Prompt

/sp.plan

User triggered planning with generic instructions (copy-paste of workflow commands). Agent used the extensive technical details from the prior /sp.specify input to generate the implementation plan.

## Response snapshot

Created complete Phase 3 implementation plan artifacts:

1. **plan.md** — Technical context (OpenAI Agents SDK, MCP SDK, ChatKit, FastAPI, Neon), constitution check (11 gates ALL PASS), project structure (new files only — additive to Phase 2), 6 architecture decisions (AD-1 through AD-6), component responsibility matrix (8 components), 5 development phases (3A-3E), risk analysis (5 risks), complexity tracking.

2. **research.md** — 6 research topics resolved: R-1 OpenAI Agents SDK + FastAPI integration, R-2 Official MCP SDK tool definitions, R-3 ChatKit frontend integration, R-4 stateless conversation architecture, R-5 MCP→REST API communication pattern, R-6 conversation database schema design.

3. **data-model.md** — 2 new entities (Conversation, Message) with field-level detail, constraints, relationships, ER diagram including Phase 2 entities, data access patterns, indexes.

4. **contracts/api.md** — 3 new API endpoints (POST chat, GET conversations, GET messages), 5 MCP tool specifications (add_task, list_tasks, complete_task, delete_task, update_task) with parameters and return values, 3 new error codes.

5. **quickstart.md** — Extended setup guide with new environment variables (OPENAI_API_KEY, BACKEND_URL, NEXT_PUBLIC_OPENAI_DOMAIN_KEY), test flow, curl examples, ChatKit domain allowlist instructions, common issues.

Also ran agent context update script (CLAUDE.md updated with Phase 3 tech stack).

## Outcome

- Impact: Complete Phase 3 implementation plan with all design artifacts ready for task generation
- Tests: none (planning documents)
- Files: plan.md, research.md, data-model.md, contracts/api.md, quickstart.md, CLAUDE.md
- Next prompts: /sp.tasks for 002-ai-chatbot to generate implementation tasks
- Reflection: User's extensive /sp.specify input contained all technical details needed — MCP tool schemas, API contracts, database schema, file structures. This made planning fast and comprehensive. The key architectural constraint is MCP tools calling Phase 2 REST API (not direct DB) per constitution.

## Evaluation notes (flywheel)

- Failure modes observed: User input was generic workflow instructions (copy-paste) but agent correctly used prior /sp.specify technical details instead
- Graders run and results (PASS/FAIL): Constitution check — all 11 gates PASS; all 6 research topics resolved; data model consistent with spec entities
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Generate tasks and implement Phase 3A (database schema extension) first to validate the foundation
