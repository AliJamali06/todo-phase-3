"""
Todo Agent — OpenAI Agents SDK configuration.

Stateless agent that manages tasks through natural language.
Uses MCP tools to interact with the Phase 2 REST API.
"""

from openai import AsyncOpenAI
from agents import Agent, Runner, set_default_openai_client, ModelSettings

from config import OPENAI_API_KEY
from mcp_tools.server import TOOLS, set_tool_context, clear_tool_context

# Configure OpenRouter as the provider
_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENAI_API_KEY,
)
set_default_openai_client(_client)

SYSTEM_PROMPT = """You are a friendly and helpful task management assistant for Todo Evolution.

## Your Capabilities
You help users manage their todo list through natural language. You can:
- **Add tasks**: Create new tasks (e.g., "Add buy groceries", "I need to remember to call mom")
- **List tasks**: Show all, pending, or completed tasks (e.g., "Show my tasks", "What's pending?", "What have I completed?")
- **Complete tasks**: Mark tasks as done (e.g., "Mark task 3 as done", "Complete the groceries task")
- **Delete tasks**: Remove tasks (e.g., "Delete task 5", "Remove the groceries task")
- **Update tasks**: Change task titles or descriptions (e.g., "Rename task 1 to 'Call mom tonight'")

## Response Guidelines
- Always confirm actions with a clear, friendly message
- When listing tasks, format them clearly with their ID, title, and status
- Use the task ID when referencing specific tasks
- Be concise but informative

## Ambiguity Handling
- If the user says "delete the task" or similar but has multiple tasks, list their tasks and ask which one they mean
- If a request is unclear, ask a clarifying question before taking action
- Never guess which task the user means — always confirm if ambiguous

## Error Handling
- If a task is not found, say something like "I couldn't find that task. Would you like to see your current tasks?"
- If a task title is too long (over 200 characters), let the user know about the limit
- Never expose technical error codes or stack traces
- If something goes wrong, provide a helpful, user-friendly message

## Off-topic Messages
- If the user asks about something unrelated to task management, respond politely and redirect them
- Example: "I'm your task management assistant! I can help you add, view, complete, update, or delete tasks. What would you like to do?"

## Greeting
When the conversation starts, greet the user warmly and let them know what you can do.
"""

# Create the agent with system prompt and MCP tools
todo_agent = Agent(
    name="Todo Assistant",
    instructions=SYSTEM_PROMPT,
    tools=TOOLS,
    model="openai/gpt-4o-mini",
)


async def run_agent(
    messages: list[dict],
    user_id: str,
    auth_token: str,
) -> dict:
    """
    Run the todo agent with conversation history.

    Args:
        messages: Conversation history as list of {"role": str, "content": str}
        user_id: The authenticated user's ID (for MCP tool context)
        auth_token: The user's JWT token (for MCP tool API calls)

    Returns:
        dict with "response" (str) and "tool_calls" (list)
    """
    set_tool_context(user_id, auth_token)

    try:
        # Build input from conversation history
        input_messages = []
        for msg in messages:
            input_messages.append({
                "role": msg["role"],
                "content": msg["content"],
            })

        result = await Runner.run(
            todo_agent,
            input=input_messages,
        )

        # Extract tool calls from result items
        tool_calls = []
        for item in result.new_items:
            if hasattr(item, "type") and item.type == "tool_call_item":
                tool_call_info = {
                    "tool": getattr(item, "name", "unknown"),
                    "parameters": {},
                    "result": getattr(item, "output", ""),
                }
                tool_calls.append(tool_call_info)

        return {
            "response": result.final_output,
            "tool_calls": tool_calls,
        }

    finally:
        clear_tool_context()
