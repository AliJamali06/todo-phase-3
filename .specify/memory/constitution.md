<!--
  ============================================================
  SYNC IMPACT REPORT
  ============================================================
  Version change: 0.0.0 (template) → 1.0.0 (initial ratification)
  Bump rationale: MAJOR — first concrete constitution replacing
    the blank template; all placeholders resolved.

  Modified principles (old → new):
    [PRINCIPLE_1_NAME] → I. Spec-Driven Development (SDD)
    [PRINCIPLE_2_NAME] → II. Reusable Intelligence
    [PRINCIPLE_3_NAME] → III. Progressive Complexity
    [PRINCIPLE_4_NAME] → IV. Production-Grade Quality
    [PRINCIPLE_5_NAME] → (removed — merged into phase sections)
    [PRINCIPLE_6_NAME] → (removed — merged into phase sections)

  Added sections:
    + Phase-Specific Standards (Phase 1–5)
    + Cross-Phase Standards
    + Hackathon-Specific Constraints
    + Anti-Patterns
    + Success Metrics
    + Constitution Updates (governance)

  Removed sections:
    - [SECTION_2_NAME] placeholder
    - [SECTION_3_NAME] placeholder
    - All template comments

  Templates requiring updates:
    ✅ plan-template.md — Constitution Check section is
       generic; no update needed (gates derived at runtime)
    ✅ spec-template.md — User Stories & Requirements
       structure compatible; no update needed
    ✅ tasks-template.md — Phase-based structure aligns;
       no update needed
    ⚠  Agent/skill YAML files reference "todo-phase-2"
       in metadata — consider updating to "todo-phase-3"
       or generic "todo-evolution" in a follow-up

  Deferred items: None
  ============================================================
-->

# Todo Evolution Constitution
## From CLI to Cloud-Native AI System

### Project Overview

A progressive 5-phase application demonstrating Spec-Driven
Development (SDD) using Claude Code and Spec-Kit Plus, evolving
from a simple CLI todo app to a distributed, AI-powered,
cloud-native system deployed on Kubernetes.

## Core Principles (All Phases)

### I. Spec-Driven Development (SDD)

- **MANDATORY**: No code shall be written without a
  corresponding specification.
- **Workflow**: Specify > Plan > Tasks > Implement.
- **Constitution Hierarchy**: Constitution > Specify > Plan >
  Tasks > Code.
- **No Vibe Coding**: All features MUST trace back to
  documented requirements.
- **Iterative Refinement**: Specs evolve through feedback,
  not improvisation.

### II. Reusable Intelligence

- Develop once, reuse everywhere via Agent Skills and
  Subagents.
- Build modular, composable solutions.
- Document patterns for future automation.
- Create blueprints for spec-driven deployment.

### III. Progressive Complexity

- Each phase builds upon previous phases (no breaking
  changes).
- Maintain backward compatibility across all phases.
- Evolutionary architecture: extend, do not replace.
- Git history MUST show clear phase-by-phase progression.

### IV. Production-Grade Quality

- Code quality over speed.
- Security-first implementation.
- Comprehensive error handling.
- Observable and debuggable systems.

## Phase-Specific Standards

### Phase 1: CLI Todo App (In-Memory)

**Technology Stack**: Python 3.13+, UV package manager

**Code Standards**:
- Clean code principles (PEP 8 compliance)
- Type hints required for all functions
- Docstrings for public methods
- Proper project structure (`/src`, `/tests`)

**Quality Gates**:
- All features tested manually
- No runtime errors for basic operations
- Clear console output formatting
- Graceful error messages for invalid inputs

**Success Criteria**:
- Add, Delete, Update, View, Complete tasks working
- Constitution file exists
- Specs folder with all specification files
- CLAUDE.md with clear instructions
- README with setup guide

### Phase 2: Full-Stack Web Application

**Technology Stack**: Next.js 16+, FastAPI, SQLModel,
Neon PostgreSQL, Better Auth

**Architecture Principles**:
- **Monorepo Structure**: Frontend + Backend in single
  repository
- **API-First Design**: RESTful conventions strictly followed
- **Stateless Services**: No server-side session storage
- **Database-Backed**: All data persisted in Neon DB

**Security Standards**:
- JWT-based authentication (Better Auth)
- All API endpoints require valid JWT token
- User data isolation (users only see their own tasks)
- Environment variables for secrets (never commit `.env`)
- SQL injection prevention (SQLModel ORM parameterized
  queries)

**API Conventions**:
- Base path: `/api/{user_id}/...`
- HTTP methods: GET (read), POST (create), PUT (update),
  DELETE (remove), PATCH (partial update)
- Response format: JSON with consistent structure
- Error responses: Proper HTTP status codes
  (400, 401, 404, 500)
- Request validation: Pydantic models

**Frontend Standards**:
- Server Components by default
- Client Components only for interactivity
- Tailwind CSS for styling (no inline styles)
- Responsive design (mobile-first)
- Loading states and error boundaries

