import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSongs } from "@/hooks/useSongs";
import { songs as songsApi, artists as artistsApi } from "@/services/api";
import type { Category as CategoryType, BrowseMode, Artist, Song } from "@/types";
import SearchBar from "@/components/SearchBar";
import SongCard from "@/components/SongCard";
import ArtistCard from "@/components/ArtistCard";
import { sortByName } from "@/utils/sort";
import { useEffect } from "react";

export default function Category() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const cat = category as CategoryType;

  const [browseMode, setBrowseMode] = useState<BrowseMode>("songs");
  const [searchQuery, setSearchQuery] = useState("");
  const [artistsList, setArtistsList] = useState<Artist[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(false);

  const { songs, loading, refetch } = useSongs({
    category: cat,
    browseMode,
    searchQuery,
  });

  // Fetch artists when switching to artists tab
  useEffect(() => {
    if (browseMode === "artists") {
      setLoadingArtists(true);
      artistsApi
        .getAll(cat)
        .then((data) => setArtistsList(sortByName(data, "name")))
        .catch(console.error)
        .finally(() => setLoadingArtists(false));
    }
  }, [browseMode, cat]);

  const handleShuffle = useCallback(async () => {
    try {
      const song = await songsApi.getRandom(cat);
      navigate(`/${cat}/song/${song.id}`);
    } catch {
      alert("No songs available to shuffle");
    }
  }, [cat, navigate]);

  const title = cat === "jewish" ? "Jewish Music" : "Non-Jewish Music";
  const emoji = cat === "jewish" ? "✡️" : "🎵";

  const browseModes: { key: BrowseMode; label: string }[] = [
    { key: "songs", label: "By Song" },
    { key: "artists", label: "By Artist" },
    { key: "known", label: "Known Songs" },
    { key: "learning", label: "Learning" },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-surface-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/")} className="btn-icon" title="Back">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>

          <h1 className="flex items-center gap-2 text-xl font-bold">
            <span>{emoji}</span> {title}
          </h1>

          <span className="ml-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
            {songs.length}
          </span>

          <div className="flex-1" />

          {/* Action buttons */}
          <button onClick={() => navigate(`/${cat}/playlists`)} className="btn-ghost text-sm" title="Playlists">
            📋 Playlists
          </button>
          <button onClick={() => navigate("/tuner")} className="btn-ghost text-sm" title="Tuner">
            🎸 Tuner
          </button>
          <button onClick={() => navigate(`/${cat}/add`)} className="btn-primary text-sm">
            + Add Song
          </button>
          <button onClick={handleShuffle} className="btn-secondary text-sm" title="Shuffle">
            🔀 Shuffle
          </button>
        </div>

        {/* Search */}
        <div className="mx-auto max-w-7xl px-4 pb-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`Search songs or artists in ${title.toLowerCase()}...`}
          />
        </div>

        {/* Browse Tabs */}
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
          {browseModes.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setBrowseMode(key); setSearchQuery(""); }}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                browseMode === key
                  ? "bg-primary-600 text-white"
                  : "bg-surface-100 text-surface-600 hover:bg-surface-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 p-4">
        {loading || loadingArtists ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : browseMode === "artists" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {artistsList.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                onClick={() => navigate(`/${cat}/artist/${artist.id}`)}
              />
            ))}
            {artistsList.length === 0 && (
              <p className="col-span-full py-10 text-center text-surface-400">No artists found</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onClick={() => navigate(`/${cat}/song/${song.id}`)}
              />
            ))}
            {songs.length === 0 && (
              <p className="py-10 text-center text-surface-400">
                {browseMode === "known"
                  ? "No songs match your known chords yet. Mark some chords as known!"
                  : browseMode === "learning"
                  ? "No songs match your learning chords. Mark some chords!"
                  : "No songs found"}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
