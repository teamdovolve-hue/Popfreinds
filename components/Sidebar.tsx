"use client";

import { useState } from "react";
import { Check, Copy, MessageSquare, Users } from "lucide-react";
import ChatBox from "./ChatBox";
import ParticipantsList from "./ParticipantsList";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import type { ChatMessage, ConnectionStatus, Participant } from "@/lib/types";

interface SidebarProps {
  roomId: string;
  selfId: string;
  status: ConnectionStatus;
  participants: Participant[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  className?: string;
}

type Tab = "chat" | "people";

const STATUS_UI: Record<ConnectionStatus, { label: string; dot: string }> = {
  live: { label: "Live", dot: "bg-emerald-400" },
  connecting: { label: "Connecting", dot: "bg-amber-400 animate-pulse" },
  error: { label: "Offline", dot: "bg-rose-500" },
};

export default function Sidebar({
  roomId,
  selfId,
  status,
  participants,
  messages,
  onSendMessage,
  className = "",
}: SidebarProps) {
  const [tab, setTab] = useState<Tab>("chat");
  const { copied, copy } = useCopyToClipboard();
  const statusUi = STATUS_UI[status];

  const tabs = [
    { id: "chat" as const, label: "Chat", icon: MessageSquare, count: undefined },
    { id: "people" as const, label: "People", icon: Users, count: participants.length },
  ];

  return (
    <aside
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl ${className}`}
    >
      <header className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 ring-1 ring-white/5">
            Room ID: #{roomId}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-400" title="Connection status">
            <span className={`h-2 w-2 rounded-full ${statusUi.dot}`} />
            {statusUi.label}
          </span>
        </div>
        <button
          onClick={() => copy(`${window.location.origin}/room/${roomId}`)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Link copied" : "Copy invite link"}
        </button>
      </header>

      <div role="tablist" className="grid grid-cols-2 gap-1 p-2">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              tab === id
                ? "bg-slate-800 text-white shadow-inner"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {count !== undefined && (
              <span className="rounded-full bg-slate-700 px-1.5 text-[11px] text-slate-300">{count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "chat" ? (
        <ChatBox messages={messages} selfId={selfId} onSend={onSendMessage} />
      ) : (
        <ParticipantsList participants={participants} selfId={selfId} />
      )}
    </aside>
  );
}
