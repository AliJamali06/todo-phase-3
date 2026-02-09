"""
MCP Server — Tool Registry for the Todo Agent.

Registers all 5 task management tools that wrap the Phase 2 REST API.
Tools are exposed as OpenAI Agents SDK function_tools.

Tool descriptions are critical for correct agent tool selection:
- add_task: creating, adding, remembering tasks
- list_tasks: showing, viewing, listing tasks (with status filter)
- complete_task: finishing, completing, marking done
- delete_task: removing, deleting tasks
- update_task: changing, renaming, editing tasks
"""

from mcp_tools.tools import (
    add_task,
    list_tasks,
    complete_task,
    delete_task,
    update_task,
    set_tool_context,
    clear_tool_context,
)

# All available MCP tools for the todo agent
TOOLS = [
    add_task,
    list_tasks,
    complete_task,
    delete_task,
    update_task,
]

__all__ = ["TOOLS", "set_tool_context", "clear_tool_context"]
