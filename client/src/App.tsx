import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Category from "@/pages/Category";
import SongView from "@/pages/SongView";
import AddEditSong from "@/pages/AddEditSong";
import PlaylistManager from "@/pages/PlaylistManager";
import PlaylistView from "@/pages/PlaylistView";
import Tuner from "@/pages/Tuner";
import KnownChords from "@/pages/KnownChords";
import ArtistView from "@/pages/ArtistView";

export default function App() {
  return (
    <div className="min-h-dvh bg-surface-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:category" element={<Category />} />
        <Route path="/:category/song/:id" element={<SongView />} />
        <Route path="/:category/add" element={<AddEditSong />} />
        <Route path="/:category/edit/:id" element={<AddEditSong />} />
        <Route path="/:category/artist/:id" element={<ArtistView />} />
        <Route path="/:category/playlists" element={<PlaylistManager />} />
        <Route path="/:category/playlists/:id" element={<PlaylistView />} />
        <Route path="/tuner" element={<Tuner />} />
        <Route path="/chords" element={<KnownChords />} />
      </Routes>
    </div>
  );
}
