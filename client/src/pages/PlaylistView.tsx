import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  playlists as playlistsApi,
  songs as songsApi,
} from "@/services/api";
import type { Playlist, Song, Category as CatType } from "@/types";
import SongCard from "@/components/SongCard";

export default function PlaylistView() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const navigate = useNavigate();
  const cat = category as CatType;

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSong, setShowAddSong] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const fetchPlaylist = useCallback(async () => {
    if (!id) return;
    try {
      const data = await playlistsApi.getById(id);
      setPlaylist(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

  const handleAddSongOpen = async () => {
    setShowAddSong(true);
    const data = await songsApi.getAll(cat);
    setAllSongs(data);
  };

  const handleAddSong = async (songId: string) => {
    if (!id) return;
    await playlistsApi.addSong(id, songId);
    setShowAddSong(false);
    fetchPlaylist();
  };

  const handleRemoveSong = async (songId: string) => {
    if (!id) return;
    await playlistsApi.removeSong(id, songId);
    fetchPlaylist();
  };

  const handleShuffle = async () => {
    if (!id) return;
    try {
      const song = await playlistsApi.getRandomSong(id);
      navigate(`/${cat}/song/${song.id}`);
    } catch {
      alert("No songs in this playlist");
    }
  };

  const playlistSongs = playlist?.songs?.map((ps) => ps.song) || [];
  const playlistSongIds = new Set(playlistSongs.map((s) => s.id));
  const filteredAllSongs = allSongs.filter(
    (s) =>
      !playlistSongIds.has(s.id) &&
      (s.title.toLowerCase().includes(searchQ.toLowerCase()) ||
        s.artist.name.toLowerCase().includes(searchQ.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface-50">
      <header className="sticky top-0 z-30 border-b border-surface-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(`/${cat}/playlists`)} className="btn-icon">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold">{playlist?.name || "Playlist"}</h1>
            <p className="text-sm text-surface-500">{playlistSongs.length} songs</p>
          </div>
          <div className="flex-1" />
          <button onClick={handleShuffle} className="btn-secondary text-sm">🔀 Shuffle</button>
          <button onClick={handleAddSongOpen} className="btn-primary text-sm">+ Add Song</button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4">
        {/* Add Song Modal */}
        {showAddSong && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="card w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-bold">Add Song to Playlist</h2>
                <button onClick={() => setShowAddSong(false)} className="btn-icon">✕</button>
              </div>
              <div className="p-4">
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search songs..."
                  className="input"
                  autoFocus
                />
              </div>
              <div className="flex-1 overflow-y-auto p-4 pt-0">
                {filteredAllSongs.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => handleAddSong(song.id)}
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-surface-100"
                  >
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-surface-200">
                      {song.albumCoverPath ? (
                        <img src={song.albumCoverPath} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm">🎵</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{song.title}</p>
                      <p className="truncate text-sm text-surface-500">{song.artist.name}</p>
                    </div>
                    <span className="text-sm text-primary-600">+ Add</span>
                  </button>
                ))}
                {filteredAllSongs.length === 0 && (
                  <p className="py-8 text-center text-surface-400">No more songs to add</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Playlist Songs */}
        {playlistSongs.length === 0 ? (
          <p className="py-20 text-center text-surface-400">
            This playlist is empty. Add some songs!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {playlistSongs.map((song) => (
              <div key={song.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <SongCard
                    song={song}
                    onClick={() => navigate(`/${cat}/song/${song.id}`)}
                  />
                </div>
                <button
                  onClick={() => handleRemoveSong(song.id)}
                  className="btn-icon text-red-500 flex-shrink-0"
                  title="Remove from playlist"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
