"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api/client";
import type { ChatResponse } from "@/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  data?: ChatResponse;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));

  const sendMessage = useCallback(
    async (message: string, branchId?: string) => {
      setMessages((prev) => [...prev, { role: "user", content: message }]);
      setLoading(true);

      try {
        const response = await api.chat(message, branchId, sessionId);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.message, data: response },
        ]);
        return response;
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I couldn't process your request. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  return { messages, sendMessage, loading, sessionId };
}
