"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { formatClock } from "@/lib/format";
import type { ChatMessage } from "@/lib/types";

interface ChatBoxProps {
  messages: ChatMessage[];
  selfId: string;
  onSend: (text: string) => void;
}

export default function ChatBox({ messages, selfId, onSend }: ChatBoxProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    if (!draft.trim()) return;
    onSend(draft);
    setDraft("");
  };

  return (
    <>
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-3 [scrollbar-color:theme(colors.slate.700)_transparent] [scrollbar-width:thin]"
      >
        {messages.map((m) => {
          const mine = m.senderId === selfId;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <span className="mb-1 px-1 text-[11px] text-slate-500">
                {mine ? "You" : m.author} ·{" "}
                {/* Locale/timezone differ between server and client */}
                <time dateTime={new Date(m.sentAt).toISOString()} suppressHydrationWarning>
                  {formatClock(m.sentAt)}
                </time>
              </span>
              <p
                className={`max-w-[85%] break-words px-3.5 py-2 text-sm leading-relaxed ${
                  mine
                    ? "rounded-2xl rounded-br-md bg-indigo-600 text-white"
                    : "rounded-2xl rounded-bl-md bg-slate-800 text-slate-100"
                }`}
              >
                {m.text}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2 rounded-xl bg-slate-800 py-1.5 pl-4 pr-1.5 ring-1 ring-white/5 transition focus-within:ring-2 focus-within:ring-indigo-500">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Say something..."
            aria-label="Message"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={!draft.trim()}
            aria-label="Send message"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
