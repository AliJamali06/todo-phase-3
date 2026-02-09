"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import {
  sendMessage,
  getConversations,
  getMessages,
  MessageItem,
} from "@/lib/chatApi";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
}

const GREETING_MESSAGE: DisplayMessage = {
  role: "assistant",
  content:
    "Hi! I'm your task management assistant. I can help you add, view, complete, update, or delete tasks. Try saying \"Show my tasks\" or \"Add buy groceries\".",
};

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    const uname = localStorage.getItem("user_name");
    if (!uid) {
      router.push("/signin");
      return;
    }
    setUserId(uid);
    setUserName(uname);
    loadHistory(uid);
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadHistory(uid: string) {
    setHistoryLoading(true);
    try {
      const convRes = await getConversations(uid);
      if (convRes.success && convRes.data?.conversation) {
        const conv = convRes.data.conversation;
        setConversationId(conv.id);

        const msgRes = await getMessages(uid, conv.id);
        if (msgRes.success && msgRes.data?.messages) {
          const loaded: DisplayMessage[] = msgRes.data.messages.map(
            (m: MessageItem) => ({
              role: m.role,
              content: m.content,
            })
          );
          setMessages(loaded.length > 0 ? loaded : [GREETING_MESSAGE]);
        } else {
          setMessages([GREETING_MESSAGE]);
        }
      } else {
        setMessages([GREETING_MESSAGE]);
      }
    } catch {
      setMessages([GREETING_MESSAGE]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || !userId || loading) return;

    const userMsg = input.trim();
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await sendMessage(userId, userMsg, conversationId);

      if (res.success && res.data) {
        setConversationId(res.data.conversation_id);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.data!.response },
        ]);
      } else {
        const errMsg =
          res.error?.message || "Something went wrong. Please try again.";
        if (res.error?.code === "UNAUTHORIZED") {
          router.push("/signin?expired=true");
          return;
        }
        setError(errMsg);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: errMsg },
        ]);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (historyLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
        <Header userName={userName} />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-[#6B7280]">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading chat...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <Header userName={userName} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6366F1]">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "rounded-br-md bg-[#6366F1] text-white"
                      : "rounded-bl-md border border-[#E5E7EB] bg-white text-[#111827] shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6366F1]">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                </div>
                <div className="rounded-2xl rounded-bl-md border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#9CA3AF]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-[#E5E7EB] bg-white px-4 py-4">
          <div className="mx-auto flex max-w-2xl gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to manage your tasks..."
              disabled={loading}
              className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] transition-colors focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4F46E5] disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
