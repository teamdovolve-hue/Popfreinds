"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard } from "lucide-react";
import { markAsHost, newId } from "@/lib/user";

export default function Home() {
  const router = useRouter();
  const [joinValue, setJoinValue] = useState("");

  const createRoom = () => {
    const id = newId().replace(/-/g, "").slice(0, 8);
    markAsHost(id);
    router.push(`/room/${id}`);
  };

  const joinRoom = () => {
    // Accepts a bare ID or a full invite link
    const id = joinValue.trim().replace(/[?#].*$/, "").split("/").filter(Boolean).pop();
    if (id) router.push(`/room/${id}`);
  };

  return (
    <main className="flex h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Clapperboard className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-white">Watch Party</h1>
            <p className="text-sm text-slate-400">Watch together, in sync.</p>
          </div>
        </div>

        <button
          onClick={createRoom}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          Create a room
        </button>

        <div className="flex items-center gap-2 rounded-xl bg-slate-800 py-1.5 pl-4 pr-1.5 ring-1 ring-white/5 transition focus-within:ring-2 focus-within:ring-indigo-500">
          <input
            value={joinValue}
            onChange={(e) => setJoinValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            placeholder="Room ID or invite link"
            aria-label="Room ID or invite link"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={joinRoom}
            disabled={!joinValue.trim()}
            className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Join
          </button>
        </div>
      </div>
    </main>
  );
}
