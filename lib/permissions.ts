import type { Role } from "./types";

export type RoomAction = "play" | "pause" | "seek" | "chat";

const PERMISSIONS: Record<Role, RoomAction[]> = {
  host: ["play", "pause", "seek", "chat"],
  guest: ["chat"],
};

/**
 * Client-side gate for UI and optimistic updates only.
 * When you go live, enforce the same rule on the server
 * (Supabase RLS / authorized channels) since clients can be tampered with.
 */
export function can(role: Role, action: RoomAction): boolean {
  return PERMISSIONS[role].includes(action);
}
