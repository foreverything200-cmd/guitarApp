import type { Song } from "@/types";

interface Props {
  song: Song;
  onClick: () => void;
}

export default function SongCard({ song, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="card flex items-center gap-4 p-3 text-left transition-all hover:shadow-md hover:bg-surface-50 active:scale-[0.99] w-full"
    >
      {/* Album Cover Thumbnail */}
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface-200">
        {song.albumCoverPath ? (
          <img
            src={song.albumCoverPath}
            alt={song.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl text-surface-400">
            🎵
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-surface-900">
          {song.title}
        </h3>
        <p className="truncate text-sm text-surface-500">{song.artist.name}</p>
      </div>

      {/* Arrow */}
      <svg
        className="h-5 w-5 flex-shrink-0 text-surface-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
}
