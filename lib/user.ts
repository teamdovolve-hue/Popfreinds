// Lightweight identity: no auth SDK. Client-side only (uses browser storage).

export interface LocalUser {
  id: string;
  name: string;
}

const NAME_KEY = "wp:name";
const ID_KEY = "wp:uid";

const COLORS = [
  "bg-indigo-500",
  "bg-fuchsia-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-rose-500",
];

export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function colorFor(id: string): string {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}

/** Returns null until the person has picked a display name. */
export function getLocalUser(): LocalUser | null {
  try {
    const name = localStorage.getItem(NAME_KEY);
    if (!name) return null;
    // Per-tab id so you can test host + guest in two tabs of one browser.
    let id = sessionStorage.getItem(ID_KEY);
    if (!id) {
      id = newId();
      sessionStorage.setItem(ID_KEY, id);
    }
    return { id, name };
  } catch {
    return null;
  }
}

export function saveLocalUser(name: string): LocalUser {
  localStorage.setItem(NAME_KEY, name.trim().slice(0, 24));
  return getLocalUser() as LocalUser;
}

const hostKey = (roomId: string) => `wp:host:${roomId}`;

/** Called by whoever creates the room. */
export function markAsHost(roomId: string) {
  localStorage.setItem(hostKey(roomId), "1");
}

/** Host = created this room in this browser. Add ?guest=1 to the URL to test as a guest. */
export function isHostOf(roomId: string): boolean {
  if (new URLSearchParams(window.location.search).has("guest")) return false;
  return localStorage.getItem(hostKey(roomId)) === "1";
}
