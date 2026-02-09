"""
MCP Tools for Task Management.

Each tool wraps a Phase 2 REST API endpoint via HTTP (httpx).
Tools NEVER access the database directly — they call the Phase 2 REST API
which handles validation, auth, and business logic.

This is a constitution mandate: MCP tools must use the API wrapper pattern.
"""

import httpx
from typing import Optional
from agents import function_tool

from config import BACKEND_URL


async def _api_call(
    method: str,
    path: str,
    auth_token: str,
    json_data: Optional[dict] = None,
) -> dict:
    """Make an authenticated HTTP request to the Phase 2 REST API."""
    cookies = {"auth_token": auth_token}
    url = f"{BACKEND_URL}{path}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.request(
                method=method,
                url=url,
                json=json_data,
                cookies=cookies,
                timeout=10.0,
            )
            data = response.json()

            if not data.get("success", False):
                error = data.get("error", {})
                error_msg = error.get("message", "Unknown error") if isinstance(error, dict) else str(error)
                return {"error": error_msg}

            return data.get("data", {})

        except httpx.ConnectError:
            return {"error": "Task service is temporarily unavailable. Please try again."}
        except httpx.TimeoutException:
            return {"error": "Request timed out. Please try again."}
        except Exception:
            return {"error": "An unexpected error occurred while processing your request."}


# The auth_token and user_id are injected at call time by the chat endpoint.
# We store them in a module-level context dict that gets set before each agent run.
_tool_context: dict = {}


def set_tool_context(user_id: str, auth_token: str):
    """Set the user context for tool calls. Called before each agent run."""
    _tool_context["user_id"] = user_id
    _tool_context["auth_token"] = auth_token


def clear_tool_context():
    """Clear the tool context after agent run."""
    _tool_context.clear()


# --- Shared-data guarantee ---
# These tools call the SAME Phase 2 REST API endpoints used by the dashboard frontend.
# add_task    → POST   /api/{user_id}/tasks
# list_tasks  → GET    /api/{user_id}/tasks
# complete_task → PATCH /api/{user_id}/tasks/{task_id}/complete
# delete_task → DELETE /api/{user_id}/tasks/{task_id}
# update_task → PUT    /api/{user_id}/tasks/{task_id}
# This ensures chat and dashboard always operate on the same data.


@function_tool
async def add_task(title: str, description: str = "") -> str:
    """Create a new task in the user's todo list. Use this when the user wants to add, create, or remember something."""
    user_id = _tool_context.get("user_id", "")
    auth_token = _tool_context.get("auth_token", "")

    body = {"title": title}
    if description:
        body["description"] = description

    result = await _api_call("POST", f"/api/{user_id}/tasks", auth_token, json_data=body)

    if "error" in result:
        return f"Error: {result['error']}"

    task = result.get("task", {})
    return f"Created task: '{task.get('title', title)}' (ID: {task.get('id', 'unknown')})"


@function_tool
async def list_tasks(status: str = "all") -> str:
    """List tasks from the user's todo list. Use this when the user wants to see, show, or view their tasks. The status parameter filters: 'all' for everything, 'pending' for incomplete tasks, 'completed' for done tasks."""
    user_id = _tool_context.get("user_id", "")
    auth_token = _tool_context.get("auth_token", "")

    result = await _api_call("GET", f"/api/{user_id}/tasks", auth_token)

    if "error" in result:
        return f"Error: {result['error']}"

    tasks = result.get("tasks", [])

    if status == "pending":
        tasks = [t for t in tasks if not t.get("completed", False)]
    elif status == "completed":
        tasks = [t for t in tasks if t.get("completed", False)]

    if not tasks:
        if status == "pending":
            return "You have no pending tasks."
        elif status == "completed":
            return "You haven't completed any tasks yet."
        return "You have no tasks yet. Would you like to add one?"

    lines = []
    for t in tasks:
        check = "done" if t.get("completed") else "pending"
        desc = f" - {t.get('description')}" if t.get("description") else ""
        lines.append(f"- [{check}] ID {t['id']}: {t['title']}{desc}")

    return "\n".join(lines)


@function_tool
async def complete_task(task_id: int) -> str:
    """Mark a task as complete (or toggle its completion). Use this when the user wants to finish, complete, or mark a task as done."""
    user_id = _tool_context.get("user_id", "")
    auth_token = _tool_context.get("auth_token", "")

    result = await _api_call("PATCH", f"/api/{user_id}/tasks/{task_id}/complete", auth_token)

    if "error" in result:
        return f"Error: {result['error']}"

    task = result.get("task", {})
    status = "completed" if task.get("completed") else "reopened"
    return f"Task '{task.get('title', '')}' (ID: {task_id}) has been {status}."


@function_tool
async def delete_task(task_id: int) -> str:
    """Delete a task from the user's todo list. Use this when the user wants to remove or delete a task."""
    user_id = _tool_context.get("user_id", "")
    auth_token = _tool_context.get("auth_token", "")

    result = await _api_call("DELETE", f"/api/{user_id}/tasks/{task_id}", auth_token)

    if "error" in result:
        return f"Error: {result['error']}"

    return f"Task (ID: {task_id}) has been deleted."


@function_tool
async def update_task(task_id: int, title: str = "", description: str = "") -> str:
    """Update a task's title or description. Use this when the user wants to change, rename, edit, or modify a task."""
    user_id = _tool_context.get("user_id", "")
    auth_token = _tool_context.get("auth_token", "")

    body = {}
    if title:
        body["title"] = title
    if description:
        body["description"] = description

    if not body:
        return "Please specify what to update (title or description)."

    result = await _api_call("PUT", f"/api/{user_id}/tasks/{task_id}", auth_token, json_data=body)

    if "error" in result:
        return f"Error: {result['error']}"

    task = result.get("task", {})
    return f"Task (ID: {task_id}) has been updated. New title: '{task.get('title', '')}'"
