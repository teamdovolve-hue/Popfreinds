"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { parseVideoSource } from "@/lib/video-source";

interface VideoSourceBarProps {
  onSubmit: (src: string) => void;
}

/** Host-only: paste a YouTube link (or direct .mp4 URL) to load for everyone. */
export default function VideoSourceBar({ onSubmit }: VideoSourceBarProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const src = parseVideoSource(value);
    if (!src) {
      setError("Paste a YouTube link or a direct .mp4 link.");
      return;
    }
    setError(null);
    onSubmit(src);
    setValue("");
  };

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl bg-slate-900 py-1.5 pl-3 pr-1.5 ring-1 ring-white/10 transition focus-within:ring-2 focus-within:ring-indigo-500">
        <Link2 className="h-4 w-4 shrink-0 text-slate-500" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Paste a YouTube link"
          aria-label="Video link"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        <button
          onClick={submit}
          disabled={!value.trim()}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          Load video
        </button>
      </div>
      {error && <p className="mt-1.5 px-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
