import { useState } from "react";
import { getChordDiagrams } from "@/utils/chordDb";
import type { ChordDiagram as ChordDiagramType } from "@/types";

interface Props {
  chordName: string;
  onClose?: () => void;
}

export default function ChordDiagram({ chordName, onClose }: Props) {
  const diagrams = getChordDiagrams(chordName);
  const [currentIdx, setCurrentIdx] = useState(0);

  if (diagrams.length === 0) {
    return (
      <div className="rounded-xl bg-surface-100 p-4 text-center text-sm text-surface-500">
        No diagram available for <strong>{chordName}</strong>
      </div>
    );
  }

  const diagram = diagrams[currentIdx];
  const numFrets = 5;
  const startFret = diagram.baseFret;

  // SVG dimensions
  const svgW = 160;
  const svgH = 200;
  const padTop = 40;
  const padLeft = 30;
  const padRight = 15;
  const stringSpacing = (svgW - padLeft - padRight) / 5;
  const fretSpacing = (svgH - padTop - 20) / numFrets;

  const stringX = (s: number) => padLeft + s * stringSpacing;
  const fretY = (f: number) => padTop + f * fretSpacing;

  return (
    <div className="flex flex-col items-center">
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
        {/* Nut (thick bar at top if open position) */}
        {startFret === 1 && (
          <rect x={padLeft - 2} y={padTop - 3} width={stringSpacing * 5 + 4} height={6} rx={1} fill="#1e293b" />
        )}

        {/* Fret lines */}
        {Array.from({ length: numFrets + 1 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1={padLeft}
            y1={fretY(i)}
            x2={padLeft + stringSpacing * 5}
            y2={fretY(i)}
            stroke="#94a3b8"
            strokeWidth={i === 0 ? 2 : 1}
          />
        ))}

        {/* String lines */}
        {Array.from({ length: 6 }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={stringX(i)}
            y1={padTop}
            x2={stringX(i)}
            y2={fretY(numFrets)}
            stroke="#64748b"
            strokeWidth={1.2}
          />
        ))}

        {/* Fret numbers */}
        {startFret > 1 && (
          <text x={8} y={fretY(0.5) + 5} fontSize={12} fill="#64748b" textAnchor="middle">
            {startFret}
          </text>
        )}

        {/* Open / Muted indicators */}
        {diagram.frets.map((fret, s) => {
          const x = stringX(s);
          if (fret === 0) {
            return (
              <circle key={`open-${s}`} cx={x} cy={padTop - 15} r={5} fill="none" stroke="#64748b" strokeWidth={1.5} />
            );
          }
          if (fret === -1) {
            return (
              <text key={`mute-${s}`} x={x} y={padTop - 10} fontSize={14} fill="#64748b" textAnchor="middle">
                ×
              </text>
            );
          }
          return null;
        })}

        {/* Barres */}
        {diagram.barres?.map((barre, i) => {
          const fretPos = barre.fret - startFret + 1;
          const y = fretY(fretPos) - fretSpacing / 2;
          const x1 = stringX(barre.fromString);
          const x2 = stringX(barre.toString);
          return (
            <rect
              key={`barre-${i}`}
              x={Math.min(x1, x2) - 6}
              y={y - 6}
              width={Math.abs(x2 - x1) + 12}
              height={12}
              rx={6}
              fill="#1e293b"
            />
          );
        })}

        {/* Finger dots */}
        {diagram.frets.map((fret, s) => {
          if (fret <= 0) return null;
          const fretPos = fret - startFret + 1;
          const x = stringX(s);
          const y = fretY(fretPos) - fretSpacing / 2;

          // Skip if covered by barre
          const isBarre = diagram.barres?.some(
            (b) =>
              b.fret === fret &&
              s >= Math.min(b.fromString, b.toString) &&
              s <= Math.max(b.fromString, b.toString)
          );
          if (isBarre) return null;

          return (
            <g key={`dot-${s}`}>
              <circle cx={x} cy={y} r={8} fill="#1e293b" />
              {diagram.fingers[s] > 0 && (
                <text x={x} y={y + 4} fontSize={10} fill="white" textAnchor="middle">
                  {diagram.fingers[s]}
                </text>
              )}
            </g>
          );
        })}

        {/* String labels at bottom */}
        {["E", "A", "D", "G", "B", "e"].map((label, i) => (
          <text
            key={`label-${i}`}
            x={stringX(i)}
            y={svgH - 2}
            fontSize={10}
            fill="#94a3b8"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Variation selector */}
      {diagrams.length > 1 && (
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={() => setCurrentIdx((prev) => (prev - 1 + diagrams.length) % diagrams.length)}
            className="btn-icon text-sm"
          >
            ◀
          </button>
          <span className="text-sm text-surface-500">
            {currentIdx + 1} / {diagrams.length}
          </span>
          <button
            onClick={() => setCurrentIdx((prev) => (prev + 1) % diagrams.length)}
            className="btn-icon text-sm"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}
