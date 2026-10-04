"use client";

import { useEffect, useRef, useState } from "react";
import { Crown, Eye, Lock, Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import RangeSlider from "./RangeSlider";
import { formatDuration } from "@/lib/format";
import type { Role } from "@/lib/types";

interface VideoPlayerProps {
  src: string;
  role: Role;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  /** True when this user is allowed to play, pause and seek */
  canControl: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onTimeUpdate: (time: number) => void;
  onDuration: (duration: number) => void;
}

/** Playback is fully controlled by props, so remote events can drive it. */
export default function VideoPlayer({
  src,
  role,
  isPaused,
  currentTime,
  duration,
  canControl,
  onPlay,
  onPause,
  onSeek,
  onTimeUpdate,
  onDuration,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [scrub, setScrub] = useState<number | null>(null);

  // Mirror shared play/pause state onto the element
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPaused) v.pause();
    else v.play().catch(() => {
      /* Autoplay can be blocked until the viewer interacts with the page */
    });
  }, [isPaused]);

  // Correct drift after a remote seek (ignore normal playback progress)
  useEffect(() => {
    const v = videoRef.current;
    if (v && Math.abs(v.currentTime - currentTime) > 1.5) v.currentTime = currentTime;
  }, [currentTime]);

  // Volume is always local
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted = muted;
  }, [volume, muted]);

  const togglePlay = () => {
    if (!canControl) return;
    if (isPaused) onPlay();
    else onPause();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen?.();
  };

  const shownTime = scrub ?? currentTime;
  const controlHint = canControl ? undefined : "Only the host can control playback";

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-indigo-950/40 ring-1 ring-white/10"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(99,102,241,0.16),transparent_65%)]" />

      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => onDuration(e.currentTarget.duration)}
        onEnded={() => canControl && onPause()}
        className={`absolute inset-0 h-full w-full object-contain ${canControl ? "cursor-pointer" : ""}`}
      />

      {/* Big play affordance while paused */}
      {isPaused && (
        <button
          onClick={togglePlay}
          disabled={!canControl}
          aria-label="Play"
          title={controlHint}
          className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md transition enabled:hover:scale-105 enabled:hover:bg-white/20 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          {canControl ? <Play className="ml-1 h-8 w-8" /> : <Lock className="h-7 w-7" />}
        </button>
      )}

      {/* Who has control */}
      <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-white/10 backdrop-blur-md">
        {role === "host" ? (
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

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12 sm:px-6">
        <RangeSlider
          label="Seek"
          value={shownTime}
          max={duration}
          disabled={!canControl || duration === 0}
          onChange={setScrub}
          onCommit={(t) => {
            onSeek(t);
            setScrub(null);
          }}
          className="mb-3 w-full"
        />

        <div className="flex items-center gap-4 text-slate-200">
          <button
            onClick={togglePlay}
            disabled={!canControl}
            aria-label={isPaused ? "Play" : "Pause"}
            title={controlHint}
            className="rounded-md p-1 transition enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
              className="rounded-md p-1 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <RangeSlider
              label="Volume"
              value={muted ? 0 : volume}
              max={1}
              step={0.02}
              onChange={(v) => {
                setVolume(v);
                setMuted(v === 0);
              }}
              className="hidden w-20 sm:block"
            />
          </div>

          <span className="text-xs tabular-nums text-slate-400">
            {formatDuration(shownTime)} <span className="text-slate-600">/</span> {formatDuration(duration)}
          </span>

          <button
            onClick={toggleFullscreen}
            aria-label="Fullscreen"
            className="ml-auto rounded-md p-1 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
