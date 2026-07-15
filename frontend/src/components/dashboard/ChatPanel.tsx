"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import { api, getErrorMessage } from "@/lib/api";
import type { ChatMessage } from "@/types";

export default function ChatPanel({ courseId }: { courseId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get<ChatMessage[]>(`/api/courses/${courseId}/chat`)
      .then((res) => setMessages(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoadingHistory(false));
  }, [courseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const optimisticUser: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setInput("");
    setSending(true);

    try {
      const res = await api.post<ChatMessage>(`/api/courses/${courseId}/chat`, { message: text });
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="flex h-[calc(100vh-260px)] min-h-[420px] flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">Loading conversation…</div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-zinc-400">
            <Sparkles size={26} className="text-brand-300" />
            <p className="text-sm">Ask Notera anything about this course.</p>
            <p className="max-w-xs text-xs">
              e.g. &ldquo;Explain binary search trees&rdquo; or &ldquo;What are the most important topics for the exam?&rdquo;
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={clsx(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                  m.role === "user"
                    ? "bg-brand-500 text-white rounded-br-sm"
                    : "bg-zinc-100 text-zinc-800 rounded-bl-sm prose-notera"
                )}
              >
                {m.role === "assistant" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-zinc-100 px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-zinc-100 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Ask Notera about this course…"
          className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </Card>
  );
}
