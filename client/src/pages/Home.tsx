import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { songs } from "@/services/api";
import type { SongStats } from "@/types";

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SongStats | null>(null);

  useEffect(() => {
    songs.getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 p-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-surface-900 lg:text-6xl">
          🎸 GuitarApp
        </h1>
        <p className="mt-2 text-lg text-surface-500">
          {stats
            ? `${stats.total} songs in your library`
            : "Loading..."}
        </p>
      </div>

      {/* Main Buttons */}
      <div className="grid w-full max-w-2xl gap-5 lg:grid-cols-2">
        {/* Jewish Music */}
        <button
          onClick={() => navigate("/jewish")}
          className="group card flex flex-col items-center gap-4 p-8 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-5xl">✡️</span>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-surface-900">
              Jewish Music
            </h2>
            <p className="mt-1 text-sm text-surface-500">
              {stats ? `${stats.jewish} songs` : "..."}
            </p>
          </div>
        </button>

        {/* Non-Jewish Music */}
        <button
          onClick={() => navigate("/non-jewish")}
          className="group card flex flex-col items-center gap-4 p-8 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-5xl">🎵</span>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-surface-900">
              Non-Jewish Music
            </h2>
            <p className="mt-1 text-sm text-surface-500">
              {stats ? `${stats.nonJewish} songs` : "..."}
            </p>
          </div>
        </button>

        {/* Guitar Tuner - full width */}
        <button
          onClick={() => navigate("/tuner")}
          className="group card flex flex-col items-center gap-4 p-8 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] lg:col-span-2"
        >
          <span className="text-5xl">🎸</span>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-surface-900">
              Guitar Tuner
            </h2>
            <p className="mt-1 text-sm text-surface-500">
              Standard tuning (EADGBE)
            </p>
          </div>
        </button>
      </div>

      {/* Quick Links */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/chords")}
          className="btn-secondary text-base"
        >
          🎼 Known Chords
        </button>
      </div>
    </div>
  );
}
