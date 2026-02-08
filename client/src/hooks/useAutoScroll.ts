import { useState, useRef, useCallback, useEffect } from "react";
import type { LineTimestamp } from "@/components/CalibrationMode";

export type ScrollMode = "manual" | "sync";

interface UseAutoScrollOptions {
  minSpeed?: number;
  maxSpeed?: number;
  defaultSpeed?: number;
  /** Weights for weighted-guess fallback */
  lineWeights?: number[];
  /** Real calibrated start/end pairs — used for precise sync */
  lineTimestamps?: LineTimestamp[];
}

// ─── Weighted-guess helpers (fallback) ───

function buildBreakpoints(weights: number[]): number[] {
  const total = weights.reduce((s, w) => s + w, 0);
  if (total === 0) return [];
  const bp: number[] = [0];
  let cum = 0;
  for (const w of weights) {
    cum += w;
    bp.push(cum / total);
  }
  return bp;
}

function findActiveLineFromBreakpoints(
  progress: number,
  breakpoints: number[]
): { lineIdx: number; lineProgress: number } {
  const n = breakpoints.length - 1;
  if (n <= 0) return { lineIdx: -1, lineProgress: 0 };
  const p = Math.max(0, Math.min(progress, 0.9999));
  let lo = 0,
    hi = n - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (breakpoints[mid] <= p) lo = mid;
    else hi = mid - 1;
  }
  const lineStart = breakpoints[lo];
  const lineEnd = breakpoints[lo + 1];
  const span = lineEnd - lineStart;
  return { lineIdx: lo, lineProgress: span > 0 ? (p - lineStart) / span : 0 };
}

// ─── Timestamp-based helpers (precise) ───

/**
 * Given start/end timestamp pairs and currentTime, find the active line.
 *
 * - If currentTime falls within a line's [start, end] → that line is active
 * - If currentTime is in a gap between lines → the NEXT line at progress 0
 * - If currentTime is before the first line → line 0 at progress 0
 * - If currentTime is after the last line → last line at progress 1
 */
function findActiveLineFromTimestamps(
  currentTime: number,
  timestamps: LineTimestamp[]
): { lineIdx: number; lineProgress: number } {
  const n = timestamps.length;
  if (n === 0) return { lineIdx: -1, lineProgress: 0 };

  // Before first line starts
  if (currentTime < timestamps[0].start) {
    return { lineIdx: 0, lineProgress: 0 };
  }

  // After last line ends
  if (currentTime >= timestamps[n - 1].end) {
    return { lineIdx: n - 1, lineProgress: 1 };
  }

  // Binary search: find the line whose start <= currentTime
  let lo = 0,
    hi = n - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (timestamps[mid].start <= currentTime) lo = mid;
    else hi = mid - 1;
  }

  const line = timestamps[lo];

  // If we're within this line's range
  if (currentTime <= line.end) {
    const span = line.end - line.start;
    const progress = span > 0 ? (currentTime - line.start) / span : 0;
    return { lineIdx: lo, lineProgress: Math.min(progress, 1) };
  }

  // We're in the gap after this line but before the next
  // Show the next line at progress 0 (anticipation)
  if (lo + 1 < n) {
    return { lineIdx: lo + 1, lineProgress: 0 };
  }

  return { lineIdx: lo, lineProgress: 1 };
}

