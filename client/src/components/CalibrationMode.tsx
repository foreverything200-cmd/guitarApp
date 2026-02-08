import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { parseContent, type ParsedLine } from "./LyricsRenderer";

/** A start/end timestamp pair for one lyric line */
export interface LineTimestamp {
  start: number;
  end: number;
}

interface Props {
  content: string;
  getCurrentTime: () => number;
  isYTPlaying: boolean;
  onSave: (timestamps: LineTimestamp[]) => void;
  onCancel: () => void;
  existingTimestamps?: LineTimestamp[];
}

function linePreview(line: ParsedLine): string {
  const parts: string[] = [];
  for (const seg of line.segments) {
    if (seg.chord) parts.push(`[${seg.chord}]`);
    if (seg.text.trim()) parts.push(seg.text.trim());
  }
  return parts.join(" ") || "(instrumental)";
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 10);
  return `${m}:${String(s).padStart(2, "0")}.${ms}`;
}

type Phase = "start" | "end";

export default function CalibrationMode({
  content,
  getCurrentTime,
  isYTPlaying,
  onSave,
  onCancel,
  existingTimestamps,
}: Props) {
  const lines = useMemo(() => parseContent(content), [content]);
  const nonEmptyLines = useMemo(
    () => lines.filter((l) => l.type !== "empty"),
    [lines]
  );
  const totalLines = nonEmptyLines.length;

  const [timestamps, setTimestamps] = useState<LineTimestamp[]>(
    () => existingTimestamps ?? []
  );
  // Current line index we're calibrating
  const [currentIdx, setCurrentIdx] = useState(() => {
    const existing = existingTimestamps?.length ?? 0;
    return Math.min(existing, totalLines);
  });
  // Are we waiting for "Start" or "End" of the current line?
  const [phase, setPhase] = useState<Phase>(() => {
    const existing = existingTimestamps?.length ?? 0;
    return existing >= totalLines ? "start" : "start";
  });
  const [pendingStart, setPendingStart] = useState<number | null>(null);
  const [done, setDone] = useState(
    () => (existingTimestamps?.length ?? 0) >= totalLines
  );

  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the list to keep current line visible
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const lineEl = el.querySelector(`[data-cal-line="${currentIdx}"]`);
    if (lineEl) {
      lineEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentIdx]);

  // ─── Start Line ───
  const handleStart = useCallback(() => {
    if (done) return;
    const time = getCurrentTime();
    setPendingStart(time);
    setPhase("end");
  }, [done, getCurrentTime]);

  // ─── End Line ───
  const handleEnd = useCallback(() => {
    if (done || pendingStart === null) return;
    const endTime = getCurrentTime();
    const startTime = pendingStart;

    // Ensure end > start
    const entry: LineTimestamp = {
      start: Math.min(startTime, endTime),
      end: Math.max(startTime, endTime),
    };

    setTimestamps((prev) => {
      const next = [...prev];
      next[currentIdx] = entry;
      return next;
    });

    setPendingStart(null);
    setPhase("start");

    if (currentIdx + 1 >= totalLines) {
      setDone(true);
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  }, [done, pendingStart, getCurrentTime, currentIdx, totalLines]);

  // ─── Undo ───
  const handleUndo = useCallback(() => {
    if (phase === "end" && pendingStart !== null) {
      // Undo the "Start" — go back to waiting for start on same line
      setPendingStart(null);
      setPhase("start");
      return;
    }

    if (done) {
      // Undo last completed line
      setDone(false);
      const lastIdx = totalLines - 1;
      setCurrentIdx(lastIdx);
      setTimestamps((prev) => prev.slice(0, lastIdx));
      setPhase("start");
      return;
    }

    if (currentIdx > 0) {
      // Go back one line
      setCurrentIdx((prev) => prev - 1);
      setTimestamps((prev) => prev.slice(0, currentIdx - 1));
      setPhase("start");
      setPendingStart(null);
    }
  }, [phase, pendingStart, done, currentIdx, totalLines]);

  // ─── Reset ───
  const handleReset = useCallback(() => {
    setTimestamps([]);
    setCurrentIdx(0);
    setPhase("start");
    setPendingStart(null);
    setDone(false);
  }, []);

  // ─── Save ───
  const handleSave = useCallback(() => {
    onSave(timestamps);
  }, [timestamps, onSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        if (done) return;
        if (phase === "start") handleStart();
        else handleEnd();
      }
      if (e.code === "Backspace") {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleStart, handleEnd, handleUndo, phase, done]);

  // Progress: each line has 2 steps (start + end)
  const completedSteps = timestamps.length * 2 + (pendingStart !== null ? 1 : 0);
  const totalSteps = totalLines * 2;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">🎯 Calibration Mode</h2>
          <button
            onClick={onCancel}
            className="rounded-lg bg-white/20 px-3 py-1 text-sm font-medium hover:bg-white/30 transition-colors"
          >
            Cancel
          </button>
        </div>
        <p className="text-indigo-100 text-xs mt-1">
          Play the song. For each line: tap <b>START</b> when it begins singing, then <b>END</b> when it stops.
          <br />
          Keyboard: Space/Enter = tap, Backspace = undo
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${(completedSteps / Math.max(totalSteps, 1)) * 100}%` }}
            />
          </div>
          <span className="text-sm font-mono font-medium">
            {timestamps.length}/{totalLines} lines
          </span>
        </div>
      </div>

      {/* Line List */}
      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
        {nonEmptyLines.map((line, idx) => {
          const isCurrent = idx === currentIdx && !done;
          const isCompleted = idx < timestamps.length;
          const isRecording = isCurrent && phase === "end";

          return (
            <div
              key={idx}
              data-cal-line={idx}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 mb-1 transition-all duration-300 ${
                isRecording
                  ? "bg-red-50 border-2 border-red-400 shadow-sm"
                  : isCurrent
                  ? "bg-indigo-50 border-2 border-indigo-400 shadow-sm scale-[1.01]"
                  : isCompleted
                  ? "bg-green-50/80 border border-green-200"
                  : "bg-surface-50 border border-surface-100 opacity-40"
              }`}
            >
              {/* Status icon */}
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
                {isCompleted ? (
                  <span className="bg-green-500 text-white w-full h-full rounded-full flex items-center justify-center">
                    ✓
                  </span>
                ) : isRecording ? (
                  <span className="bg-red-500 text-white w-full h-full rounded-full flex items-center justify-center animate-pulse">
                    ●
                  </span>
                ) : isCurrent ? (
                  <span className="bg-indigo-500 text-white w-full h-full rounded-full flex items-center justify-center animate-pulse">
                    ▸
                  </span>
                ) : (
                  <span className="bg-surface-200 text-surface-400 w-full h-full rounded-full flex items-center justify-center">
                    {idx + 1}
                  </span>
                )}
              </div>

              {/* Line text */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-mono truncate ${
                    isRecording
                      ? "text-red-900 font-semibold"
                      : isCurrent
                      ? "text-indigo-900 font-semibold"
                      : isCompleted
                      ? "text-green-800"
                      : "text-surface-400"
                  }`}
                >
                  {linePreview(line)}
                </p>
              </div>

              {/* Timestamps */}
              {isCompleted && (
                <div className="flex-shrink-0 flex gap-1">
                  <span className="text-[10px] font-mono text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                    {fmt(timestamps[idx].start)}
                  </span>
                  <span className="text-[10px] text-surface-300">→</span>
                  <span className="text-[10px] font-mono text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                    {fmt(timestamps[idx].end)}
                  </span>
                </div>
              )}
              {isRecording && pendingStart !== null && (
                <span className="flex-shrink-0 text-[10px] font-mono text-red-600 bg-red-100 px-1.5 py-0.5 rounded animate-pulse">
                  {fmt(pendingStart)} → ...
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom action bar */}
      <div className="flex-shrink-0 border-t border-surface-200 bg-white px-4 py-3">
        {!isYTPlaying && !done && (
          <p className="text-center text-amber-600 text-sm font-medium mb-2">
            ▶ Press play on the YouTube video first
          </p>
        )}

        <div className="flex items-center gap-2">
          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={currentIdx === 0 && phase === "start" && !done}
            className="rounded-lg bg-surface-100 px-3 py-2 text-sm font-medium text-surface-600 hover:bg-surface-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ↩ Undo
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            disabled={timestamps.length === 0 && pendingStart === null}
            className="rounded-lg bg-surface-100 px-3 py-2 text-sm font-medium text-surface-600 hover:bg-surface-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            🔄 Reset
          </button>

          <div className="flex-1" />

          {/* Main action buttons */}
          {done ? (
            <button
              onClick={handleSave}
              className="rounded-xl bg-green-600 px-6 py-3 text-base font-bold text-white shadow-lg hover:bg-green-700 active:scale-95 transition-all"
            >
              ✅ Save Calibration
            </button>
          ) : phase === "start" ? (
            <button
              onClick={handleStart}
              disabled={!isYTPlaying}
              className="rounded-xl bg-green-600 px-7 py-4 text-lg font-bold text-white shadow-lg hover:bg-green-700 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all select-none"
            >
              ▶ START — Line {currentIdx + 1}
            </button>
          ) : (
            <button
              onClick={handleEnd}
              disabled={!isYTPlaying}
              className="rounded-xl bg-red-600 px-7 py-4 text-lg font-bold text-white shadow-lg hover:bg-red-700 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all select-none animate-pulse"
            >
              ⏹ END — Line {currentIdx + 1}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
