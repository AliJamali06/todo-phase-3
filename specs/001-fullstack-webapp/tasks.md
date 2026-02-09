# Tasks: Phase 2 Full-Stack Web Application

**Input**: Design documents from `/specs/001-fullstack-webapp/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md

**Tests**: Not explicitly requested in spec. Manual testing only (per spec Testing Philosophy).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` and `frontend/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure

- [x] T001 Create backend directory structure: `backend/`, `backend/routes/`, `backend/routes/__init__.py`
- [x] T002 [P] Create `backend/requirements.txt` with dependencies: fastapi, uvicorn, sqlmodel, python-dotenv, pyjwt, passlib[bcrypt], python-multipart
- [x] T003 [P] Create `backend/.env.example` with placeholders: DATABASE_URL, BETTER_AUTH_SECRET, FRONTEND_URL
- [x] T004 [P] Initialize Next.js 16 app in `frontend/` with App Router, Tailwind CSS, TypeScript
- [x] T005 [P] Create `frontend/.env.example` with placeholders: NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
- [x] T006 [P] Create root `.gitignore` excluding `.env`, `node_modules/`, `__pycache__/`, `.venv/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

- [x] T007 Create `backend/config.py` — load environment variables (DATABASE_URL, BETTER_AUTH_SECRET, FRONTEND_URL) using python-dotenv
- [x] T008 Create `backend/db.py` — SQLModel engine with `create_engine(DATABASE_URL, pool_pre_ping=True)`, `get_session` dependency, and `create_db_and_tables()` function using `SQLModel.metadata.create_all`
- [x] T009 Create `backend/models.py` — SQLModel User model (`table=True`: id VARCHAR PK, email VARCHAR UNIQUE NOT NULL, name VARCHAR nullable, created_at TIMESTAMP) and Task model (`table=True`: id SERIAL PK, user_id FK→users ON DELETE CASCADE, title VARCHAR(200) NOT NULL, description TEXT nullable, completed BOOLEAN DEFAULT FALSE, created_at TIMESTAMP, updated_at TIMESTAMP). Add indexes on user_id and completed
- [x] T010 Create `backend/schemas.py` — Pydantic/SQLModel schemas: TaskCreate (title required max 200, description optional), TaskUpdate (title optional max 200, description optional), TaskResponse, UserResponse, ErrorResponse, EnvelopeResponse per contracts/api.md envelope format `{success, data, error}`
- [x] T011 Create `backend/main.py` — FastAPI app with CORS middleware (allow_origins from FRONTEND_URL, allow_credentials=True), lifespan event calling `create_db_and_tables()`, register auth and task routers, GET /health endpoint returning `{status, database}`
- [x] T012 [P] Create `frontend/lib/types.ts` — TypeScript types: User (id, email, name), Task (id, user_id, title, description, completed, created_at, updated_at), ApiResponse envelope (success, data, error), ApiError (code, message)

**Checkpoint**: Backend runs (`uvicorn main:app`), /health returns 200, database tables created. Frontend runs (`npm run dev`).

---

## Phase 3: User Story 1 — New User Signup & First Task (Priority: P1)

**Goal**: A new user can sign up, reach the dashboard, create their first task, and log out.

**Independent Test**: Visit app, sign up, reach dashboard, add task "Buy groceries", see it in list, log out.

### Backend: Auth

- [x] T013 Create `backend/auth.py` — JWT verification function: decode token from httpOnly cookie, extract user_id, raise HTTPException(401) if invalid/expired. Create `get_current_user` FastAPI dependency that returns user_id string
- [x] T014 Create `backend/routes/auth.py` — POST `/api/auth/signup` endpoint: accept email/password/name, hash password with passlib bcrypt, create User record in DB, issue JWT (7-day expiry) set as httpOnly cookie, return envelope with user data (201). Handle EMAIL_EXISTS (409), INVALID_EMAIL (400)
- [x] T015 Add POST `/api/auth/signin` endpoint to `backend/routes/auth.py` — verify email/password, issue JWT as httpOnly cookie, return envelope with user data (200). Handle INVALID_CREDENTIALS (401)
- [x] T016 Add POST `/api/auth/signout` endpoint to `backend/routes/auth.py` — clear auth cookie, return envelope with null data (200). Requires authentication

### Backend: Task Creation

- [x] T017 Create `backend/routes/tasks.py` — POST `/api/{user_id}/tasks` endpoint: validate user_id matches authenticated user (403 if mismatch), validate title required and max 200 chars, create Task in DB with user_id, return envelope with task data (201). Handle TITLE_REQUIRED (400), TITLE_TOO_LONG (400), FORBIDDEN (403)
- [x] T018 Add GET `/api/{user_id}/tasks` endpoint to `backend/routes/tasks.py` — query tasks WHERE user_id matches, ORDER BY created_at DESC, return envelope with tasks array (200). Validate user_id matches authenticated user (403)

### Frontend: Auth UI

