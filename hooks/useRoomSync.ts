"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { can } from "@/lib/permissions";
import { INITIAL_MESSAGES, mockParticipants } from "@/lib/mock-data";
import { createRoomTransport } from "@/lib/room-transport";
import type { ChatMessage, Participant, Role, RoomEvent } from "@/lib/types";

interface UseRoomSyncOptions {
  roomId: string;
  selfId: string;
  initialRole?: Role;
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Single source of truth for room state.
 *
 * Data flow (identical for mock and Supabase):
 *   local action → permission check → apply locally → transport.send
 *   remote event → transport handler → apply locally
 *
 * Only `lib/room-transport.ts` knows how events travel.
 */
export function useRoomSync({ roomId, selfId, initialRole = "host" }: UseRoomSyncOptions) {
  const [role, setRoleState] = useState<Role>(initialRole);
  const [participants, setParticipants] = useState<Participant[]>(() => mockParticipants(initialRole));
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const timeRef = useRef(0);
  const participantsRef = useRef(participants);
  participantsRef.current = participants;

  const transport = useMemo(() => createRoomTransport(roomId), [roomId]);

  const setTime = useCallback((t: number) => {
    timeRef.current = t;
    setCurrentTime(t);
  }, []);

  /** Applies any event (local or remote) to state. */
  const apply = useCallback(
    (event: RoomEvent) => {
      switch (event.type) {
        case "play":
          setTime(event.time);
          setIsPaused(false);
          break;
        case "pause":
          setTime(event.time);
          setIsPaused(true);
          break;
        case "seek":
          setTime(event.time);
          break;
        case "chat":
          setMessages((prev) =>
            prev.some((m) => m.id === event.message.id) ? prev : [...prev, event.message]
          );
          break;
        case "presence":
          setParticipants(event.participants);
          break;
      }
    },
    [setTime]
  );

  // Remote events
  useEffect(() => {
    const unsubscribe = transport.subscribe((event) => {
      if (event.senderId === selfId) return;

      // Only trust playback commands that come from the host.
      if (event.type === "play" || event.type === "pause" || event.type === "seek") {
        const sender = participantsRef.current.find((p) => p.id === event.senderId);
        if (sender?.role !== "host") return;
      }
      apply(event);
    });
    return unsubscribe;
  }, [transport, selfId, apply]);

  /** Apply optimistically, then broadcast. */
  const dispatch = useCallback(
    (event: RoomEvent) => {
      apply(event);
      void transport.send(event);
    },
    [apply, transport]
  );

  // Playback (host only)
  const play = useCallback(() => {
    if (!can(role, "play")) return;
    dispatch({ type: "play", senderId: selfId, time: timeRef.current });
  }, [role, selfId, dispatch]);

  const pause = useCallback(() => {
    if (!can(role, "pause")) return;
    dispatch({ type: "pause", senderId: selfId, time: timeRef.current });
  }, [role, selfId, dispatch]);

  const seek = useCallback(
    (time: number) => {
      if (!can(role, "seek")) return;
      dispatch({ type: "seek", senderId: selfId, time });
    },
    [role, selfId, dispatch]
  );

  /**
   * Called by the player's timeupdate. Local only, never broadcast.
   * (Later: have the host send a periodic "seek" heartbeat so late joiners
   * and drifting guests can resync.)
   */
  const reportTime = useCallback((t: number) => setTime(t), [setTime]);

  // Chat (everyone)
  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !can(role, "chat")) return;
      const author = participantsRef.current.find((p) => p.id === selfId)?.name ?? "You";
      dispatch({
        type: "chat",
        senderId: selfId,
        message: { id: uid(), senderId: selfId, author, text: trimmed, sentAt: Date.now() },
      });
    },
    [role, selfId, dispatch]
  );

  /** Dev-only: preview the UI as Host or Guest. Remove when auth lands. */
  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    setParticipants(mockParticipants(next));
  }, []);

  return {
    // state
    role,
    participants,
    messages,
    isPaused,
    currentTime,
    duration,
    canControl: can(role, "play"),
    // actions
    play,
    pause,
    seek,
    reportTime,
    setDuration,
    sendMessage,
    setRole,
  };
}
