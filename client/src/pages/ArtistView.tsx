import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { artists as artistsApi } from "@/services/api";
import type { Artist, Song, Category as CatType } from "@/types";
import SongCard from "@/components/SongCard";
import { sortByName } from "@/utils/sort";

export default function ArtistView() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const navigate = useNavigate();
  const cat = category as CatType;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      artistsApi.getById(id),
      artistsApi.getSongs(id),
    ])
      .then(([artistData, songsData]) => {
        setArtist(artistData);
        setArtistSongs(sortByName(songsData, "title"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <p className="text-lg text-surface-500">Artist not found</p>
        <button onClick={() => navigate(`/${cat}`)} className="btn-primary">Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface-50">
      <header className="sticky top-0 z-30 border-b border-surface-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(`/${cat}`)} className="btn-icon">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-surface-200">
              {artist.photoPath ? (
                <img src={artist.photoPath} alt={artist.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg">👤</div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">{artist.name}</h1>
              <p className="text-sm text-surface-500">{artistSongs.length} songs</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4">
        <div className="flex flex-col gap-2">
          {artistSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onClick={() => navigate(`/${cat}/song/${song.id}`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
