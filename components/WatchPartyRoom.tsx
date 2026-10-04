"use client";

import { useEffect, useMemo, useState } from "react";
import NamePrompt from "./NamePrompt";
import Sidebar from "./Sidebar";
import VideoPlayer from "./VideoPlayer";
import VideoSourceBar from "./VideoSourceBar";
import { useRoomSync } from "@/hooks/useRoomSync";
import { colorFor, getLocalUser, isHostOf, saveLocalUser, type LocalUser } from "@/lib/user";
import type { Participant } from "@/lib/types";

/** Resolves who you are (browser storage) before joining the room. */
export default function WatchPartyRoom({ roomId }: { roomId: string }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getLocalUser());
    setReady(true);
  }, []);

  if (!ready) return <div className="h-screen bg-slate-950" />;
  if (!user) return <NamePrompt onSubmit={(name) => setUser(saveLocalUser(name))} />;
  return <Room roomId={roomId} user={user} />;
}

function Room({ roomId, user }: { roomId: string; user: LocalUser }) {
  const me = useMemo<Participant>(
    () => ({
      id: user.id,
      name: user.name,
      role: isHostOf(roomId) ? "host" : "guest",
      color: colorFor(user.id),
    }),
    [roomId, user.id, user.name]
  );

  const room = useRoomSync({ roomId, me });

  return (
    <main className="flex h-screen flex-col gap-3 bg-slate-950 p-3 text-slate-100 lg:flex-row lg:gap-4 lg:p-4">
      <section className="flex shrink-0 flex-col gap-3 lg:w-[70%]">
        {room.isHost && <VideoSourceBar onSubmit={room.changeVideo} />}
        <div className="aspect-video w-full lg:aspect-auto lg:min-h-0 lg:flex-1">
          <VideoPlayer
            ref={room.playerRef}
            src={room.src}
            isHost={room.isHost}
            canControl={room.canControl}
            joined={room.joined}
            onJoin={room.join}
            onPlay={room.onPlay}
            onPause={room.onPause}
            onSeeked={room.onSeeked}
            onReady={room.onReady}
          />
        </div>
      </section>

      <Sidebar
        className="flex-1 lg:w-[30%] lg:flex-none"
        roomId={roomId}
        selfId={me.id}
        status={room.status}
        participants={room.participants}
        messages={room.messages}
        onSendMessage={room.sendMessage}
      />
    </main>
  );
}