- [x] T019 Create `frontend/lib/auth.ts` — Better Auth client configuration for Next.js App Router
- [x] T020 Create `frontend/lib/api.ts` — API client: base fetch wrapper with `credentials: 'include'` for cookies, typed response parsing using ApiResponse envelope, error extraction
- [x] T021 Create `frontend/app/layout.tsx` — root layout with HTML structure, Tailwind CSS globals, metadata (title: "Todo Evolution")
- [x] T022 Create `frontend/app/page.tsx` — landing page with app title, description, "Sign In" and "Sign Up" navigation links
- [x] T023 Create `frontend/app/(auth)/signup/page.tsx` — signup form (email, password, name inputs), client component with useState, form validation (required fields), call auth signup, redirect to /dashboard on success, show inline errors on failure (duplicate email, validation)
- [x] T024 Create `frontend/middleware.ts` — protect `/dashboard` route: check for auth cookie, redirect to `/signin` if missing

### Frontend: Dashboard & Task Creation

- [x] T025 Create `frontend/components/Header.tsx` — app header with title "Todo Evolution", display user name, "Log Out" button that calls signout and redirects to landing page
- [x] T026 Create `frontend/components/AddTaskForm.tsx` — form with title input (required, max 200 chars) and description textarea (optional), submit button, inline validation errors, loading state during submission, success toast on creation
- [x] T027 Create `frontend/components/TaskList.tsx` — display array of tasks, show "No tasks yet. Add your first task!" empty state when list is empty
- [x] T028 Create `frontend/components/TaskItem.tsx` — single task display: title, description, completion checkbox, delete button, edit button (edit/delete/complete functionality added in US2)
- [x] T029 Create `frontend/app/dashboard/page.tsx` — client component: fetch tasks on mount via API client GET, render Header + AddTaskForm + TaskList, handle loading state, handle API errors with user-friendly messages

**Checkpoint**: Full signup → dashboard → add task → see task → logout flow works end-to-end.

---

## Phase 4: User Story 2 — Returning User Task Management (Priority: P1)

**Goal**: A returning user can sign in and perform all CRUD operations: view, edit, complete, and delete tasks.

**Independent Test**: Sign in, view existing tasks, mark one complete, edit one, delete one, add new one, refresh page — all changes persisted.

### Backend: Remaining CRUD Endpoints

- [x] T030 Add GET `/api/{user_id}/tasks/{task_id}` endpoint to `backend/routes/tasks.py` — fetch single task by id AND user_id, return envelope (200). Handle TASK_NOT_FOUND (404), FORBIDDEN (403)
- [x] T031 Add PUT `/api/{user_id}/tasks/{task_id}` endpoint to `backend/routes/tasks.py` — update title and/or description, validate title max 200 chars if provided, set updated_at to now, return envelope with updated task (200). Handle TITLE_EMPTY (400), TITLE_TOO_LONG (400), TASK_NOT_FOUND (404), FORBIDDEN (403)
- [x] T032 Add DELETE `/api/{user_id}/tasks/{task_id}` endpoint to `backend/routes/tasks.py` — delete task by id AND user_id, return envelope with null data (200). Handle TASK_NOT_FOUND (404), FORBIDDEN (403)
- [x] T033 Add PATCH `/api/{user_id}/tasks/{task_id}/complete` endpoint to `backend/routes/tasks.py` — toggle completed boolean, set updated_at to now, return envelope with updated task (200). Handle TASK_NOT_FOUND (404), FORBIDDEN (403)

### Frontend: Signin

- [x] T034 Create `frontend/app/(auth)/signin/page.tsx` — signin form (email, password inputs), client component with useState, call auth signin, redirect to /dashboard on success, show inline error on invalid credentials

### Frontend: Task Management UI

- [x] T035 Update `frontend/components/TaskItem.tsx` — add complete toggle (checkbox calling PATCH complete endpoint, visual strikethrough for completed tasks), delete button (calling DELETE endpoint with confirmation, remove from list on success), edit button (opens EditTaskModal)
- [x] T036 Create `frontend/components/EditTaskModal.tsx` — modal/overlay with pre-filled title and description inputs, save button (calls PUT endpoint), cancel button, inline validation (title required, max 200), loading state, success toast on save, close on success
- [x] T037 Update `frontend/app/dashboard/page.tsx` — add state management for task operations: optimistic UI updates for complete toggle, remove task from state on delete, update task in state on edit, add toast notifications for success/error feedback on all operations
- [x] T038 Add API functions to `frontend/lib/api.ts` — updateTask (PUT), deleteTask (DELETE), toggleComplete (PATCH complete), getTask (GET single) with proper typing and error handling

**Checkpoint**: Full signin → view tasks → complete → edit → delete → add → refresh persistence flow works.

---

## Phase 5: User Story 3 — Multi-User Data Isolation (Priority: P2)

**Goal**: Multiple users see only their own tasks; no data leakage between accounts.

**Independent Test**: User A and User B in different browsers, each sees only their own tasks, operations by one do not affect the other.

