# API Contract: Phase 2 Full-Stack Web Application

**Branch**: `001-fullstack-webapp` | **Date**: 2026-02-07
**Base URL**: `{BACKEND_URL}/api`

## Response Envelope

All endpoints return responses in envelope format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

## Authentication Endpoints

### POST /api/auth/signup

Create a new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "name": "John Doe"
    }
  },
  "error": null
}
```

**Errors**:

| Status | Code | Message |
|--------|------|---------|
| 400 | INVALID_EMAIL | Email format is invalid |
| 400 | WEAK_PASSWORD | Password does not meet requirements |
| 409 | EMAIL_EXISTS | An account with this email already exists |

**Auth Required**: No

---

### POST /api/auth/signin

Authenticate a user and issue JWT.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "name": "John Doe"
    }
  },
  "error": null
}
```

**Side effect**: Sets httpOnly cookie with JWT token
(7-day expiry).

**Errors**:

| Status | Code | Message |
|--------|------|---------|
| 401 | INVALID_CREDENTIALS | Email or password is incorrect |

**Auth Required**: No

---

### POST /api/auth/signout

Sign out the current user.

**Request**: No body required.

**Response** (200 OK):
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

**Side effect**: Clears the auth cookie.

**Auth Required**: Yes (JWT cookie)

---

## Task Endpoints

All task endpoints require a valid JWT cookie. The
`{user_id}` path parameter MUST match the authenticated
user's ID; otherwise the request is rejected with 403.

### GET /api/{user_id}/tasks

List all tasks for the authenticated user.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 1,
        "user_id": "usr_abc123",
        "title": "Buy groceries",
        "description": "Milk, eggs, bread",
        "completed": false,
        "created_at": "2026-02-07T10:00:00Z",
        "updated_at": "2026-02-07T10:00:00Z"
      }
    ]
  },
  "error": null
}
```

**Ordering**: By `created_at` descending (newest first).

**Errors**:

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Cannot access another user's tasks |

---

### POST /api/{user_id}/tasks

Create a new task.

**Request**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Validation**:
- `title`: Required, max 200 characters
- `description`: Optional

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "user_id": "usr_abc123",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-02-07T10:00:00Z",
      "updated_at": "2026-02-07T10:00:00Z"
    }
  },
  "error": null
}
```

**Errors**:

| Status | Code | Message |
|--------|------|---------|
| 400 | TITLE_REQUIRED | Task title is required |
| 400 | TITLE_TOO_LONG | Task title must not exceed 200 characters |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Cannot create tasks for another user |

---

### GET /api/{user_id}/tasks/{task_id}

Get a single task by ID.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "user_id": "usr_abc123",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-02-07T10:00:00Z",
      "updated_at": "2026-02-07T10:00:00Z"
    }
  },
  "error": null
}
```

**Errors**:

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Cannot access another user's tasks |
| 404 | TASK_NOT_FOUND | Task not found |

---

### PUT /api/{user_id}/tasks/{task_id}

Update a task's title and/or description.

**Request**:
```json
{
  "title": "Buy groceries and fruits",
  "description": "Milk, eggs, bread, apples"
}
```

**Validation**:
- `title`: Optional in request but if provided, max 200
  characters and not empty
- `description`: Optional

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "user_id": "usr_abc123",
      "title": "Buy groceries and fruits",
      "description": "Milk, eggs, bread, apples",
      "completed": false,
      "created_at": "2026-02-07T10:00:00Z",
      "updated_at": "2026-02-07T12:30:00Z"
    }
  },
  "error": null
}
```

**Side effect**: Updates `updated_at` timestamp.

**Errors**:

| Status | Code | Message |
|--------|------|---------|
| 400 | TITLE_EMPTY | Task title cannot be empty |
| 400 | TITLE_TOO_LONG | Task title must not exceed 200 characters |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Cannot update another user's tasks |
| 404 | TASK_NOT_FOUND | Task not found |

---

### DELETE /api/{user_id}/tasks/{task_id}

Delete a task permanently.

**Response** (200 OK):
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

**Errors**:

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Cannot delete another user's tasks |
| 404 | TASK_NOT_FOUND | Task not found |

---

### PATCH /api/{user_id}/tasks/{task_id}/complete

Toggle a task's completion status.

**Request**: No body required.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "user_id": "usr_abc123",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": true,
      "created_at": "2026-02-07T10:00:00Z",
      "updated_at": "2026-02-07T14:00:00Z"
    }
  },
  "error": null
}
```

**Side effect**: Toggles `completed` between true/false.
Updates `updated_at` timestamp.

**Errors**:

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Cannot modify another user's tasks |
| 404 | TASK_NOT_FOUND | Task not found |

---

## Health Check

### GET /health

**Response** (200 OK):
```json
{
  "status": "healthy",
  "database": "connected"
}
```

**Auth Required**: No

---

## Error Code Reference

| Code | HTTP Status | Description |
|------|------------|-------------|
| UNAUTHORIZED | 401 | No valid auth token provided |
| FORBIDDEN | 403 | Authenticated but not authorized for this resource |
| INVALID_EMAIL | 400 | Email format validation failed |
| WEAK_PASSWORD | 400 | Password does not meet minimum requirements |
| EMAIL_EXISTS | 409 | Duplicate email on signup |
| INVALID_CREDENTIALS | 401 | Wrong email/password combination |
| TITLE_REQUIRED | 400 | Task title is missing |
| TITLE_EMPTY | 400 | Task title is empty string |
| TITLE_TOO_LONG | 400 | Task title exceeds 200 characters |
| TASK_NOT_FOUND | 404 | Task ID does not exist for this user |
| INTERNAL_ERROR | 500 | Unexpected server error |
