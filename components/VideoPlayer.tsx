"use client";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { MediaPlayer, MediaProvider, type MediaPlayerInstance } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import { Crown, Eye, Film, Play } from "lucide-react";
import type { PlayerHandle } from "@/lib/types";

interface VideoPlayerProps {
  /** Vidstack src: "youtube/<id>" or a direct media URL. Empty = nothing loaded. */
  src: string;
  isHost: boolean;
  canControl: boolean;
  /** Guests must click once before playback can start (browser autoplay rules). */
  joined: boolean;
  onJoin: () => void;
  onPlay: () => void;
  onPause: () => void;
  onSeeked: () => void;
  onReady: () => void;
}

const VideoPlayer = forwardRef<PlayerHandle, VideoPlayerProps>(function VideoPlayer(
  { src, isHost, canControl, joined, onJoin, onPlay, onPause, onSeeked, onReady },
  ref
) {
  const player = useRef<MediaPlayerInstance>(null);

  useImperativeHandle(
    ref,
    () => ({
      play: () => player.current?.play() ?? Promise.resolve(),
      pause: () => {
        player.current?.pause();
      },
      seekTo: (time) => {
        if (player.current) player.current.currentTime = time;
      },
      getTime: () => player.current?.currentTime ?? 0,
      isPaused: () => player.current?.paused ?? true,
    }),
    []
  );

  return (
    <div
      data-locked={!canControl}
      className="relative h-full w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-indigo-950/40 ring-1 ring-white/10"
    >
      {src ? (
        <MediaPlayer
          ref={player}
          title="Watch party"
          src={src}
          playsInline
          keyDisabled={!canControl}
          onPlay={onPlay}
          onPause={onPause}
          onSeeked={onSeeked}
          onCanPlay={onReady}
          className="aspect-auto h-full w-full [--media-brand:#6366f1]"
        >
          <MediaProvider />
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_50%_40%,rgba(99,102,241,0.16),transparent_65%)] px-6 text-center">
          <Film className="h-10 w-10 text-slate-600" />
          <p className="text-sm text-slate-400">
            {isHost ? "Paste a YouTube link above to start the party." : "Waiting for the host to pick a video."}
          </p>
        </div>
      )}

      {/* Who has control */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-white/10 backdrop-blur-md">
        {isHost ? (
          <>
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            Host · You have control
          </>
        ) : (
          <>
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            Guest · Host has control
          </>
        )}
      </div>

      {/* One-time click for guests */}
      {src && !joined && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <button
            onClick={onJoin}
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            <Play className="h-4 w-4" />
            Join the party
          </button>
        </div>
      )}
    </div>
  );
});

export default VideoPlayer;
