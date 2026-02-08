import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { songs as songsApi } from "@/services/api";
import type { Song, Category as CatType } from "@/types";
import { transposeContent, extractChords } from "@/utils/transpose";
import LyricsRenderer, { computeLineWeights } from "@/components/LyricsRenderer";
import YouTubePlayer from "@/components/YouTubePlayer";
import ScrollControls from "@/components/ScrollControls";
import ChordDiagram from "@/components/ChordDiagram";
import CalibrationMode, { type LineTimestamp } from "@/components/CalibrationMode";
import { useAutoScroll } from "@/hooks/useAutoScroll";

// ─── Timestamps persistence (localStorage) ───
const TS_KEY = "song-timestamps-v2-";
function loadTimestamps(songId: string): LineTimestamp[] | undefined {
  try {
    const raw = localStorage.getItem(TS_KEY + songId);
    if (!raw) return undefined;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "object" && "start" in arr[0]) {
      return arr;
    }
    return undefined;
  } catch {
    return undefined;
  }
}
function saveTimestamps(songId: string, ts: LineTimestamp[]) {
  try {
    localStorage.setItem(TS_KEY + songId, JSON.stringify(ts));
  } catch {}
}
function clearTimestamps(songId: string) {
  try {
    localStorage.removeItem(TS_KEY + songId);
  } catch {}
}

