# Research: Phase 2 Full-Stack Web Application

**Branch**: `001-fullstack-webapp` | **Date**: 2026-02-07

## Research Topics

### R-1: Better Auth + FastAPI Integration Pattern

**Decision**: Use Better Auth as the primary auth provider
running on the Next.js frontend side, with JWT tokens passed
to FastAPI backend for verification.

**Rationale**: Better Auth is a TypeScript-native auth library
designed for Next.js. It handles user management, password
hashing, and JWT issuance on the frontend/Node side. The
FastAPI backend receives the JWT token via httpOnly cookies
and verifies it using the shared secret.

**Pattern**:
1. Better Auth runs as Next.js API route (`/api/auth/*`)
2. User signs up/in via frontend; Better Auth issues JWT
3. JWT stored in httpOnly cookie by Better Auth
4. Frontend requests to FastAPI include cookie automatically
5. FastAPI middleware extracts and verifies JWT
6. FastAPI extracts `user_id` from verified token payload

**Alternatives considered**:
- Custom JWT implementation: More control but re-invents
  wheel; security risk from DIY crypto.
- NextAuth/Auth.js: More popular but not the required stack
  per constitution.
- FastAPI-native auth: Would require duplicating user
  management on backend; doesn't match monorepo pattern.

### R-2: SQLModel Best Practices for FastAPI

**Decision**: Use SQLModel with async engine for Neon
PostgreSQL, defining models that serve as both database
tables and Pydantic schemas.

**Rationale**: SQLModel unifies SQLAlchemy and Pydantic,
allowing a single model class to serve as both the database
table definition and the API request/response schema. This
reduces code duplication and ensures type safety across the
stack.

**Key practices**:
- Use `table=True` for database models
- Use plain SQLModel classes (without `table=True`) for
  request/response schemas
- Use `Session` with `create_engine` for synchronous
  operations (simpler for hackathon)
- Call `SQLModel.metadata.create_all(engine)` on startup
- Use `Relationship` for User-Task foreign key

**Alternatives considered**:
- Raw SQLAlchemy: More flexible but verbose; loses Pydantic
  integration.
- Tortoise ORM: Async-first but less ecosystem support.
- Prisma (via Python client): Experimental; risky for
  hackathon timeline.

### R-3: Neon PostgreSQL Connection Setup

**Decision**: Use Neon serverless PostgreSQL with connection
string from environment variable `DATABASE_URL`.

**Rationale**: Neon provides free-tier serverless PostgreSQL
with automatic scaling and built-in connection pooling.
The connection string format is standard PostgreSQL.

**Connection pattern**:
```
DATABASE_URL=postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require
```

**Key considerations**:
- SSL required (`sslmode=require` in connection string)
- Connection pooling handled by Neon's proxy
- Cold start latency ~1-2s on first connection
- Use `pool_pre_ping=True` to handle stale connections

**Alternatives considered**:
- Supabase PostgreSQL: Good alternative but Neon specified
  in constitution.
- PlanetScale MySQL: Wrong database type (PostgreSQL
  required).
- Local PostgreSQL: Not suitable for deployed demo.

### R-4: Next.js 16 App Router Authentication Flow

**Decision**: Use Next.js middleware for route protection,
with Better Auth client for signin/signup forms.

**Rationale**: App Router supports middleware that runs
before every request. This middleware checks for valid auth
cookies and redirects unauthenticated users to `/signin`.

**Flow**:
1. `middleware.ts` checks for auth cookie on protected
   routes (`/dashboard`)
2. If no valid cookie: redirect to `/signin`
3. If valid cookie: allow request to proceed
4. Signin/signup pages are unprotected (public)
5. After successful auth: redirect to `/dashboard`

**Key considerations**:
- Use `matcher` config in middleware to only protect
  specific routes
- Better Auth provides `useSession()` hook for client
  components
- Server components can access session via cookies

### R-5: CORS Configuration for Next.js + FastAPI

**Decision**: Configure FastAPI CORS middleware to allow
the Next.js frontend origin, with credentials enabled for
cookie-based auth.

**Configuration**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Key considerations**:
- `allow_credentials=True` is required for httpOnly cookies
- Cannot use `allow_origins=["*"]` with credentials
- Must specify exact origin URLs
- Production URL added via environment variable
- `FRONTEND_URL` env var for deployed frontend

### R-6: Vercel + Backend Deployment Configuration

**Decision**: Frontend on Vercel (auto-deploy from git),
backend on Render or Railway with Neon PostgreSQL.

**Rationale**: Vercel is the natural deployment target for
Next.js (built by the same team). Backend needs a persistent
Python hosting service (not serverless functions) to run
FastAPI with database connections.

**Frontend (Vercel)**:
- Connect GitHub repository
- Set root directory to `frontend/`
- Environment variables: `NEXT_PUBLIC_API_URL`, auth secrets

**Backend (Render/Railway)**:
- Deploy from `backend/` directory
- Environment variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`,
  `FRONTEND_URL`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health check: `GET /health`

## Summary

All 6 research topics resolved. No NEEDS CLARIFICATION
items remain. Proceeding to Phase 1 design artifacts.
