import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { songs as songsApi } from "@/services/api";
import type { Category as CatType, SongFormData } from "@/types";

export default function AddEditSong() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const navigate = useNavigate();
  const cat = category as CatType;
  const isEdit = !!id;

  const [form, setForm] = useState<SongFormData>({
    title: "",
    artistName: "",
    category: cat,
    capoOriginal: 0,
    youtubeUrl: "",
    content: "",
  });
  const [albumPreview, setAlbumPreview] = useState<string | null>(null);
  const [chordSheetPreview, setChordSheetPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const chordInputRef = useRef<HTMLInputElement>(null);

  // Load existing song data for editing
  useEffect(() => {
    if (!id) return;
    songsApi
      .getById(id)
      .then((song) => {
        setForm({
          title: song.title,
          artistName: song.artist.name,
          category: song.category,
          capoOriginal: song.capoOriginal,
          youtubeUrl: song.youtubeUrl || "",
          content: song.content,
        });
        if (song.albumCoverPath) setAlbumPreview(song.albumCoverPath);
        if (song.chordSheetImage) setChordSheetPreview(song.chordSheetImage);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "capoOriginal" ? parseInt(value) || 0 : value,
    }));
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "albumCover" | "chordSheet"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, [field]: file }));
    const url = URL.createObjectURL(file);
    if (field === "albumCover") setAlbumPreview(url);
    else setChordSheetPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.artistName.trim()) {
      alert("Song title and artist name are required");
      return;
    }

    setSaving(true);
    try {
      if (isEdit && id) {
        await songsApi.update(id, form);
        navigate(`/${cat}/song/${id}`);
      } else {
        const song = await songsApi.create(form);
        navigate(`/${cat}/song/${song.id}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-surface-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="btn-icon">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{isEdit ? "Edit Song" : "Add Song"}</h1>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl p-4">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">
                Song Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input"
                placeholder="Enter song title..."
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">
                Artist Name *
              </label>
              <input
                name="artistName"
                value={form.artistName}
                onChange={handleChange}
                className="input"
                placeholder="Enter artist name..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-700">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="jewish">Jewish</option>
                  <option value="non-jewish">Non-Jewish</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-surface-700">
                  Original Capo
                </label>
                <select
                  name="capoOriginal"
                  value={form.capoOriginal}
                  onChange={handleChange}
                  className="input"
                >
                  {Array.from({ length: 15 }, (_, i) => (
                    <option key={i} value={i}>
                      Capo {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">
                YouTube URL
              </label>
              <input
                name="youtubeUrl"
                value={form.youtubeUrl}
                onChange={handleChange}
                className="input"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            {/* Album Cover Upload */}
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">
                Album Cover
              </label>
              <input
                ref={albumInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "albumCover")}
                className="hidden"
              />
              <div
                onClick={() => albumInputRef.current?.click()}
                className="flex h-40 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-surface-300 bg-surface-50 transition-colors hover:border-primary-400 hover:bg-primary-50"
              >
                {albumPreview ? (
                  <img
                    src={albumPreview}
                    alt="Album cover"
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="text-center text-surface-400">
                    <span className="text-3xl">📷</span>
                    <p className="mt-1 text-sm">Click to upload album cover</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chord Sheet Upload */}
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">
                Chord Sheet Image (optional)
              </label>
              <input
                ref={chordInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "chordSheet")}
                className="hidden"
              />
              <div
                onClick={() => chordInputRef.current?.click()}
                className="flex h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-surface-300 bg-surface-50 transition-colors hover:border-primary-400 hover:bg-primary-50"
              >
                {chordSheetPreview ? (
                  <img
                    src={chordSheetPreview}
                    alt="Chord sheet"
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="text-center text-surface-400">
                    <span className="text-3xl">🎼</span>
                    <p className="mt-1 text-sm">Upload chord sheet photo</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Content Editor */}
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">
              Chords & Lyrics
            </label>
            <p className="mb-2 text-xs text-surface-400">
              Use [Am] [G] etc. for chords inline with lyrics. Example: [Am]Hello [G]world
            </p>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              className="input font-mono text-sm"
              rows={25}
              placeholder={`[Am]Amazing [G]grace, how [C]sweet the sound\nThat [Am]saved a [G]wretch like [C]me`}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary text-base">
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Song"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary text-base"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