// ─── Offset persistence (localStorage, fallback mode) ───
const OFFSET_KEY = "lyrics-offset-";
function loadOffset(songId: string): number {
  try {
    const v = localStorage.getItem(OFFSET_KEY + songId);
    return v ? parseFloat(v) || 0 : 0;
  } catch {
    return 0;
  }
}
function saveOffset(songId: string, offset: number) {
  try {
    localStorage.setItem(OFFSET_KEY + songId, String(offset));
  } catch {}
}

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
  const [calibrating, setCalibrating] = useState(false);
  const [lineTimestamps, setLineTimestamps] = useState<LineTimestamp[] | undefined>();
  const [isYTPlaying, setIsYTPlaying] = useState(false);

  const lyricsRef = useRef<HTMLDivElement>(null);
  const latestYTTime = useRef(0);
  const latestYTDuration = useRef(0);

  // Compute transposed content + line weights
  const transposedContent = useMemo(
    () => (song ? transposeContent(song.content, song.capoOriginal, capo) : ""),
    [song, capo]
  );
  const chords = useMemo(() => extractChords(transposedContent), [transposedContent]);
  const lineWeights = useMemo(() => computeLineWeights(transposedContent), [transposedContent]);

  const autoScroll = useAutoScroll(lyricsRef, {
    lineWeights,
    lineTimestamps,
  });

  // ─── Load song ───
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

  // Load saved timestamps + offset when song changes
  useEffect(() => {
    if (song) {
      const ts = loadTimestamps(song.id);
      setLineTimestamps(ts);
      if (!ts) {
        const saved = loadOffset(song.id);
        if (saved > 0) autoScroll.setLyricsOffset(saved);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id]);

  // Save offset whenever it changes (fallback mode only)
  useEffect(() => {
    if (song && !lineTimestamps) {
      saveOffset(song.id, autoScroll.lyricsOffset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoScroll.lyricsOffset, song?.id, lineTimestamps]);

  // Save capo preference
  useEffect(() => {
    if (song && capo !== song.capoPreferred) {
      songsApi.updateCapo(song.id, capo).catch(console.error);
    }
  }, [capo, song]);

  // ─── Handlers ───

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

  const handlePrint = useCallback(() => window.print(), []);

  // YouTube callbacks
  const handleYTProgress = useCallback(
    (currentTime: number, duration: number) => {
      latestYTTime.current = currentTime;
      latestYTDuration.current = duration;
      if (!calibrating) {
        autoScroll.syncToProgress(currentTime, duration);
      }
    },
    [autoScroll.syncToProgress, calibrating]
  );

  const handleYTPlayState = useCallback(
    (playing: boolean) => {
      setIsYTPlaying(playing);
      if (!calibrating) {
        autoScroll.onPlayStateChange(playing);
      }
    },
    [autoScroll.onPlayStateChange, calibrating]
  );

  const handleTapLyricsStart = useCallback(() => {
    autoScroll.tapLyricsStart(latestYTTime.current);
  }, [autoScroll.tapLyricsStart]);

  // Calibration
  const getCurrentTime = useCallback(() => latestYTTime.current, []);

  const handleCalibrationSave = useCallback(
    (timestamps: LineTimestamp[]) => {
      if (!song) return;
      setLineTimestamps(timestamps);
      saveTimestamps(song.id, timestamps);
      setCalibrating(false);
    },
    [song]
  );

  const handleCalibrationCancel = useCallback(() => {
    setCalibrating(false);
  }, []);

  const handleClearTimestamps = useCallback(() => {
    if (!song) return;
    if (!confirm("Clear calibration data? Sync will fall back to estimated timing.")) return;
    setLineTimestamps(undefined);
    clearTimestamps(song.id);
  }, [song]);

  // ─── Render ───

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
        <button onClick={() => navigate(`/${cat}`)} className="btn-primary">Back to Library</button>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Top Controls */}
      <header className="no-print flex-shrink-0 border-b border-surface-200 bg-white/95 backdrop-blur-sm z-30">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2">
          <button onClick={() => navigate(`/${cat}`)} className="btn-icon" title="Back">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="truncate text-sm font-medium text-surface-500">{song.title}</span>
          <div className="flex-1" />

          {/* Calibrate button */}
          {song.youtubeUrl && !calibrating && (
            <button
              onClick={() => setCalibrating(true)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                lineTimestamps
                  ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
              }`}
              title={lineTimestamps ? "Re-calibrate lyrics sync" : "Calibrate lyrics sync for perfect timing"}
            >
              {lineTimestamps ? "🎯 Calibrated" : "🎯 Calibrate"}
            </button>
          )}

          {/* Clear calibration */}
          {lineTimestamps && !calibrating && (
            <button
              onClick={handleClearTimestamps}
              className="rounded-lg px-2 py-1 text-xs text-surface-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Clear calibration data"
            >
              ✕
            </button>
          )}

          <button onClick={handleNextRandom} className="btn-ghost text-sm" title="Shuffle">🔀 Next</button>
          <button onClick={() => navigate(`/${cat}/edit/${song.id}`)} className="btn-ghost text-sm" title="Edit">✏️ Edit</button>
          <button onClick={handleDelete} className="btn-ghost text-sm text-red-600" title="Delete">🗑️</button>
          <button onClick={handlePrint} className="btn-ghost text-sm" title="Print">🖨️</button>
        </div>
      </header>

      {/* Main content: left panel + lyrics/calibration */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        {/* Left Panel: Song Info + YouTube */}
        <div className="no-print md:w-72 lg:w-80 md:flex-shrink-0 md:overflow-y-auto md:border-r md:border-surface-200 p-4">
          <div className="flex gap-4 md:flex-col md:gap-0">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface-200 md:mb-3 md:h-auto md:w-full md:aspect-square">
              {song.albumCoverPath ? (
                <img src={song.albumCoverPath} alt={song.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl md:text-6xl text-surface-400">🎵</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-surface-900 truncate">{song.title}</h1>
              <p className="text-sm md:text-lg text-surface-600 truncate">{song.artist.name}</p>
              <div className="relative mt-2 flex items-center gap-2">
                <span className="text-sm font-medium text-surface-500">Capo</span>
                <button
                  onClick={() => setShowCapoDropdown(!showCapoDropdown)}
                  className="rounded-lg bg-primary-100 px-3 py-1 text-lg font-bold text-primary-700 transition-colors hover:bg-primary-200"
                >
                  {capo}
                </button>
                {showCapoDropdown && (
                  <div className="absolute left-0 top-full z-20 mt-1 flex flex-wrap gap-1 rounded-xl bg-white p-2 shadow-xl border border-surface-200 w-[200px]">
                    {Array.from({ length: 15 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => { setCapo(i); setShowCapoDropdown(false); }}
                        className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                          i === capo ? "bg-primary-600 text-white" : "bg-surface-100 hover:bg-surface-200"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {!calibrating && (
            <div className="mt-3">
              <h3 className="mb-1.5 text-xs font-semibold uppercase text-surface-400">Chords Used</h3>
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
          )}

          {activeChord && !calibrating && (
            <div className="mt-3">
              <ChordDiagram chordName={activeChord} onClose={() => setActiveChord(null)} />
            </div>
          )}

          {song.youtubeUrl && (
            <div className="mt-4">
              <YouTubePlayer
                url={song.youtubeUrl}
                onProgress={handleYTProgress}
                onPlayStateChange={handleYTPlayState}
              />
            </div>
          )}
        </div>

        {/* Right Panel: Lyrics OR Calibration */}
        {calibrating ? (
          <div className="flex-1 min-h-0 min-w-0">
            <CalibrationMode
              content={transposedContent}
              getCurrentTime={getCurrentTime}
              isYTPlaying={isYTPlaying}
              onSave={handleCalibrationSave}
              onCancel={handleCalibrationCancel}
              existingTimestamps={lineTimestamps}
            />
          </div>
        ) : (
          <div
            ref={lyricsRef}
            className="flex-1 min-h-0 min-w-0 overflow-y-auto p-4 md:p-6 print-area"
          >
            <div className="hidden print:block print:mb-4">
              <h1 className="text-2xl font-bold">{song.title}</h1>
              <p className="text-lg">{song.artist.name}</p>
              <p className="text-sm">Capo: {capo}</p>
            </div>

            <LyricsRenderer
              content={transposedContent}
              fontSize={fontSize}
              onChordClick={(chord) => setActiveChord(activeChord === chord ? null : chord)}
              activeLine={autoScroll.activeLine}
              lineProgress={autoScroll.lineProgress}
            />

            <div className="h-[60vh]" />
          </div>
        )}
      </div>

      {/* Bottom Controls — hidden during calibration */}
      {!calibrating && (
        <ScrollControls
          isScrolling={autoScroll.isScrolling}
          speed={autoScroll.speed}
          onToggle={autoScroll.toggleScroll}
          onSpeedChange={autoScroll.setSpeed}
          minSpeed={autoScroll.minSpeed}
          maxSpeed={autoScroll.maxSpeed}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          mode={autoScroll.mode}
          syncActive={autoScroll.syncActive}
          onToggleMode={autoScroll.toggleMode}
          lyricsOffset={autoScroll.lyricsOffset}
          onAdjustOffset={autoScroll.adjustOffset}
          onTapLyricsStart={handleTapLyricsStart}
          hasTimestamps={autoScroll.hasTimestamps}
        />
      )}
    </div>
  );
}
