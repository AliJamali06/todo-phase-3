# Data Model: AI-Powered Chatbot Interface

**Branch**: `002-ai-chatbot` | **Date**: 2026-02-08

## New Entities (Phase 3 Additions)

### Conversation

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | SERIAL | PK, auto-increment | Conversation identifier |
| user_id | VARCHAR | FK → users(id), NOT NULL, ON DELETE CASCADE | Owner |
| created_at | TIMESTAMP | DEFAULT NOW() | Session start time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last activity time |

**Relationships**:
- Each Conversation belongs to exactly one User (N:1)
- Each Conversation has zero or more Messages (1:N)
- One active conversation per user (application-level enforcement)
- Cascade delete: deleting a User deletes their Conversations

**Indexes**:
- `idx_conversations_user_id` on `user_id` — fast lookup by user

### Message

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | SERIAL | PK, auto-increment | Message identifier |
| conversation_id | INTEGER | FK → conversations(id), NOT NULL, ON DELETE CASCADE | Parent conversation |
| role | VARCHAR(10) | NOT NULL, CHECK IN ('user', 'assistant') | Sender role |
| content | TEXT | NOT NULL | Message text |
| created_at | TIMESTAMP | DEFAULT NOW() | Message timestamp |

**Relationships**:
- Each Message belongs to exactly one Conversation (N:1)
- Cascade delete: deleting a Conversation deletes its Messages

**Indexes**:
- `idx_messages_conversation_id` on `conversation_id` — fast history retrieval

## Existing Entities (Phase 2 — Unchanged)

### User

| Field | Type | Constraints |
|-------|------|------------|
| id | VARCHAR | PK |
| email | VARCHAR | UNIQUE, NOT NULL |
| name | VARCHAR | nullable |
| created_at | TIMESTAMP | DEFAULT NOW() |

### Task

| Field | Type | Constraints |
|-------|------|------------|
| id | SERIAL | PK |
| user_id | VARCHAR | FK → users(id), ON DELETE CASCADE |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | nullable |
| completed | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

## Entity Relationship Diagram

```
┌──────────────┐     1:N     ┌──────────────────┐
│    User      │────────────>│      Task        │
│──────────────│             │──────────────────│
│ id (PK)      │             │ id (PK)          │
│ email (UQ)   │             │ user_id (FK)     │
│ name         │             │ title            │
│ created_at   │             │ description      │
└──────────────┘             │ completed        │
       │                     │ created_at       │
       │                     │ updated_at       │
       │ 1:N                 └──────────────────┘
       │
       ▼
┌──────────────────┐     1:N     ┌──────────────────┐
│  Conversation    │────────────>│    Message        │
│──────────────────│             │──────────────────│
│ id (PK)          │             │ id (PK)          │
│ user_id (FK)     │             │ conversation_id  │
│ created_at       │             │   (FK)           │
│ updated_at       │             │ role             │
└──────────────────┘             │ content          │
                                 │ created_at       │
                                 └──────────────────┘
```

## Data Access Patterns

| Operation | Query Pattern | Index Used |
|-----------|--------------|-----------:|
| Get user's conversation | `WHERE user_id = ?` | idx_conversations_user_id |
| Get conversation messages | `WHERE conversation_id = ? ORDER BY created_at ASC` | idx_messages_conversation_id |
| Create conversation | `INSERT INTO conversations (user_id, ...)` | N/A |
| Add message | `INSERT INTO messages (conversation_id, role, content)` | N/A |
| Update conversation activity | `UPDATE conversations SET updated_at = NOW() WHERE id = ?` | PK |

**Note**: All conversation/message queries include user ownership verification to enforce data isolation. MCP tools do NOT query these tables — they call the Phase 2 REST API for task operations.
