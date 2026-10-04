import { Crown } from "lucide-react";
import type { Participant } from "@/lib/types";

interface ParticipantsListProps {
  participants: Participant[];
  selfId: string;
}

export default function ParticipantsList({ participants, selfId }: ParticipantsListProps) {
  return (
    <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
      {participants.map((p) => (
        <li key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-800/60">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ${p.color}`}
          >
            {p.name[0]}
          </span>
          <span className="flex-1 truncate text-sm font-medium text-slate-100">
            {p.name}
            {p.id === selfId && <span className="ml-1.5 text-xs font-normal text-slate-500">(you)</span>}
          </span>
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              p.role === "host" ? "bg-amber-500/15 text-amber-300" : "bg-slate-800 text-slate-400"
            }`}
          >
            {p.role === "host" && <Crown className="h-3 w-3" />}
            {p.role === "host" ? "Host" : "Guest"}
          </span>
        </li>
      ))}
    </ul>
  );
}
