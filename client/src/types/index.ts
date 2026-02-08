// ─── Domain Models ───

export interface Artist {
  id: string;
  name: string;
  photoPath: string | null;
  category: Category;
  createdAt: string;
  _count?: { songs: number };
  songs?: Song[];
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  artist: Artist;
  category: Category;
  capoOriginal: number;
  capoPreferred: number;
  albumCoverPath: string | null;
  youtubeUrl: string | null;
  content: string;
  chordSheetImage: string | null;
  createdAt: string;
  updatedAt: string;
  chords?: string[];
}

export interface Playlist {
  id: string;
  name: string;
  category: Category | "mixed";
  songs: PlaylistSong[];
  _count?: { songs: number };
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistSong {
  id: string;
  playlistId: string;
  songId: string;
  order: number;
  song: Song;
}

export interface ChordStatus {
  id: string;
  chordName: string;
  status: "known" | "learning" | "none";
}

export interface SongStats {
  total: number;
  jewish: number;
  nonJewish: number;
}

// ─── Enums / Unions ───

export type Category = "jewish" | "non-jewish";

export type BrowseMode = "songs" | "artists" | "known" | "learning";

// ─── Chord Diagram ───

export interface ChordDiagram {
  name: string;
  baseFret: number;
  frets: number[]; // 6 values (low E to high e): -1=muted, 0=open, 1+=fret
  fingers: number[]; // 6 values: finger number (0=none)
  barres?: { fret: number; fromString: number; toString: number }[];
}

// ─── Form Types ───

export interface SongFormData {
  title: string;
  artistName: string;
  category: Category;
  capoOriginal: number;
  youtubeUrl: string;
  content: string;
  albumCover?: File | null;
  chordSheet?: File | null;
}
