import { useState, useMemo, useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface Props {
  url: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// Global YT API loader
let apiLoaded = false;
let apiReady = false;
const apiReadyCallbacks: (() => void)[] = [];

function loadYTApi(): Promise<void> {
  return new Promise((resolve) => {
    if (apiReady) { resolve(); return; }
    apiReadyCallbacks.push(resolve);
    if (!apiLoaded) {
      apiLoaded = true;
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => {
        apiReady = true;
        apiReadyCallbacks.forEach((cb) => cb());
        apiReadyCallbacks.length = 0;
      };
    }
  });
}

export default function YouTubePlayer({ url, onProgress, onPlayStateChange }: Props) {
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = useMemo(() => extractVideoId(url), [url]);
  const playerRef = useRef<any>(null);
  const playerDivRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<number>(0);
  const onProgressRef = useRef(onProgress);
  const onPlayStateRef = useRef(onPlayStateChange);

  onProgressRef.current = onProgress;
  onPlayStateRef.current = onPlayStateChange;

  useEffect(() => {
    if (!videoId || !playerDivRef.current) return;

    let player: any = null;
    let destroyed = false;

    const init = async () => {
      await loadYTApi();
      if (destroyed || !playerDivRef.current) return;

      // Create a target div inside the container
      const targetId = `yt-${videoId}-${Date.now()}`;
      const targetEl = document.createElement("div");
      targetEl.id = targetId;
      playerDivRef.current.innerHTML = "";
      playerDivRef.current.appendChild(targetEl);

      player = new window.YT.Player(targetId, {
        videoId,
        width: "100%",
        height: "100%",
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (destroyed) return;
            playerRef.current = player;
            // Make the iframe fill the container
            const iframe = playerDivRef.current?.querySelector("iframe");
            if (iframe) {
              iframe.style.position = "absolute";
              iframe.style.top = "0";
              iframe.style.left = "0";
              iframe.style.width = "100%";
              iframe.style.height = "100%";
              iframe.style.borderRadius = "12px";
            }
          },
          onStateChange: (event: any) => {
            if (destroyed) return;
            const playing = event.data === window.YT.PlayerState.PLAYING;
            setIsPlaying(playing);
            onPlayStateRef.current?.(playing);
          },
        },
      });
    };

    init();

    return () => {
      destroyed = true;
      clearInterval(pollRef.current);
      try { player?.destroy(); } catch {}
      playerRef.current = null;
    };
  }, [videoId]);

  // Poll progress while playing
  useEffect(() => {
    if (isPlaying) {
      pollRef.current = window.setInterval(() => {
        const p = playerRef.current;
        if (!p?.getCurrentTime || !p?.getDuration) return;
        const t = p.getCurrentTime();
        const d = p.getDuration();
        if (d > 0) onProgressRef.current?.(t, d);
      }, 150); // Poll more frequently for smoother tracking
    } else {
      clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [isPlaying]);

  const handleSpeed = useCallback((s: number) => {
    setSpeed(s);
    try { playerRef.current?.setPlaybackRate(s); } catch {}
  }, []);

  if (!videoId) {
    return (
      <div className="rounded-lg bg-surface-100 p-4 text-center text-sm text-surface-500">
        Invalid YouTube URL
      </div>
    );
  }

  return (
    <div>
      {/* 16:9 aspect ratio container */}
      <div
        ref={playerDivRef}
        className="relative w-full overflow-hidden rounded-xl bg-black"
        style={{ aspectRatio: "16 / 9" }}
      />

      {/* Speed Controls */}
      <div className="mt-2 flex items-center gap-1 overflow-x-auto">
        <span className="mr-1 text-xs text-surface-500 whitespace-nowrap">Speed:</span>
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleSpeed(s)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              speed === s
                ? "bg-primary-600 text-white"
                : "bg-surface-100 text-surface-600 hover:bg-surface-200"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {isPlaying && (
        <div className="mt-1 flex items-center gap-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs text-green-600 font-medium">Syncing lyrics</span>
        </div>
      )}
    </div>
  );
}
