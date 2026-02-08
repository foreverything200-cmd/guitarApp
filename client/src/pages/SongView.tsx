import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { songs as songsApi } from "@/services/api";
import type { Song, Category as CatType } from "@/types";
import { transposeContent, extractChords } from "@/utils/transpose";
import LyricsRenderer from "@/components/LyricsRenderer";
import YouTubePlayer from "@/components/YouTubePlayer";
import ScrollControls from "@/components/ScrollControls";
import ChordDiagram from "@/components/ChordDiagram";
import { useAutoScroll } from "@/hooks/useAutoScroll";

export default function SongView() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const navigate = useNavigate();
  const cat = category as CatType;

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [capo, setCapo] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [showCapoDropdown, setShowCapoDropdown] = useState(false);
  const [activeChord, setActiveChord] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const autoScroll = useAutoScroll(contentRef);

  // Fetch song
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    songsApi
      .getById(id)
      .then((data) => {
        setSong(data);
        setCapo(data.capoPreferred);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Save capo preference
  useEffect(() => {
    if (song && capo !== song.capoPreferred) {
      songsApi.updateCapo(song.id, capo).catch(console.error);
    }
  }, [capo, song]);

  const handleDelete = useCallback(async () => {
    if (!song) return;
    if (!confirm(`Delete "${song.title}"? This cannot be undone.`)) return;
    await songsApi.delete(song.id);
    navigate(`/${cat}`);
  }, [song, cat, navigate]);

  const handleNextRandom = useCallback(async () => {
    try {
      const next = await songsApi.getRandom(cat, song?.id);
      navigate(`/${cat}/song/${next.id}`, { replace: true });
    } catch {
      alert("No other songs in this category");
    }
  }, [cat, song, navigate]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <p className="text-lg text-surface-500">Song not found</p>
        <button onClick={() => navigate(`/${cat}`)} className="btn-primary">
          Back to Library
        </button>
      </div>
    );
  }

  const transposedContent = transposeContent(song.content, song.capoOriginal, capo);
  const chords = extractChords(transposedContent);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Top Controls */}
      <header className="no-print sticky top-0 z-30 border-b border-surface-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2">
          <button onClick={() => navigate(`/${cat}`)} className="btn-icon" title="Back">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="truncate text-sm font-medium text-surface-500">
            {song.title}
          </span>

          <div className="flex-1" />

          <button onClick={handleNextRandom} className="btn-ghost text-sm" title="Shuffle">🔀 Next</button>
          <button onClick={() => navigate(`/${cat}/edit/${song.id}`)} className="btn-ghost text-sm" title="Edit">✏️ Edit</button>
          <button onClick={handleDelete} className="btn-ghost text-sm text-red-600" title="Delete">🗑️</button>
          <button onClick={handlePrint} className="btn-ghost text-sm" title="Print">🖨️</button>
        </div>
      </header>

      {/* Main Content - Landscape split layout */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        style={{ scrollBehavior: "auto" }}
      >
        <div className="mx-auto max-w-7xl p-4 lg:flex lg:gap-6">
          {/* Left Panel: Song Info + YouTube */}
          <div className="no-print mb-6 lg:mb-0 lg:w-80 lg:flex-shrink-0">
            {/* Album Cover */}
            <div className="mb-4 aspect-square w-full overflow-hidden rounded-xl bg-surface-200 lg:w-80">
              {song.albumCoverPath ? (
                <img
                  src={song.albumCoverPath}
                  alt={song.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl text-surface-400">
                  🎵
                </div>
              )}
            </div>

            {/* Song Info */}
            <h1 className="text-2xl font-bold text-surface-900">{song.title}</h1>
            <p className="text-lg text-surface-600">{song.artist.name}</p>

            {/* Capo */}
            <div className="relative mt-3 flex items-center gap-2">
              <span className="text-sm font-medium text-surface-500">Capo</span>
              <button
                onClick={() => setShowCapoDropdown(!showCapoDropdown)}
                className="rounded-lg bg-primary-100 px-3 py-1 text-lg font-bold text-primary-700 transition-colors hover:bg-primary-200"
              >
                {capo}
              </button>
              {showCapoDropdown && (
                <div className="absolute left-0 top-full z-20 mt-1 flex flex-wrap gap-1 rounded-xl bg-white p-2 shadow-xl border border-surface-200">
                  {Array.from({ length: 15 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => { setCapo(i); setShowCapoDropdown(false); }}
                      className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                        i === capo
                          ? "bg-primary-600 text-white"
                          : "bg-surface-100 hover:bg-surface-200"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chord List */}
            <div className="mt-4">
              <h3 className="mb-2 text-xs font-semibold uppercase text-surface-400">
                Chords Used
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {chords.map((chord) => (
                  <button
                    key={chord}
                    onClick={() => setActiveChord(activeChord === chord ? null : chord)}
                    className="rounded-md bg-red-50 px-2 py-1 text-sm font-bold text-chord transition-colors hover:bg-red-100"
                  >
                    {chord}
                  </button>
                ))}
              </div>
            </div>

            {/* Chord Diagram Popup */}
            {activeChord && (
              <div className="mt-3">
                <ChordDiagram
                  chordName={activeChord}
                  onClose={() => setActiveChord(null)}
                />
              </div>
            )}

            {/* YouTube */}
            {song.youtubeUrl && (
              <div className="mt-4">
                <YouTubePlayer url={song.youtubeUrl} />
              </div>
            )}
          </div>

          {/* Right Panel: Lyrics */}
          <div className="flex-1 print-area">
            {/* Print header (only shows in print) */}
            <div className="hidden print:block print:mb-4">
              <h1 className="text-2xl font-bold">{song.title}</h1>
              <p className="text-lg">{song.artist.name}</p>
              <p className="text-sm">Capo: {capo}</p>
            </div>

            <LyricsRenderer
              content={transposedContent}
              fontSize={fontSize}
              onChordClick={(chord) => setActiveChord(activeChord === chord ? null : chord)}
            />
          </div>
        </div>
      </div>

      {/* Bottom Scroll Controls */}
      <ScrollControls
        isScrolling={autoScroll.isScrolling}
        speed={autoScroll.speed}
        onToggle={autoScroll.toggleScroll}
        onSpeedChange={autoScroll.setSpeed}
        minSpeed={autoScroll.minSpeed}
        maxSpeed={autoScroll.maxSpeed}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
      />
    </div>
  );
}
