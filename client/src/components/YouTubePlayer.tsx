import { useState, useMemo } from "react";

interface Props {
  url: string;
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

export default function YouTubePlayer({ url }: Props) {
  const [speed, setSpeed] = useState(1);
  const videoId = useMemo(() => extractVideoId(url), [url]);

  if (!videoId) {
    return (
      <div className="rounded-lg bg-surface-100 p-4 text-center text-sm text-surface-500">
        Invalid YouTube URL
      </div>
    );
  }

  // Using youtube-nocookie for privacy/ad-free
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;

  return (
    <div>
      {/* Video */}
      <div className="relative w-full overflow-hidden rounded-xl bg-black" style={{ paddingTop: "56.25%" }}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={embedUrl}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Speed Controls */}
      <div className="mt-2 flex items-center gap-1 overflow-x-auto">
        <span className="mr-2 text-xs text-surface-500 whitespace-nowrap">Speed:</span>
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
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
      {speed !== 1 && (
        <p className="mt-1 text-xs text-surface-400">
          Note: Speed control via embedded iframe is limited. For full speed control, open in YouTube app.
        </p>
      )}
    </div>
  );
}