**Database Standards**:
- SQLModel models with proper relationships
- Migration scripts tracked in version control
- Foreign key constraints enforced
- Indexed fields for performance (user_id, task_id)
- Timestamps (created_at, updated_at) on all tables

**Testing Requirements**:
- API endpoints tested with sample requests
- Frontend forms validated
- Authentication flow verified
- Database operations confirmed

**Success Criteria**:
- Multi-user support with authentication
- RESTful API with all CRUD operations
- Responsive web UI
- Data persisted in Neon DB
- Deployed on Vercel (frontend)
- JWT security implemented

### Phase 3: AI-Powered Chatbot

**Technology Stack**: OpenAI ChatKit, OpenAI Agents SDK,
Official MCP SDK, FastAPI, Neon DB

**Architecture Principles**:
- **Stateless Chat Endpoint**: No in-memory conversation
  state
- **MCP-Based Tools**: All task operations exposed via
  MCP server
- **Database-Backed Conversations**: Full history stored
  in Neon DB
- **API Wrapper Pattern**: MCP tools call existing Phase 2
  REST API

**MCP Tool Standards**:
- **Tool Naming**: snake_case, descriptive (e.g., `add_task`,
  `list_tasks`)
- **Parameter Validation**: Type-checked inputs with Pydantic
- **Error Handling**: Return structured error responses
- **Stateless Design**: Each tool call is independent
- **API Integration**: Tools call Phase 2 REST endpoints
  (no direct DB access)

**Database Schema Extension**:
- **Conversations Table**: Track chat sessions per user
- **Messages Table**: Store full conversation history
  (user + assistant)
- **Foreign Keys**: Link messages to conversations,
  conversations to users
- **No Breaking Changes**: Existing `tasks` and `users`
  tables MUST remain untouched

**Success Criteria**:
- Natural language task management
- MCP server with 5 tools (add, list, complete, delete,
  update)
- Conversation history persisted and resumable
- ChatKit UI functional at `/chat` route
- Phase 2 traditional UI still works at `/dashboard`
- Stateless architecture (horizontal scaling ready)

### Phase 4: Local Kubernetes Deployment

**Technology Stack**: Docker, Minikube, Helm Charts,
kubectl-ai, kagent, Gordon (Docker AI)

**Cloud-Native Principles**:
- **Containerization**: All services Dockerized
- **Declarative Configuration**: Infrastructure as Code
  (Helm Charts)
- **Service Discovery**: Kubernetes DNS for inter-service
  communication
- **Health Checks**: Liveness and readiness probes
- **Resource Limits**: CPU and memory constraints defined

**Success Criteria**:
- Frontend and backend containerized
- Helm charts deploy successfully on Minikube
- Services communicate within cluster
- kubectl-ai/kagent/Gordon demonstrated
- Application accessible via Minikube tunnel/port-forward

### Phase 5: Advanced Cloud Deployment

**Technology Stack**: Kafka, Dapr, DigitalOcean/GCP/Oracle
Kubernetes, Helm, CI/CD (GitHub Actions)

**Event-Driven Architecture**:
- **Pub/Sub Pattern**: Services communicate via Kafka topics
- **Topic Design**: `task-events`, `reminders`,
  `task-updates`

**Success Criteria**:
- Event-driven architecture with Kafka
- Dapr deployed (Pub/Sub, State, Jobs, Secrets)
- Successfully deployed on cloud (DOKS/GKE/OKE)
- CI/CD pipeline functional
- Monitoring/logging configured

## Cross-Phase Standards

### Git & Version Control
- **Commit Messages**: Conventional Commits format
- **Branching**: Feature branches
- **Tags**: Tag each phase completion

### Environment Variables
- **Never Commit**: `.env` files excluded via `.gitignore`
- **Example Files**: Provide `.env.example` templates

### Error Handling
- **Graceful Degradation**: System continues despite
  non-critical errors
- **User-Friendly Messages**: No raw stack traces to end
  users
- **Logging**: Structured logs with severity levels

### Testing Philosophy
- **Manual Testing**: All features verified before submission
- **Edge Cases**: Invalid inputs handled gracefully
- **Integration Tests**: End-to-end flows validated

## Anti-Patterns (What NOT to Do)

- **Manual Coding**: Writing code without specs (vibe coding)
- **Breaking Changes**: Phase N breaks Phase N-1
- **Hardcoded Secrets**: API keys in source code
- **Direct DB Access**: Services bypass API layer (Phase 3+)
- **Silent Failures**: Errors swallowed without logging

## Governance

This constitution is a **living document**. Updates MUST
follow these rules:

1. **Versioning**: Semantic versioning (MAJOR.MINOR.PATCH).
2. **Backward Compatibility**: New rules MUST NOT invalidate
   previous phases.
3. **Spec-Driven**: Constitutional changes require
   specification.
4. **Compliance Review**: Every phase completion MUST include
   a constitution compliance check.

**Version**: 1.0.0 | **Ratified**: 2026-02-07 | **Last Amended**: 2026-02-07
