import { useMemo } from "react";

interface Props {
  content: string;
  fontSize: number;
  onChordClick?: (chord: string) => void;
  activeLine?: number;
  lineProgress?: number;
}

export interface ParsedLine {
  type: "mixed" | "chords-only" | "empty";
  segments: { text: string; chord?: string }[];
}

export function parseContent(content: string): ParsedLine[] {
  const rawLines = content.split("\n");
  const result: ParsedLine[] = [];

  for (const line of rawLines) {
    if (line.trim() === "") {
      result.push({ type: "empty", segments: [] });
      continue;
    }

    const segments: { text: string; chord?: string }[] = [];
    const regex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match;
    let hasLyrics = false;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        const text = line.slice(lastIndex, match.index);
        if (segments.length > 0) {
          segments[segments.length - 1].text += text;
        } else {
          segments.push({ text });
        }
        if (text.trim()) hasLyrics = true;
      }
      segments.push({ text: "", chord: match[1] });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      const remaining = line.slice(lastIndex);
      if (segments.length > 0) {
        segments[segments.length - 1].text += remaining;
      } else {
        segments.push({ text: remaining });
      }
      if (remaining.trim()) hasLyrics = true;
    }

    if (segments.length === 0) {
      segments.push({ text: line });
      hasLyrics = true;
    }

    result.push({ type: hasLyrics ? "mixed" : "chords-only", segments });
  }
  return result;
}

/**
 * Compute a weight for each non-empty line based on text length.
 * Longer lines get proportionally more time in the sync tracker.
 */
export function computeLineWeights(content: string): number[] {
  const lines = parseContent(content);
  const weights: number[] = [];

  for (const line of lines) {
    if (line.type === "empty") continue;

    if (line.type === "chords-only") {
      // Instrumental/chord-only — moderate weight (like a short pause)
      const chordCount = line.segments.filter((s) => s.chord).length;
      weights.push(Math.max(chordCount * 6, 8));
    } else {
      // Lyrics — weight by character count
      const textLen = line.segments.reduce((sum, seg) => sum + seg.text.length, 0);
      weights.push(Math.max(textLen, 8));
    }
  }

  return weights;
}

/** Count non-empty lines */
export function countContentLines(content: string): number {
  return parseContent(content).filter((l) => l.type !== "empty").length;
}

export default function LyricsRenderer({
  content,
  fontSize,
  onChordClick,
  activeLine = -1,
  lineProgress = 0,
}: Props) {
  const lines = useMemo(() => parseContent(content), [content]);

  let nonEmptyIdx = -1;

  return (
    <div
      className="font-mono leading-relaxed whitespace-pre-wrap"
      style={{ fontSize: `${fontSize}px` }}
    >
      {lines.map((line, lineIdx) => {
        if (line.type === "empty") {
          return <div key={lineIdx} className="h-4" />;
        }

        nonEmptyIdx++;
        const thisLineIdx = nonEmptyIdx;
        const isActive = activeLine >= 0 && thisLineIdx === activeLine;
        const isPast = activeLine >= 0 && thisLineIdx < activeLine;
        const isFuture = activeLine >= 0 && thisLineIdx > activeLine;

        let lineOpacity = "";
        if (activeLine >= 0) {
          if (isFuture) lineOpacity = "opacity-35";
          else if (isPast) lineOpacity = "opacity-75";
        }

        return (
          <div
            key={lineIdx}
            data-line={thisLineIdx}
            className={`mb-1 rounded-md px-1.5 -mx-1.5 transition-all duration-500 ${
              isActive ? "bg-blue-50/90 py-0.5" : ""
            } ${lineOpacity}`}
          >
            {/* Chord line */}
            <div className="min-h-[1.4em]">
              {line.segments.map((seg, segIdx) => (
                <span key={segIdx} className="inline">
                  {seg.chord && (
                    <span
                      className={`font-bold cursor-pointer hover:underline ${
                        isActive ? "text-red-500" : "chord-text"
                      }`}
                      onClick={() => onChordClick?.(seg.chord!)}
                      role="button"
                      tabIndex={0}
                    >
                      {seg.chord}
                    </span>
                  )}
                  {!seg.chord && seg.text && <span className="invisible">{seg.text}</span>}
                  {seg.chord && !seg.text && " "}
                </span>
              ))}
            </div>

            {/* Lyrics with animated fill */}
            {line.type === "mixed" && (
              <div className="relative">
                {/* Base text (unfilled) */}
                <div className={isActive ? "text-surface-300" : ""}>
                  {line.segments.map((seg, segIdx) => (
                    <span key={segIdx}>
                      {seg.chord && <span className="invisible inline">{seg.chord}</span>}
                      {seg.text}
                    </span>
                  ))}
                </div>

                {/* Animated color fill sweeping left→right */}
                {isActive && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
                    <div
                      className="text-blue-600 font-semibold whitespace-pre-wrap"
                      style={{
                        clipPath: `inset(0 ${Math.max(0, (1 - lineProgress) * 100)}% 0 0)`,
                        transition: "clip-path 0.12s linear",
                      }}
                    >
                      {line.segments.map((seg, segIdx) => (
                        <span key={segIdx}>
                          {seg.chord && <span className="invisible inline">{seg.chord}</span>}
                          {seg.text}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past lines show fully colored */}
                {isPast && activeLine >= 0 && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
                    <div className="text-blue-500/60 whitespace-pre-wrap">
                      {line.segments.map((seg, segIdx) => (
                        <span key={segIdx}>
                          {seg.chord && <span className="invisible inline">{seg.chord}</span>}
                          {seg.text}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress bar for chord-only lines */}
            {line.type === "chords-only" && isActive && (
              <div className="h-0.5 mt-1 rounded-full bg-surface-200 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${lineProgress * 100}%`,
                    transition: "width 0.12s linear",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
