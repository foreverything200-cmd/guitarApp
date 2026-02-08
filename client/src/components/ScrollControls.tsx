import type { ScrollMode } from "@/hooks/useAutoScroll";

interface Props {
  isScrolling: boolean;
  speed: number;
  onToggle: () => void;
  onSpeedChange: (speed: number) => void;
  minSpeed: number;
  maxSpeed: number;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  mode: ScrollMode;
  syncActive: boolean;
  onToggleMode: () => void;
  lyricsOffset: number;
  onAdjustOffset: (delta: number) => void;
  onTapLyricsStart: () => void;
  /** Whether this song has real calibrated timestamps */
  hasTimestamps?: boolean;
}

export default function ScrollControls({
  isScrolling,
  speed,
  onToggle,
  onSpeedChange,
  minSpeed,
  maxSpeed,
  fontSize,
  onFontSizeChange,
  mode,
  syncActive,
  onToggleMode,
  lyricsOffset,
  onAdjustOffset,
  onTapLyricsStart,
  hasTimestamps = false,
}: Props) {
  return (
    <div className="no-print flex-shrink-0 z-30 border-t border-surface-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2">
        {/* Mode Toggle */}
        <button
          onClick={onToggleMode}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            mode === "sync"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-surface-100 text-surface-600 hover:bg-surface-200"
          }`}
          title={
            mode === "sync"
              ? "Syncing to YouTube — click for manual"
              : "Manual scroll — click to sync with YouTube"
          }
        >
          {mode === "sync" ? (
            <span className="flex items-center gap-1.5">
              {syncActive && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              )}
              🎵 Sync
            </span>
          ) : (
            "✋ Manual"
          )}
        </button>

        {/* ── MANUAL MODE ── */}
        {mode === "manual" && (
          <>
            <button
              onClick={onToggle}
              className={`btn text-sm ${
                isScrolling
                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isScrolling ? "⏸ Stop" : "▶ Scroll"}
            </button>

            <div className="flex flex-1 items-center gap-2">
              <span className="text-xs text-surface-500 whitespace-nowrap">Speed:</span>
              <input
                type="range"
                min={minSpeed}
                max={maxSpeed}
                step={0.1}
                value={speed}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-surface-200 accent-primary-600 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600"
              />
              <span className="min-w-[2.5rem] text-center text-sm font-medium text-surface-700">
                {speed.toFixed(1)}
              </span>
            </div>
          </>
        )}

        {/* ── SYNC MODE ── */}
        {mode === "sync" && (
          <>
            {/* Status */}
            <span className="text-xs text-surface-400 whitespace-nowrap">
              {syncActive
                ? hasTimestamps
                  ? "🎯 Syncing (calibrated)"
                  : "Following (estimated)..."
                : "Play YT to sync"}
            </span>

            {/* Offset controls — only show when NOT calibrated */}
            {!hasTimestamps && (
              <>
                <button
                  onClick={onTapLyricsStart}
                  className="rounded-lg bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-700 border border-amber-300 hover:bg-amber-200 transition-colors whitespace-nowrap"
                  title="Tap the moment lyrics start singing to calibrate the offset"
                >
                  🎤 Tap Start
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAdjustOffset(-1)}
                    className="rounded bg-surface-100 px-1.5 py-0.5 text-xs font-mono text-surface-600 hover:bg-surface-200"
                  >
                    −1s
                  </button>
                  <button
                    onClick={() => onAdjustOffset(-0.5)}
                    className="rounded bg-surface-100 px-1.5 py-0.5 text-xs font-mono text-surface-600 hover:bg-surface-200"
                  >
                    −.5
                  </button>
                  <span className="min-w-[3rem] text-center text-xs font-mono text-surface-500">
                    {lyricsOffset.toFixed(1)}s
                  </span>
                  <button
                    onClick={() => onAdjustOffset(0.5)}
                    className="rounded bg-surface-100 px-1.5 py-0.5 text-xs font-mono text-surface-600 hover:bg-surface-200"
                  >
                    +.5
                  </button>
                  <button
                    onClick={() => onAdjustOffset(1)}
                    className="rounded bg-surface-100 px-1.5 py-0.5 text-xs font-mono text-surface-600 hover:bg-surface-200"
                  >
                    +1s
                  </button>
                </div>
              </>
            )}

            <div className="flex-1" />
          </>
        )}

        {/* Font Size Controls — always visible */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onFontSizeChange(Math.max(10, fontSize - 2))}
            className="btn-icon text-sm font-bold"
            title="Decrease text size"
          >
            A-
          </button>
          <span className="min-w-[2rem] text-center text-xs text-surface-500">
            {fontSize}px
          </span>
          <button
            onClick={() => onFontSizeChange(Math.min(28, fontSize + 2))}
            className="btn-icon text-sm font-bold"
            title="Increase text size"
          >
            A+
          </button>
        </div>
      </div>
    </div>
  );
}
