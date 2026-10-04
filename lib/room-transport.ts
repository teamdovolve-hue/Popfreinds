import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import type { Participant, RoomEvent, RoomTransport } from "./types";

/**
 * Supabase Realtime transport.
 *  - Broadcast carries chat and playback events (ephemeral, not stored).
 *  - Presence carries who is in the room.
 */
export function createRoomTransport(roomId: string): RoomTransport {
  let channel: RealtimeChannel | null = null;

  return {
    connect(me, { onEvent, onPresence, onStatus }) {
      let supabase: SupabaseClient;
      try {
        supabase = getSupabase();
      } catch (err) {
        console.error(err);
        onStatus("error");
        return () => {};
      }

      const ch = supabase.channel(`room:${roomId}`, {
        config: {
          broadcast: { self: false }, // don't receive our own events
          presence: { key: me.id },
        },
      });
      channel = ch;

      ch.on("broadcast", { event: "room" }, ({ payload }) => onEvent(payload as RoomEvent))
        .on("presence", { event: "sync" }, () => {
          const people: Participant[] = Object.values(ch.presenceState<Participant>())
            .flatMap((metas) => metas.slice(0, 1))
            .map(({ id, name, role, color }) => ({ id, name, role, color }));
          onPresence(people);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            onStatus("live");
            await ch.track(me);
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            onStatus("error");
          } else if (status === "CLOSED") {
            onStatus("connecting");
          }
        });

      return () => {
        supabase.removeChannel(ch);
        if (channel === ch) channel = null;
      };
    },

    send(event) {
      void channel?.send({ type: "broadcast", event: "room", payload: event });
    },
  };
}