- [x] T039 [US3] Review and harden `backend/routes/tasks.py` — ensure ALL task queries include `AND user_id = authenticated_user_id` filter. Verify FORBIDDEN (403) returned when path user_id does not match token user_id. Add explicit check at top of each endpoint
- [x] T040 [US3] Review and harden `backend/auth.py` — ensure expired tokens return 401 with UNAUTHORIZED error code, ensure missing cookies return 401, ensure malformed tokens return 401. No information leakage in error messages
- [x] T041 [US3] Update `frontend/middleware.ts` — handle expired/invalid auth cookies: redirect to /signin with optional query param `?expired=true`, show "Session expired" message on signin page when param present

**Checkpoint**: Two users tested in separate browsers; no cross-user data visible; unauthenticated access blocked.

---

## Phase 6: User Story 4 — Responsive Cross-Device Experience (Priority: P2)

**Goal**: App works on mobile (320px), tablet (768px), and desktop (1920px).

**Independent Test**: Resize browser to 320px, 768px, 1920px — all operations work, layout adapts.

- [x] T042 [P] [US4] Update `frontend/app/page.tsx` — responsive landing page: stack layout on mobile, centered content on desktop, appropriately sized buttons and text at all breakpoints
- [x] T043 [P] [US4] Update `frontend/app/(auth)/signin/page.tsx` and `frontend/app/(auth)/signup/page.tsx` — responsive auth forms: full-width inputs on mobile, max-width container on desktop, touch-friendly button sizes (min 44px tap targets)
- [x] T044 [US4] Update `frontend/app/dashboard/page.tsx` — responsive dashboard: single column on mobile, comfortable spacing on tablet, max-width centered on desktop. Ensure AddTaskForm, TaskList, and Header adapt to viewport
- [x] T045 [US4] Update `frontend/components/TaskItem.tsx` — responsive task items: stack action buttons below text on mobile, inline on desktop. Ensure checkbox and buttons meet minimum touch target size (44x44px)
- [x] T046 [US4] Update `frontend/components/EditTaskModal.tsx` — responsive modal: full-screen on mobile (bottom sheet style), centered overlay on desktop, appropriately sized inputs and buttons

**Checkpoint**: All operations verified at 320px, 768px, and 1920px viewports.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T047 Create `backend/.env.example` and `frontend/.env.example` with all required variables documented with comments
- [x] T048 [P] Add error boundary to `frontend/app/layout.tsx` — catch unhandled React errors, show user-friendly fallback UI instead of white screen
- [x] T049 [P] Add global error handling to `backend/main.py` — catch unhandled exceptions, return envelope format with INTERNAL_ERROR (500), log error details server-side (never expose to client)
- [x] T050 Update `README.md` — Phase 2 documentation: architecture overview, setup instructions (backend + frontend), environment variables table, API endpoint summary, deployment guide (Vercel + Render), demo screenshots
- [ ] T051 Deploy backend to Render/Railway — configure start command (`uvicorn main:app --host 0.0.0.0 --port $PORT`), set environment variables (DATABASE_URL, BETTER_AUTH_SECRET, FRONTEND_URL), verify /health endpoint
- [ ] T052 Deploy frontend to Vercel — set root directory to `frontend/`, configure environment variables (NEXT_PUBLIC_API_URL pointing to deployed backend, auth secrets), verify production build
- [ ] T053 Test production deployment — verify signup/signin flow, task CRUD, multi-user isolation, CORS working, cookies set correctly, HTTPS on both frontend and backend URLs
- [ ] T054 Record demo video (max 90 seconds) — show signup → signin → add task → view tasks → complete task → edit task → delete task → logout flow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — can start once foundation ready
- **US2 (Phase 4)**: Depends on Phase 3 (US1) — builds on auth + task creation
- **US3 (Phase 5)**: Depends on Phase 4 (US2) — hardens existing endpoints
- **US4 (Phase 6)**: Depends on Phase 4 (US2) — responsive styling of existing components
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — No dependencies on other stories
- **US2 (P1)**: Depends on US1 (auth + task creation must exist before adding CRUD)
- **US3 (P2)**: Depends on US2 (needs all endpoints to exist before hardening)
- **US4 (P2)**: Depends on US2 (needs all UI components to exist before responsive refinement). Can run in parallel with US3

### Within Each User Story

- Backend endpoints before frontend UI that calls them
- Models/schemas before routes
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T002, T003, T004, T005, T006 can all run in parallel
- **Phase 2**: T012 can run in parallel with T007-T011
- **Phase 6 (US4)**: T042, T043 can run in parallel (different files)

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 (Signup + First Task)
4. **STOP and VALIDATE**: Test full signup → dashboard → add task → logout
5. Deploy if ready — this is a working MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Test independently → Working signup + task creation (MVP!)
3. US2 → Test independently → Full CRUD (complete app!)
4. US3 → Test independently → Hardened security
5. US4 → Test independently → Responsive design
6. Polish → Deployment, docs, demo video

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US2 are both P1 but US2 depends on US1 (signin depends on existing accounts, CRUD depends on existing tasks)
- US3 and US4 are both P2 and can run in parallel after US2
- Commit after each phase completion
- Manual testing only (no automated tests requested)
- Stop at any checkpoint to validate story independently
