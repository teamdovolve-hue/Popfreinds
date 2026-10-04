export type Role = "host" | "guest";

export interface Participant {
  id: string;
  name: string;
  role: Role;
  /** Tailwind bg class for the avatar */
  color: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  author: string;
  text: string;
  /** Unix ms */
  sentAt: number;
}

/**
 * Everything that travels over the wire. Keep this union small and
 * serializable: it maps 1:1 onto a Supabase Realtime broadcast payload.
 */
export type RoomEvent =
  | { type: "play"; senderId: string; time: number }
  | { type: "pause"; senderId: string; time: number }
  | { type: "seek"; senderId: string; time: number }
  | { type: "chat"; senderId: string; message: ChatMessage }
  | { type: "presence"; senderId: string; participants: Participant[] };

export type RoomEventHandler = (event: RoomEvent) => void;

/** The only surface the app needs from a realtime backend. */
export interface RoomTransport {
  /** Start receiving events. Returns an unsubscribe function. */
  subscribe(handler: RoomEventHandler): () => void;
  /** Broadcast an event to everyone else in the room. */
  send(event: RoomEvent): void | Promise<void>;
}
