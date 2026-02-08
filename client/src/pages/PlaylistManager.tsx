import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { playlists as playlistsApi } from "@/services/api";
import type { Playlist, Category as CatType } from "@/types";

export default function PlaylistManager() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const cat = category as CatType;

  const [lists, setLists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchLists = useCallback(async () => {
    try {
      const data = await playlistsApi.getAll(cat);
      setLists(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [cat]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await playlistsApi.create({ name: newName.trim(), category: cat });
    setNewName("");
    setShowCreate(false);
    fetchLists();
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    await playlistsApi.update(id, { name: editName.trim() });
    setEditingId(null);
    fetchLists();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete playlist "${name}"?`)) return;
    await playlistsApi.delete(id);
    fetchLists();
  };

  return (
    <div className="min-h-dvh bg-surface-50">
      <header className="sticky top-0 z-30 border-b border-surface-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(`/${cat}`)} className="btn-icon">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">📋 Playlists</h1>
          <div className="flex-1" />
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
            + New Playlist
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4">
        {/* Create form */}
        {showCreate && (
          <div className="card mb-4 flex items-center gap-3 p-4">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Playlist name..."
              className="input flex-1"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button onClick={handleCreate} className="btn-primary text-sm">Create</button>
            <button onClick={() => setShowCreate(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : lists.length === 0 ? (
          <p className="py-20 text-center text-surface-400">
            No playlists yet. Create one!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {lists.map((pl) => (
              <div
                key={pl.id}
                className="card flex items-center gap-4 p-4 transition-colors hover:bg-surface-50"
              >
                {editingId === pl.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input flex-1"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleRename(pl.id)}
                    />
                    <button onClick={() => handleRename(pl.id)} className="btn-primary text-sm">Save</button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost text-sm">Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate(`/${cat}/playlists/${pl.id}`)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <span className="text-2xl">📋</span>
                      <div>
                        <h3 className="font-semibold text-surface-900">{pl.name}</h3>
                        <p className="text-sm text-surface-500">
                          {pl._count?.songs || 0} songs
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => { setEditingId(pl.id); setEditName(pl.name); }}
                      className="btn-icon text-sm"
                      title="Rename"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(pl.id, pl.name)}
                      className="btn-icon text-sm text-red-500"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
