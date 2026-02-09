# API Contract: AI-Powered Chatbot Interface

**Branch**: `002-ai-chatbot` | **Date**: 2026-02-08
**Base URL**: `{BACKEND_URL}/api`

## Response Envelope

All new endpoints return responses in the same envelope format as Phase 2:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

## Chat Endpoints

### POST /api/{user_id}/chat

Send a message to the AI chat assistant. Creates a new conversation if none exists.

**Request**:
```json
{
  "message": "Add buy groceries to my list",
  "conversation_id": 123
}
```

**Fields**:
- `message`: Required, the user's natural language message
- `conversation_id`: Optional. If omitted, creates a new conversation. If provided, continues the existing conversation.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "conversation_id": 123,
    "response": "I've added 'Buy groceries' to your task list.",
    "tool_calls": [
      {
        "tool": "add_task",
        "parameters": {"title": "Buy groceries"},
        "result": {"task_id": 42, "status": "created", "title": "Buy groceries"}
      }
    ]
  },
  "error": null
}
```

**Errors**:

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Cannot access another user's chat |
| 404 | CONVERSATION_NOT_FOUND | Conversation not found |
| 500 | CHAT_ERROR | Failed to process chat message |

**Auth Required**: Yes (JWT cookie)

---

### GET /api/{user_id}/conversations

Get the user's conversation (single conversation model).

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": 123,
      "user_id": "usr_abc123",
      "created_at": "2026-02-08T10:00:00Z",
      "updated_at": "2026-02-08T14:00:00Z"
    }
  },
  "error": null
}
```

Returns `null` for `conversation` if no conversation exists yet.

**Errors**:

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Cannot access another user's conversations |

**Auth Required**: Yes (JWT cookie)

---

### GET /api/{user_id}/conversations/{conversation_id}/messages

Get all messages for a conversation.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "conversation_id": 123,
        "role": "assistant",
        "content": "Hi! I can help manage your tasks. Try 'Show my tasks' or 'Add a task'.",
        "created_at": "2026-02-08T10:00:00Z"
      },
      {
        "id": 2,
        "conversation_id": 123,
        "role": "user",
        "content": "Add buy groceries to my list",
        "created_at": "2026-02-08T10:01:00Z"
      },
      {
        "id": 3,
        "conversation_id": 123,
        "role": "assistant",
        "content": "I've added 'Buy groceries' to your task list.",
        "created_at": "2026-02-08T10:01:02Z"
      }
    ]
  },
  "error": null
}
```

**Ordering**: By `created_at` ascending (oldest first — chronological).

**Errors**:

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Cannot access another user's conversations |
| 404 | CONVERSATION_NOT_FOUND | Conversation not found |

**Auth Required**: Yes (JWT cookie)

---

## MCP Tool Specifications

### Tool 1: add_task

**Description**: Create a new task in the user's todo list.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| title | string | Yes | Task title (max 200 chars) |
| description | string | No | Task description |

**Returns**:
```json
{"task_id": 42, "status": "created", "title": "Buy groceries"}
```

**Internal call**: POST `/api/{user_id}/tasks`

---

### Tool 2: list_tasks

**Description**: Retrieve tasks from the user's todo list.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| status | string | No | Filter: "all" (default), "pending", "completed" |

**Returns**:
```json
{"tasks": [{"id": 1, "title": "Buy groceries", "completed": false}]}
```

**Internal call**: GET `/api/{user_id}/tasks`

---

### Tool 3: complete_task

**Description**: Mark a task as complete.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | integer | Yes | The ID of the task to complete |

**Returns**:
```json
{"task_id": 1, "status": "completed", "title": "Buy groceries"}
```

**Internal call**: PATCH `/api/{user_id}/tasks/{task_id}/complete`

---

### Tool 4: delete_task

**Description**: Remove a task from the list.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | integer | Yes | The ID of the task to delete |

**Returns**:
```json
{"task_id": 1, "status": "deleted", "title": "Buy groceries"}
```

**Internal call**: DELETE `/api/{user_id}/tasks/{task_id}`

---

### Tool 5: update_task

**Description**: Modify a task's title or description.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | integer | Yes | The ID of the task to update |
| title | string | No | New title (max 200 chars) |
| description | string | No | New description |

**Returns**:
```json
{"task_id": 1, "status": "updated", "title": "Buy groceries and fruits"}
```

**Internal call**: PUT `/api/{user_id}/tasks/{task_id}`

---

## Error Code Reference (New)

| Code | HTTP Status | Description |
|------|------------|-------------|
| CONVERSATION_NOT_FOUND | 404 | Conversation ID does not exist or does not belong to user |
| CHAT_ERROR | 500 | Agent failed to process the chat message |
| MESSAGE_EMPTY | 400 | Empty message sent to chat endpoint |

*Phase 2 error codes (UNAUTHORIZED, FORBIDDEN, TASK_NOT_FOUND, etc.) still apply for MCP tool calls that hit Phase 2 endpoints.*
