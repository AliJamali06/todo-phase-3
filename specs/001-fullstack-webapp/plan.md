# Implementation Plan: Phase 2 Full-Stack Web Application

**Branch**: `001-fullstack-webapp` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fullstack-webapp/spec.md`

## Summary

Transform the Phase 1 CLI todo app into a multi-user
full-stack web application. The backend is a Python FastAPI
service with SQLModel ORM connected to Neon PostgreSQL. The
frontend is a Next.js 16 App Router application styled with
Tailwind CSS. Authentication uses Better Auth with JWT
tokens stored in httpOnly cookies. The system follows a
monorepo structure with `/frontend` and `/backend`
directories.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, SQLModel, Better Auth, Next.js 16, Tailwind CSS
**Storage**: Neon Serverless PostgreSQL
**Testing**: Manual testing via curl (backend), browser (frontend)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge — last 2 versions)
**Project Type**: Web application (frontend + backend monorepo)
**Performance Goals**: API response < 200ms, frontend load < 3s
**Constraints**: < 2s user-perceived latency for task operations
**Scale/Scope**: Hackathon demo scale (~10 concurrent users, ~100 tasks per user)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | spec.md complete with 14 FRs, 7 SCs, 4 user stories |
| II. Reusable Intelligence | PASS | Agent skills/subagents defined in `.claude/skills/` and `.claude/agents/` |
| III. Progressive Complexity | PASS | Phase 2 extends Phase 1 concepts; no breaking changes |
| IV. Production-Grade Quality | PASS | Security-first (JWT, user isolation), error handling, responsive UI |
| Phase 2: Monorepo Structure | PASS | `/frontend` + `/backend` in single repository |
| Phase 2: API-First Design | PASS | RESTful endpoints with Pydantic validation |
| Phase 2: Stateless Services | PASS | JWT-based auth, no server-side sessions |
| Phase 2: Database-Backed | PASS | Neon PostgreSQL with SQLModel ORM |
| Phase 2: Security Standards | PASS | JWT auth, user isolation, env vars for secrets, ORM-based queries |
| Anti-Pattern: No Hardcoded Secrets | PASS | `.env` files + `.env.example` templates |
| Anti-Pattern: No Silent Failures | PASS | Structured error responses, user-friendly messages |

All gates PASS. Proceeding to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/001-fullstack-webapp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           # REST API contract
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── main.py              # FastAPI app, CORS, route registration
├── config.py            # Environment variables (DATABASE_URL, etc.)
├── db.py                # Database connection, session management
├── models.py            # SQLModel models (User, Task)
├── auth.py              # JWT middleware, Better Auth config
├── schemas.py           # Pydantic request/response schemas
├── dependencies.py      # FastAPI dependencies (get_current_user)
├── routes/
│   ├── __init__.py
│   ├── auth.py          # Signup, signin endpoints
│   └── tasks.py         # Task CRUD endpoints
└── requirements.txt     # Python dependencies

frontend/
├── app/
│   ├── layout.tsx       # Root layout with providers
│   ├── page.tsx         # Landing page
│   ├── (auth)/
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   └── dashboard/
│       └── page.tsx     # Main todo UI
├── components/
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   ├── AddTaskForm.tsx
│   ├── EditTaskModal.tsx
│   └── Header.tsx
├── lib/
│   ├── api.ts           # API client with JWT
│   ├── auth.ts          # Better Auth client config
│   └── types.ts         # TypeScript types
├── middleware.ts        # Route protection
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

**Structure Decision**: Web application (Option 2) selected.
Monorepo with `/frontend` and `/backend` at repository root.
This aligns with constitution Phase 2 standards (monorepo
structure) and the hackathon requirement for a single
repository.

## Architecture Decisions

### AD-1: Monorepo Structure
**Decision**: Monorepo with `/frontend` and `/backend`
**Rationale**: Single source of truth, easier for Claude Code
workflow, hackathon judges prefer single submission, enables
clean evolution to Phase 3-5.
**Alternative rejected**: Separate repos — would require
workspace switching in Claude Code and complicate submission.

### AD-2: JWT Storage in httpOnly Cookies
**Decision**: Store JWT in httpOnly cookies (not localStorage)
**Rationale**: Better Auth supports cookies by default; httpOnly
cookies are immune to XSS attacks; production-ready security.
**Alternative rejected**: localStorage — vulnerable to XSS;
sessionStorage — poor UX (logout on tab close).

### AD-3: API Response Envelope Format
**Decision**: Envelope format `{ success, data, error }`
**Rationale**: Consistent client-side error handling, easier
debugging, scales to Phase 3 chatbot responses.
**Alternative rejected**: Simple format — inconsistent error
handling; Mixed — confusing pattern.

### AD-4: SQLModel Auto-Create for Migrations
**Decision**: Use `SQLModel.metadata.create_all()` on startup
**Rationale**: Hackathon speed priority; schema unlikely to
change mid-development; sufficient for demo. Switch to Alembic
for Phase 3+ if schema becomes complex.
**Alternative rejected**: Alembic — overkill for hackathon
scope; Manual SQL — error-prone.

### AD-5: React useState for State Management
**Decision**: React `useState` only (no external state library)
**Rationale**: App has one main page (dashboard); no complex
state sharing needed; fastest to implement.
**Alternative rejected**: Context API — unnecessary boilerplate;
Zustand — extra dependency for simple use case.
**Re-evaluate**: For Phase 3 if chatbot state becomes complex.

### AD-6: Toast + Inline Error Handling
**Decision**: Toast notifications for async operations + inline
errors for form validation
**Rationale**: Toasts for non-blocking feedback (success/error
on API calls); inline errors for contextual form validation;
error boundaries as fallback for React errors.

## Component Responsibility Matrix

| Component | Responsibility | Dependencies |
|-----------|---------------|-------------|
| Frontend: Signin/Signup | Auth UI, form validation | Better Auth client |
| Frontend: Dashboard | Task list, CRUD controls | API client |
| Frontend: API Client | HTTP requests + cookie-based auth | fetch API |
| Backend: Auth Routes | User signup/signin, JWT issuance | Better Auth, DB |
| Backend: Task Routes | Task CRUD operations | DB, Auth middleware |
| Backend: Auth Middleware | JWT verification, user extraction | Better Auth |
| Backend: Models | SQLModel entities (User, Task) | SQLModel, PostgreSQL |
| Database: Neon | Data persistence | PostgreSQL engine |

## Development Phases

### Phase 2A: Backend Foundation (Days 1-2)
- Database schema design and SQLModel models
- FastAPI app setup with CORS
- Better Auth integration (signup, signin)
- JWT middleware for protected routes
- Health check endpoint

### Phase 2B: Task API (Days 3-4)
- All 6 task CRUD endpoints
- User-task isolation logic (user_id filtering)
- Pydantic request/response schemas
- Error handling with envelope format
- Input validation (title max 200 chars, required fields)

### Phase 2C: Frontend Foundation (Days 5-6)
- Next.js app with App Router structure
- Better Auth client setup
- API client with cookie-based auth
- Signin and signup pages
- Route protection middleware

### Phase 2D: Task UI (Days 7-8)
- Dashboard layout with TaskList
- AddTaskForm component
- TaskItem with edit/complete/delete
- EditTaskModal component
- Tailwind CSS responsive styling
- Loading states, error messages, success toasts

### Phase 2E: Integration & Polish (Days 9-10)
- End-to-end testing (signup through task CRUD)
- Multi-user isolation verification
- Responsive design refinement (320px-1920px)
- Edge case handling

### Phase 2F: Deployment (Days 11-12)
- Frontend deployed to Vercel
- Backend deployed to Render/Railway
- Environment variables configured
- Production testing
- README updated, demo video recorded

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Better Auth + FastAPI integration | Medium | High | Research docs early; fallback to custom JWT |
| CORS errors in production | High | Medium | Configure early; test with deployed URLs |
| Neon connection timeout | Low | Medium | Connection pooling; retry logic |
| JWT token expiration UX | Medium | Low | 7-day expiry; redirect to login on 401 |
| Vercel env var misconfiguration | Medium | Medium | `.env.example` templates; preview deploy testing |

## Complexity Tracking

> No constitution violations requiring justification.

| Decision | Complexity | Justification |
|----------|-----------|---------------|
| Two-language monorepo (Python + TypeScript) | Medium | Required by constitution (Next.js frontend + FastAPI backend) |
| httpOnly cookies for JWT | Low | Better Auth default; simpler than manual localStorage |
| Auto-create migrations | Low | Hackathon-appropriate; upgrade path to Alembic exists |
