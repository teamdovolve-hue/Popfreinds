"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { can } from "@/lib/permissions";
import { createRoomTransport } from "@/lib/room-transport";
import { newId } from "@/lib/user";
import type {
  ChatMessage,
  ConnectionStatus,
  Participant,
  PlayerHandle,
  RoomEvent,
  RoomEventBody,
  RoomTransport,
} from "@/lib/types";

interface Options {
  roomId: string;
  /** Must be referentially stable (useMemo) or the channel reconnects. */
  me: Participant;
}

interface Expected {
  paused: boolean;
  time: number;
  /** Date.now() when `time` was recorded */
  at: number;
}

const DRIFT_SECONDS = 1.5;
const HEARTBEAT_MS = 5000;
const MAX_MESSAGES = 200;

const projectTime = (e: Expected) => (e.paused ? e.time : e.time + (Date.now() - e.at) / 1000);

/**
 * Room state + sync.
 *
 * Host is the only source of truth for playback:
 *   host player event → broadcast play/pause/seek (+ heartbeat "sync" every 5s)
 *   guest receives    → updates `expected` → drives the local player
 * Guests that try to control playback are snapped back to `expected`.
 */
export function useRoomSync({ roomId, me }: Options) {
  const isHost = me.role === "host";

  const [participants, setParticipants] = useState<Participant[]>([me]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [src, setSrc] = useState("");
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  // Guests must click once so the browser allows audio/autoplay.
  const [joined, setJoined] = useState(isHost);

  const playerRef = useRef<PlayerHandle>(null);
  const transportRef = useRef<RoomTransport | null>(null);
  const expected = useRef<Expected>({ paused: true, time: 0, at: Date.now() });
  const srcRef = useRef(src);
  srcRef.current = src;
  const joinedRef = useRef(joined);
  joinedRef.current = joined;

  const send = useCallback(
    (body: RoomEventBody) => {
      transportRef.current?.send({ ...body, senderId: me.id, senderRole: me.role } as RoomEvent);
    },
    [me.id, me.role]
  );

  /** Drive the local player to match a (paused, time) target. */
  const applyPlayback = useCallback((paused: boolean, time: number) => {
    expected.current = { paused, time, at: Date.now() };
    const p = playerRef.current;
    if (!p) return;
    if (Math.abs(p.getTime() - time) > DRIFT_SECONDS) p.seekTo(time);
    if (paused) {
      p.pause();
    } else if (joinedRef.current) {
      p.play().catch(() => setJoined(false)); // blocked → ask for a click again
    }
  }, []);

  /** Guest tried to take control: put the player back where the host says it is. */
  const restore = useCallback(() => {
    const p = playerRef.current;
    if (!p || !joinedRef.current) return;
    const target = projectTime(expected.current);
    if (Math.abs(p.getTime() - target) > 2) p.seekTo(target);
    if (expected.current.paused && !p.isPaused()) p.pause();
    if (!expected.current.paused && p.isPaused()) p.play().catch(() => {});
  }, []);

  const sendSync = useCallback(() => {
    const p = playerRef.current;
    if (!p || !srcRef.current) return;
    send({ type: "sync", src: srcRef.current, time: p.getTime(), paused: p.isPaused() });
  }, [send]);

  const handleEvent = useCallback(
    (e: RoomEvent) => {
      if (e.senderId === me.id) return;
      const fromHost = e.senderRole === "host";

      switch (e.type) {
        case "chat":
          setMessages((prev) =>
            prev.some((m) => m.id === e.message.id) ? prev : [...prev, e.message].slice(-MAX_MESSAGES)
          );
          break;
        case "sync-request":
          if (isHost) sendSync();
          break;
        case "video":
          if (!fromHost) break;
          expected.current = { paused: true, time: 0, at: Date.now() };
          setSrc(e.src);
          break;
        case "sync":
          if (!fromHost) break;
          if (e.src !== srcRef.current) setSrc(e.src);
          applyPlayback(e.paused, e.time);
          break;
        case "play":
          if (fromHost) applyPlayback(false, e.time);
          break;
        case "pause":
          if (fromHost) applyPlayback(true, e.time);
          break;
        case "seek":
          if (fromHost) applyPlayback(expected.current.paused, e.time);
          break;
      }
    },
    [me.id, isHost, sendSync, applyPlayback]
  );

  // Connect to the room
  useEffect(() => {
    const transport = createRoomTransport(roomId);
    transportRef.current = transport;

    const disconnect = transport.connect(me, {
      onEvent: handleEvent,
      onPresence: (list) => setParticipants(list.length ? list : [me]),
      onStatus: (s) => {
        setStatus(s);
        if (s === "live" && !isHost) send({ type: "sync-request" });
      },
    });

    return () => {
      disconnect();
      transportRef.current = null;
    };
  }, [roomId, me, isHost, handleEvent, send]);

  // Host heartbeat: lets late joiners and drifting guests catch up
  useEffect(() => {
    if (!isHost) return;
    const id = setInterval(sendSync, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [isHost, sendSync]);

  // ── Player event handlers (wired to VideoPlayer) ──
  const onPlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (isHost) {
      expected.current = { paused: false, time: p.getTime(), at: Date.now() };
      send({ type: "play", time: p.getTime() });
    } else if (expected.current.paused) {
      restore();
    }
  }, [isHost, send, restore]);

  const onPause = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (isHost) {
      expected.current = { paused: true, time: p.getTime(), at: Date.now() };
      send({ type: "pause", time: p.getTime() });
    } else if (!expected.current.paused) {
      restore();
    }
  }, [isHost, send, restore]);

  const onSeeked = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (isHost) {
      expected.current = { ...expected.current, time: p.getTime(), at: Date.now() };
      send({ type: "seek", time: p.getTime() });
    } else {
      restore();
    }
  }, [isHost, send, restore]);

  /** Media is ready: guests jump to where the host currently is. */
  const onReady = useCallback(() => {
    if (!isHost) applyPlayback(expected.current.paused, projectTime(expected.current));
  }, [isHost, applyPlayback]);

  // ── Actions ──
  const join = useCallback(() => {
    joinedRef.current = true;
    setJoined(true);
    applyPlayback(expected.current.paused, projectTime(expected.current));
    send({ type: "sync-request" });
  }, [applyPlayback, send]);

  const changeVideo = useCallback(
    (nextSrc: string) => {
      if (!can(me.role, "setVideo")) return;
      expected.current = { paused: true, time: 0, at: Date.now() };
      setSrc(nextSrc);
      send({ type: "video", src: nextSrc });
    },
    [me.role, send]
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !can(me.role, "chat")) return;
      const message: ChatMessage = {
        id: newId(),
        senderId: me.id,
        author: me.name,
        text: trimmed,
        sentAt: Date.now(),
      };
      setMessages((prev) => [...prev, message].slice(-MAX_MESSAGES));
      send({ type: "chat", message });
    },
    [me.id, me.name, me.role, send]
  );

  return {
    isHost,
    canControl: can(me.role, "play"),
    participants,
    messages,
    src,
    status,
    joined,
    playerRef,
    onPlay,
    onPause,
    onSeeked,
    onReady,
    join,
    changeVideo,
    sendMessage,
  };
}
