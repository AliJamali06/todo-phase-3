import { ApiResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Chat Types ---

export interface ToolCall {
  tool: string;
  parameters: Record<string, unknown>;
  result: string;
}

export interface ChatData {
  conversation_id: number;
  response: string;
  tool_calls: ToolCall[];
}

export interface ConversationData {
  conversation: {
    id: number;
    user_id: string;
    created_at: string;
    updated_at: string;
  } | null;
}

export interface MessageItem {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface MessagesData {
  messages: MessageItem[];
}

// --- Chat API Functions ---

export async function sendMessage(
  userId: string,
  message: string,
  conversationId?: number
): Promise<ApiResponse<ChatData>> {
  const body: Record<string, unknown> = { message };
  if (conversationId !== undefined) {
    body.conversation_id = conversationId;
  }

  const res = await fetch(`${API_URL}/api/${userId}/chat`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function getConversations(
  userId: string
): Promise<ApiResponse<ConversationData>> {
  const res = await fetch(`${API_URL}/api/${userId}/conversations`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}

export async function getMessages(
  userId: string,
  conversationId: number
): Promise<ApiResponse<MessagesData>> {
  const res = await fetch(
    `${API_URL}/api/${userId}/conversations/${conversationId}/messages`,
    {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.json();
}
