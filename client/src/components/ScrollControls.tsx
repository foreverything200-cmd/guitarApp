interface Props {
  isScrolling: boolean;
  speed: number;
  onToggle: () => void;
  onSpeedChange: (speed: number) => void;
  minSpeed: number;
  maxSpeed: number;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
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
}: Props) {
  return (
    <div className="no-print sticky bottom-0 z-30 border-t border-surface-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5">
        {/* Play/Pause */}
        <button
          onClick={onToggle}
          className={`btn text-sm ${isScrolling ? "bg-yellow-500 text-white hover:bg-yellow-600" : "bg-green-600 text-white hover:bg-green-700"}`}
        >
          {isScrolling ? "⏸ Stop" : "▶ Scroll"}
        </button>

        {/* Speed Slider */}
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

        {/* Font Size Controls */}
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
