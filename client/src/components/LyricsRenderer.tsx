import { useMemo } from "react";

interface Props {
  content: string;
  fontSize: number;
  onChordClick?: (chord: string) => void;
}

interface ParsedLine {
  type: "mixed" | "chords-only" | "empty";
  segments: { text: string; chord?: string }[];
}

function parseContent(content: string): ParsedLine[] {
  const rawLines = content.split("\n");
  const result: ParsedLine[] = [];

  for (const line of rawLines) {
    if (line.trim() === "") {
      result.push({ type: "empty", segments: [] });
      continue;
    }

    // Parse [Chord]text segments
    const segments: { text: string; chord?: string }[] = [];
    const regex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match;
    let hasLyrics = false;

    while ((match = regex.exec(line)) !== null) {
      // Text before this chord
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

    // Remaining text after last chord
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

    const type = hasLyrics ? "mixed" : "chords-only";
    result.push({ type, segments });
  }

  return result;
}

export default function LyricsRenderer({ content, fontSize, onChordClick }: Props) {
  const lines = useMemo(() => parseContent(content), [content]);

  return (
    <div
      className="font-mono leading-relaxed whitespace-pre-wrap"
      style={{ fontSize: `${fontSize}px` }}
    >
      {lines.map((line, lineIdx) => {
        if (line.type === "empty") {
          return <div key={lineIdx} className="h-4" />;
        }

        return (
          <div key={lineIdx} className="mb-1">
            {/* Chord line */}
            <div className="min-h-[1.4em]">
              {line.segments.map((seg, segIdx) => (
                <span key={segIdx} className="inline">
                  {seg.chord && (
                    <span
                      className="chord-text cursor-pointer hover:underline"
                      onClick={() => onChordClick?.(seg.chord!)}
                      role="button"
                      tabIndex={0}
                    >
                      {seg.chord}
                    </span>
                  )}
                  {!seg.chord && seg.text && (
                    // Spacer for text without chords above it
                    <span className="invisible">{seg.text}</span>
                  )}
                  {seg.chord && !seg.text && " "}
                </span>
              ))}
            </div>
            {/* Lyrics line (only if there are actual lyrics) */}
            {line.type === "mixed" && (
              <div>
                {line.segments.map((seg, segIdx) => (
                  <span key={segIdx}>
                    {seg.chord && (
                      <span className="invisible inline">
                        {seg.chord}
                      </span>
                    )}
                    {seg.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
