import type { Role } from "./types";

export type RoomAction = "play" | "pause" | "seek" | "setVideo" | "chat";

const PERMISSIONS: Record<Role, RoomAction[]> = {
  host: ["play", "pause", "seek", "setVideo", "chat"],
  guest: ["chat"],
};

/**
 * Client-side gate only. Without auth this is advisory: anyone can edit
 * their own browser. Real enforcement needs Supabase Auth plus private
 * Realtime channels with RLS policies.
 */
export function can(role: Role, action: RoomAction): boolean {
  return PERMISSIONS[role].includes(action);
}
