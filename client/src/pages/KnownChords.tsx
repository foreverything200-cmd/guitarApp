import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { chords as chordsApi } from "@/services/api";
import type { ChordStatus } from "@/types";
import ChordDiagram from "@/components/ChordDiagram";
import { getAllChordNames } from "@/utils/chordDb";

export default function KnownChords() {
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const allChords = getAllChordNames();

  const fetchStatuses = useCallback(async () => {
    try {
      const data = await chordsApi.getAll();
      const map: Record<string, string> = {};
      data.forEach((c: ChordStatus) => (map[c.chordName] = c.status));
      setStatuses(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const cycleStatus = async (chordName: string) => {
    const current = statuses[chordName] || "none";
    const next =
      current === "none" ? "known" : current === "known" ? "learning" : "none";
    try {
      await chordsApi.updateStatus(chordName, next);
      setStatuses((prev) => ({ ...prev, [chordName]: next }));
    } catch (e) {
      console.error(e);
    }
  };

  const knownCount = Object.values(statuses).filter((s) => s === "known").length;
  const learningCount = Object.values(statuses).filter((s) => s === "learning").length;

  return (
    <div className="min-h-dvh bg-surface-50">
      <header className="sticky top-0 z-30 border-b border-surface-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/")} className="btn-icon">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">🎼 Known Chords</h1>
          <div className="flex-1" />
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            {knownCount} known
          </span>
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            {learningCount} learning
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4">
        <p className="mb-4 text-sm text-surface-500">
          Tap a chord to cycle: <strong className="text-surface-700">None</strong> →{" "}
          <strong className="text-green-600">Known</strong> →{" "}
          <strong className="text-yellow-600">Learning</strong> → None.
          Tap the diagram icon to see fingerings.
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
            {allChords.map((chord) => {
              const status = statuses[chord] || "none";
              const bgColor =
                status === "known"
                  ? "bg-green-100 border-green-400"
                  : status === "learning"
                  ? "bg-yellow-100 border-yellow-400"
                  : "bg-white border-surface-200";

              return (
                <div key={chord} className={`card border-2 ${bgColor} p-3 text-center`}>
                  <button
                    onClick={() => cycleStatus(chord)}
                    className="w-full text-lg font-bold text-surface-900"
                  >
                    {chord}
                  </button>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className="text-[10px] text-surface-400">
                      {status === "known" ? "Known" : status === "learning" ? "Learning" : "—"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveChord(activeChord === chord ? null : chord);
                      }}
                      className="ml-1 text-xs text-primary-500 hover:text-primary-700"
                    >
                      👁
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Chord Diagram */}
        {activeChord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="card max-w-sm w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{activeChord}</h2>
                <button onClick={() => setActiveChord(null)} className="btn-icon">✕</button>
              </div>
              <ChordDiagram
                chordName={activeChord}
                onClose={() => setActiveChord(null)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
