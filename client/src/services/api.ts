import type {
  Song,
  Artist,
  Playlist,
  ChordStatus,
  SongStats,
  SongFormData,
  Category,
} from "@/types";

const BASE = "/api";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Songs ───

export const songs = {
  getAll: (category?: Category) =>
    request<Song[]>(`/songs${category ? `?category=${category}` : ""}`),

  getById: (id: string) => request<Song>(`/songs/${id}`),

  search: (q: string, category?: Category) =>
    request<Song[]>(
      `/songs/search?q=${encodeURIComponent(q)}${category ? `&category=${category}` : ""}`
    ),

  getRandom: (category?: Category, excludeId?: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (excludeId) params.set("exclude", excludeId);
    return request<Song>(`/songs/random?${params}`);
  },

  getKnown: (category?: Category) =>
    request<Song[]>(`/songs/known${category ? `?category=${category}` : ""}`),

  getLearning: (category?: Category) =>
    request<Song[]>(
      `/songs/learning${category ? `?category=${category}` : ""}`
    ),

  getStats: () => request<SongStats>("/songs/stats"),

  create: (data: SongFormData) => {
    const form = new FormData();
    form.append("title", data.title);
    form.append("artistName", data.artistName);
    form.append("category", data.category);
    form.append("capoOriginal", String(data.capoOriginal));
    form.append("youtubeUrl", data.youtubeUrl);
    form.append("content", data.content);
    if (data.albumCover) form.append("albumCover", data.albumCover);
    if (data.chordSheet) form.append("chordSheet", data.chordSheet);
    return fetch(`${BASE}/songs`, { method: "POST", body: form }).then((r) =>
      r.json()
    ) as Promise<Song>;
  },

  update: (id: string, data: Partial<SongFormData>) => {
    const form = new FormData();
    if (data.title !== undefined) form.append("title", data.title);
    if (data.artistName !== undefined) form.append("artistName", data.artistName);
    if (data.category !== undefined) form.append("category", data.category);
    if (data.capoOriginal !== undefined) form.append("capoOriginal", String(data.capoOriginal));
    if (data.youtubeUrl !== undefined) form.append("youtubeUrl", data.youtubeUrl);
    if (data.content !== undefined) form.append("content", data.content);
    if (data.albumCover) form.append("albumCover", data.albumCover);
    if (data.chordSheet) form.append("chordSheet", data.chordSheet);
    return fetch(`${BASE}/songs/${id}`, { method: "PUT", body: form }).then(
      (r) => r.json()
    ) as Promise<Song>;
  },

  delete: (id: string) =>
    request(`/songs/${id}`, { method: "DELETE" }),

  updateCapo: (id: string, capoPreferred: number) =>
    request<Song>(`/songs/${id}/capo`, {
      method: "PATCH",
      body: JSON.stringify({ capoPreferred }),
    }),
};

// ─── Artists ───

export const artists = {
  getAll: (category?: Category) =>
    request<Artist[]>(
      `/artists${category ? `?category=${category}` : ""}`
    ),

  getById: (id: string) => request<Artist>(`/artists/${id}`),

  getSongs: (id: string) => request<Song[]>(`/artists/${id}/songs`),

  create: (data: { name: string; category: Category; photo?: File }) => {
    const form = new FormData();
    form.append("name", data.name);
    form.append("category", data.category);
    if (data.photo) form.append("photo", data.photo);
    return fetch(`${BASE}/artists`, { method: "POST", body: form }).then((r) =>
      r.json()
    ) as Promise<Artist>;
  },

  update: (
    id: string,
    data: { name?: string; category?: Category; photo?: File }
  ) => {
    const form = new FormData();
    if (data.name) form.append("name", data.name);
    if (data.category) form.append("category", data.category);
    if (data.photo) form.append("photo", data.photo);
    return fetch(`${BASE}/artists/${id}`, {
      method: "PUT",
      body: form,
    }).then((r) => r.json()) as Promise<Artist>;
  },

  delete: (id: string) =>
    request(`/artists/${id}`, { method: "DELETE" }),
};

// ─── Playlists ───

export const playlists = {
  getAll: (category?: Category) =>
    request<Playlist[]>(
      `/playlists${category ? `?category=${category}` : ""}`
    ),

  getById: (id: string) => request<Playlist>(`/playlists/${id}`),

  create: (data: { name: string; category: string }) =>
    request<Playlist>("/playlists", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; category?: string }) =>
    request<Playlist>(`/playlists/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request(`/playlists/${id}`, { method: "DELETE" }),

  addSong: (playlistId: string, songId: string) =>
    request(`/playlists/${playlistId}/songs`, {
      method: "POST",
      body: JSON.stringify({ songId }),
    }),

  removeSong: (playlistId: string, songId: string) =>
    request(`/playlists/${playlistId}/songs/${songId}`, {
      method: "DELETE",
    }),

  reorder: (playlistId: string, songIds: string[]) =>
    request(`/playlists/${playlistId}/reorder`, {
      method: "PUT",
      body: JSON.stringify({ songIds }),
    }),

  getRandomSong: (playlistId: string, excludeId?: string) => {
    const params = excludeId ? `?exclude=${excludeId}` : "";
    return request<Song>(`/playlists/${playlistId}/random${params}`);
  },
};

// ─── Chords ───

export const chords = {
  getAll: () => request<ChordStatus[]>("/chords"),

  updateStatus: (chordName: string, status: string) =>
    request<ChordStatus>(`/chords/${encodeURIComponent(chordName)}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  bulkUpdate: (chordData: { chordName: string; status: string }[]) =>
    request<ChordStatus[]>("/chords", {
      method: "PUT",
      body: JSON.stringify({ chords: chordData }),
    }),
};

// ─── Settings ───

export const settings = {
  getAll: () => request<Record<string, string>>("/settings"),

  set: (key: string, value: string) =>
    request(`/settings/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    }),
};
