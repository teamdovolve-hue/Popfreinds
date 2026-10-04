export type Role = "host" | "guest";
export type ConnectionStatus = "connecting" | "live" | "error";

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

interface EventBase {
  senderId: string;
  senderRole: Role;
}

/** Everything that travels over Supabase Broadcast. */
export type RoomEvent =
  | (EventBase & { type: "chat"; message: ChatMessage })
  | (EventBase & { type: "sync-request" })
  | (EventBase & { type: "sync"; src: string; time: number; paused: boolean })
  | (EventBase & { type: "video"; src: string })
  | (EventBase & { type: "play" | "pause" | "seek"; time: number });

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type RoomEventBody = DistributiveOmit<RoomEvent, "senderId" | "senderRole">;

export interface TransportHandlers {
  onEvent: (event: RoomEvent) => void;
  onPresence: (participants: Participant[]) => void;
  onStatus: (status: ConnectionStatus) => void;
}

export interface RoomTransport {
  /** Join the room channel. Returns a disconnect function. */
  connect(me: Participant, handlers: TransportHandlers): () => void;
  send(event: RoomEvent): void;
}

/** Imperative controls the sync hook needs from the video player. */
export interface PlayerHandle {
  play(): Promise<void>;
  pause(): void;
  seekTo(time: number): void;
  getTime(): number;
  isPaused(): boolean;
}
