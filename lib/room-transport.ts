import { MOCK_GUEST_ID, MOCK_REPLIES } from "./mock-data";
import type { RoomEvent, RoomEventHandler, RoomTransport } from "./types";

/**
 * Mock transport: no network. It only replies to your chat messages
 * with a fake guest message so the UI feels alive.
 */
export function createMockTransport(_roomId: string): RoomTransport {
  const handlers = new Set<RoomEventHandler>();
  const emit = (event: RoomEvent) => handlers.forEach((h) => h(event));

  return {
    subscribe(handler) {
      handlers.add(handler);
      return () => {
        handlers.delete(handler);
      };
    },
    send(event) {
      if (event.type !== "chat") return;
      setTimeout(() => {
        emit({
          type: "chat",
          senderId: MOCK_GUEST_ID,
          message: {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            senderId: MOCK_GUEST_ID,
            author: "Maya",
            text: MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)],
            sentAt: Date.now(),
          },
        });
      }, 1200);
    },
  };
}

/**
 * The one line to change when Supabase goes in:
 *   export const createRoomTransport = createSupabaseTransport;
 */
export const createRoomTransport = createMockTransport;

/* ─────────────────────────────────────────────────────────────
 * Supabase Realtime version (npm i @supabase/supabase-js)
 * ─────────────────────────────────────────────────────────────
 *
 * import { createClient } from "@supabase/supabase-js";
 *
 * export function createSupabaseTransport(roomId: string): RoomTransport {
 *   const supabase = createClient(
 *     process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 *   );
 *   const channel = supabase.channel(`room:${roomId}`, {
 *     config: { broadcast: { self: false } }, // don't echo our own events
 *   });
 *
 *   return {
 *     subscribe(handler) {
 *       channel
 *         .on("broadcast", { event: "room" }, ({ payload }) => handler(payload as RoomEvent))
 *         .subscribe();
 *       return () => { supabase.removeChannel(channel); };
 *     },
 *     send(event) {
 *       channel.send({ type: "broadcast", event: "room", payload: event });
 *     },
 *   };
 * }
 *
 * For participants, use channel.track() / presence sync instead of the
 * "presence" event, then feed the result into setParticipants.
 */
