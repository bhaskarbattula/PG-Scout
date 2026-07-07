"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Loader2, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { BranchSelector } from "./BranchSelector";
import type { Branch } from "@/types";
import { useRouter } from "next/navigation";

export function ChatAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, loading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || loading) return;
      const msg = input.trim();
      setInput("");
      await sendMessage(msg);
    },
    [input, loading, sendMessage]
  );

  const handleBranchSelect = useCallback(
    async (branch: Branch) => {
      await sendMessage(`Show PGs near ${branch.name}`, branch.id);
      router.push(`/search?branchId=${branch.id}`);
    },
    [sendMessage, router]
  );

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden"
            style={{ backgroundColor: "var(--card-bg)", maxHeight: "600px", height: "calc(100vh - 160px)" }}
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]" style={{ backgroundColor: "var(--primary)" }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="font-semibold text-sm text-white">PG Finder AI</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/20">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: "calc(100% - 120px)" }}>
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--primary)" }} />
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                    Hi! I&apos;m your PG Finder assistant
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Ask me about PGs near your workplace!
                  </p>
                  <div className="mt-4 space-y-2">
                    {["Find PGs near Amazon Bangalore", "PGs near Infosys Hyderabad", "Microsoft Gachibowli PGs"].map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="block w-full text-left px-3 py-2 rounded-lg text-xs border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-3 ${
                      msg.role === "user"
                        ? "text-white"
                        : "border border-[var(--border)]"
                    }`}
                    style={
                      msg.role === "user"
                        ? { backgroundColor: "var(--primary)" }
                        : { backgroundColor: "var(--bg)" }
                    }
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.data?.branches && msg.data.branches.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.data.branches.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => handleBranchSelect(b)}
                            className="w-full flex items-center gap-2 p-2 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] transition-colors text-left"
                          >
                            <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--accent)" }} />
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{b.name || b.companyName}</p>
                              <p className="text-[10px] truncate" style={{ color: "var(--text-secondary)" }}>{b.cityName}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-xl p-3 border border-[var(--border)]" style={{ backgroundColor: "var(--bg)" }}>
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--primary)" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--border)] flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about PGs..."
                className="flex-1 h-9 text-sm"
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center text-white"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
