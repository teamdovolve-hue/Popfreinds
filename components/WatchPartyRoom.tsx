"use client";

import Sidebar from "./Sidebar";
import VideoPlayer from "./VideoPlayer";
import { useRoomSync } from "@/hooks/useRoomSync";
import { MOCK_VIDEO_SRC, SELF_ID } from "@/lib/mock-data";

export default function WatchPartyRoom({ roomId }: { roomId: string }) {
  const room = useRoomSync({ roomId, selfId: SELF_ID, initialRole: "host" });

  return (
    <main className="flex h-screen flex-col gap-3 bg-slate-950 p-3 text-slate-100 lg:flex-row lg:gap-4 lg:p-4">
      <section className="aspect-video w-full shrink-0 lg:aspect-auto lg:h-full lg:w-[70%]">
        <VideoPlayer
          src={MOCK_VIDEO_SRC}
          role={room.role}
          isPaused={room.isPaused}
          currentTime={room.currentTime}
          duration={room.duration}
          canControl={room.canControl}
          onPlay={room.play}
          onPause={room.pause}
          onSeek={room.seek}
          onTimeUpdate={room.reportTime}
          onDuration={room.setDuration}
        />
      </section>

      <Sidebar
        className="flex-1 lg:w-[30%] lg:flex-none"
        roomId={roomId}
        selfId={SELF_ID}
        role={room.role}
        participants={room.participants}
        messages={room.messages}
        onSendMessage={room.sendMessage}
        onRoleChange={room.setRole}
      />
    </main>
  );
}
