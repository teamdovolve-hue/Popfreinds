"use client";

import { useState } from "react";

export default function NamePrompt({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");

  return (
    <main className="flex h-screen items-center justify-center bg-slate-950 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSubmit(name);
        }}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl"
      >
        <div>
          <h1 className="text-lg font-semibold text-white">What should we call you?</h1>
          <p className="mt-1 text-sm text-slate-400">Your name shows up in chat and the people list.</p>
        </div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          placeholder="Your name"
          aria-label="Your name"
          className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 ring-1 ring-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          Continue
        </button>
      </form>
    </main>
  );
}
