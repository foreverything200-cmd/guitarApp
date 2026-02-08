import type { Artist } from "@/types";

interface Props {
  artist: Artist;
  onClick: () => void;
}

export default function ArtistCard({ artist, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="card flex flex-col items-center gap-3 p-4 text-center transition-all hover:shadow-md hover:bg-surface-50 active:scale-[0.98]"
    >
      <div className="h-20 w-20 overflow-hidden rounded-full bg-surface-200">
        {artist.photoPath ? (
          <img
            src={artist.photoPath}
            alt={artist.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-surface-400">
            👤
          </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-surface-900 line-clamp-1">
          {artist.name}
        </h3>
        <p className="text-xs text-surface-500">
          {artist._count?.songs || 0} songs
        </p>
      </div>
    </button>
  );
}
