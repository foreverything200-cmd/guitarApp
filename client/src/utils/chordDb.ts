import type { ChordDiagram } from "@/types";

/**
 * Comprehensive chord diagram database.
 * Each chord has multiple voicings (variations).
 *
 * frets array: [6th(E), 5th(A), 4th(D), 3rd(G), 2nd(B), 1st(e)]
 *   -1 = muted, 0 = open, 1+ = finger on that fret
 * fingers array: corresponding finger numbers (0 = none, 1-4 = index to pinky)
 */

export const CHORD_DB: Record<string, ChordDiagram[]> = {
  // ─── Major Chords ───
  C: [
    { name: "C", baseFret: 1, frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
    { name: "C", baseFret: 3, frets: [-1, 3, 5, 5, 5, 3], fingers: [0, 1, 3, 3, 3, 1], barres: [{ fret: 3, fromString: 1, toString: 5 }] },
  ],
  D: [
    { name: "D", baseFret: 1, frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
    { name: "D", baseFret: 5, frets: [-1, 5, 7, 7, 7, 5], fingers: [0, 1, 3, 3, 3, 1], barres: [{ fret: 5, fromString: 1, toString: 5 }] },
  ],
  E: [
    { name: "E", baseFret: 1, frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  ],
  F: [
    { name: "F", baseFret: 1, frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 4, 3, 1], barres: [{ fret: 1, fromString: 0, toString: 5 }] },
    { name: "F", baseFret: 1, frets: [-1, -1, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], barres: [{ fret: 1, fromString: 4, toString: 5 }] },
  ],
  G: [
    { name: "G", baseFret: 1, frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
    { name: "G", baseFret: 1, frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, 0, 0, 3, 4] },
  ],
  A: [
    { name: "A", baseFret: 1, frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
    { name: "A", baseFret: 5, frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 5, fromString: 0, toString: 5 }] },
  ],
  B: [
    { name: "B", baseFret: 2, frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 3, 3, 3, 1], barres: [{ fret: 2, fromString: 1, toString: 5 }] },
  ],

  // ─── Minor Chords ───
  Am: [
    { name: "Am", baseFret: 1, frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
    { name: "Am", baseFret: 5, frets: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 5, fromString: 0, toString: 5 }] },
  ],
  Bm: [
    { name: "Bm", baseFret: 2, frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 2, fromString: 1, toString: 5 }] },
  ],
  Cm: [
    { name: "Cm", baseFret: 3, frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 3, fromString: 1, toString: 5 }] },
  ],
  Dm: [
    { name: "Dm", baseFret: 1, frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  ],
  Em: [
    { name: "Em", baseFret: 1, frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  ],
  Fm: [
    { name: "Fm", baseFret: 1, frets: [1, 1, 3, 3, 2, 1], fingers: [1, 1, 3, 4, 2, 1], barres: [{ fret: 1, fromString: 0, toString: 5 }] },
  ],
  Gm: [
    { name: "Gm", baseFret: 3, frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 3, fromString: 0, toString: 5 }] },
  ],

  // ─── 7th Chords ───
  A7: [
    { name: "A7", baseFret: 1, frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 3, 0] },
  ],
  B7: [
    { name: "B7", baseFret: 1, frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
  ],
  C7: [
    { name: "C7", baseFret: 1, frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  ],
  D7: [
    { name: "D7", baseFret: 1, frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  ],
  E7: [
    { name: "E7", baseFret: 1, frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  ],
  G7: [
    { name: "G7", baseFret: 1, frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  ],

  // ─── Minor 7th ───
  Am7: [
    { name: "Am7", baseFret: 1, frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
  ],
  Dm7: [
    { name: "Dm7", baseFret: 1, frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], barres: [{ fret: 1, fromString: 4, toString: 5 }] },
  ],
  Em7: [
    { name: "Em7", baseFret: 1, frets: [0, 2, 2, 0, 3, 0], fingers: [0, 1, 2, 0, 3, 0] },
    { name: "Em7", baseFret: 1, frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0] },
  ],

  // ─── Suspended ───
  Dsus2: [
    { name: "Dsus2", baseFret: 1, frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0] },
  ],
  Dsus4: [
    { name: "Dsus4", baseFret: 1, frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
  ],
  Asus2: [
    { name: "Asus2", baseFret: 1, frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },
  ],
  Asus4: [
    { name: "Asus4", baseFret: 1, frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
  ],
  A7sus4: [
    { name: "A7sus4", baseFret: 1, frets: [-1, 0, 2, 0, 3, 0], fingers: [0, 0, 1, 0, 3, 0] },
  ],

  // ─── Other ───
  Cadd9: [
    { name: "Cadd9", baseFret: 1, frets: [-1, 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0] },
  ],
  Fmaj7: [
    { name: "Fmaj7", baseFret: 1, frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0] },
    { name: "Fmaj7", baseFret: 1, frets: [1, -1, 2, 2, 1, 0], fingers: [1, 0, 3, 2, 1, 0] },
  ],
  "D/F#": [
    { name: "D/F#", baseFret: 1, frets: [2, -1, 0, 2, 3, 2], fingers: [1, 0, 0, 2, 4, 3] },
  ],
};

/** Get chord diagrams by name, returns empty array if not found */
export function getChordDiagrams(chordName: string): ChordDiagram[] {
  return CHORD_DB[chordName] || [];
}

/** Get ALL chord names in the DB, sorted */
export function getAllChordNames(): string[] {
  return Object.keys(CHORD_DB).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}