export function useAutoScroll(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseAutoScrollOptions = {}
) {
  const {
    minSpeed = 0.2,
    maxSpeed = 5,
    defaultSpeed = 1,
    lineWeights = [],
    lineTimestamps,
  } = options;

  const hasTimestamps = !!lineTimestamps && lineTimestamps.length > 0;

  const [isScrolling, setIsScrolling] = useState(false);
  const [speed, setSpeed] = useState(defaultSpeed);
  const [mode, setMode] = useState<ScrollMode>("manual");
  const [syncActive, setSyncActive] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);
  const [lineProgress, setLineProgress] = useState(0);

  // Offset for fallback mode only
  const [lyricsOffset, setLyricsOffset] = useState(0);

  const speedRef = useRef(speed);
  const isScrollingRef = useRef(isScrolling);
  const frameRef = useRef<number>(0);
  const offsetRef = useRef(lyricsOffset);
  const timestampsRef = useRef(lineTimestamps);
  const hasTimestampsRef = useRef(hasTimestamps);

  const breakpointsRef = useRef<number[]>([]);
  useEffect(() => {
    breakpointsRef.current = buildBreakpoints(lineWeights);
  }, [lineWeights]);

  useEffect(() => { timestampsRef.current = lineTimestamps; }, [lineTimestamps]);
  useEffect(() => { hasTimestampsRef.current = hasTimestamps; }, [hasTimestamps]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { isScrollingRef.current = isScrolling; }, [isScrolling]);
  useEffect(() => { offsetRef.current = lyricsOffset; }, [lyricsOffset]);

  // ─── Manual scroll loop ───
  const scrollLoop = useCallback(() => {
    const el = containerRef.current;
    if (!el || !isScrollingRef.current) return;
    el.scrollTop += speedRef.current;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
      setIsScrolling(false);
      return;
    }
    frameRef.current = requestAnimationFrame(scrollLoop);
  }, [containerRef]);

  useEffect(() => {
    if (mode === "manual" && isScrolling) {
      frameRef.current = requestAnimationFrame(scrollLoop);
    } else {
      cancelAnimationFrame(frameRef.current);
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [isScrolling, scrollLoop, mode]);

  // ─── Sync from YouTube progress ───
  const syncToProgress = useCallback(
    (currentTime: number, duration: number) => {
      const el = containerRef.current;
      if (!el || duration <= 0) return;

      let lineIdx: number;
      let lp: number;

      if (hasTimestampsRef.current && timestampsRef.current) {
        // ★ PRECISE MODE — real start/end timestamps
        const result = findActiveLineFromTimestamps(currentTime, timestampsRef.current);
        lineIdx = result.lineIdx;
        lp = result.lineProgress;
      } else {
        // Fallback — weighted guess with offset
        const bp = breakpointsRef.current;
        if (bp.length < 2) return;
        const adjustedTime = currentTime - offsetRef.current;
        const effective = Math.max(0, Math.min(adjustedTime, duration));
        const progress = effective / duration;
        const result = findActiveLineFromBreakpoints(progress, bp);
        lineIdx = result.lineIdx;
        lp = result.lineProgress;
      }

      setActiveLine(lineIdx);
      setLineProgress(lp);

      // Smooth-scroll to center the active line
      const lineEl = el.querySelector(`[data-line="${lineIdx}"]`);
      if (lineEl) {
        const lineRect = lineEl.getBoundingClientRect();
        const containerRect = el.getBoundingClientRect();
        const lineCenter =
          lineRect.top - containerRect.top + el.scrollTop + lineRect.height / 2;
        const targetScroll = lineCenter - containerRect.height / 3;
        const diff = targetScroll - el.scrollTop;
        if (Math.abs(diff) > 2) {
          el.scrollTop += diff * 0.12;
        }
      }
    },
    [containerRef]
  );

  // ─── YouTube play state ───
  const onPlayStateChange = useCallback((playing: boolean) => {
    setSyncActive(playing);
    if (playing) {
      setMode("sync");
    } else {
      setSyncActive(false);
    }
  }, []);

  // ─── Offset helpers (fallback) ───
  const tapLyricsStart = useCallback((currentYouTubeTime: number) => {
    setLyricsOffset(currentYouTubeTime);
  }, []);

  const adjustOffset = useCallback((delta: number) => {
    setLyricsOffset((prev) => Math.max(0, +(prev + delta).toFixed(1)));
  }, []);

  const toggleScroll = useCallback(() => {
    if (mode === "sync") {
      setMode("manual");
      setSyncActive(false);
      setActiveLine(-1);
      setLineProgress(0);
      setIsScrolling(false);
    } else {
      setIsScrolling((prev) => !prev);
    }
  }, [mode]);

  const toggleMode = useCallback(() => {
    if (mode === "sync") {
      setMode("manual");
      setSyncActive(false);
      setActiveLine(-1);
      setLineProgress(0);
    } else {
      setMode("sync");
      setIsScrolling(false);
    }
  }, [mode]);

  return {
    isScrolling: mode === "sync" ? syncActive : isScrolling,
    speed,
    setSpeed,
    toggleScroll,
    minSpeed,
    maxSpeed,
    mode,
    syncActive,
    toggleMode,
    syncToProgress,
    onPlayStateChange,
    activeLine,
    lineProgress,
    hasTimestamps,
    lyricsOffset,
    setLyricsOffset,
    adjustOffset,
    tapLyricsStart,
  };
}
