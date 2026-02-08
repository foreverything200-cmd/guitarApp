/**
 * Complete chord transposition engine.
 *
 * The chromatic scale has 12 semitones:
 *   C, C#, D, D#, E, F, F#, G, G#, A, A#, B
 *
 * To transpose: shift the root note by N semitones, keep the quality (m, 7, maj7, etc.).
 * Capo transpose: difference = newCapo - originalCapo, then shift by -difference
 * (moving capo UP means the open chords sound HIGHER, so written chords go DOWN).
 */

const SHARP_NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const FLAT_NOTES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

// Map all note names to their semitone index
const NOTE_MAP: Record<string, number> = {};
SHARP_NOTES.forEach((n, i) => (NOTE_MAP[n] = i));
FLAT_NOTES.forEach((n, i) => (NOTE_MAP[n] = i));

// Regex to match a chord root (with optional # or b) at the start
const CHORD_ROOT_RE = /^([A-G][#b]?)/;

/** Transpose a single chord by `semitones` half-steps. */
export function transposeChord(chord: string, semitones: number): string {
  const match = chord.match(CHORD_ROOT_RE);
  if (!match) return chord;

  const root = match[1];
  const quality = chord.slice(root.length); // e.g., "m7", "sus4", "maj7"
  const idx = NOTE_MAP[root];
  if (idx === undefined) return chord;

  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  // Use sharps by default; use flats if original used flats
  const useFlats = root.includes("b");
  const newRoot = useFlats ? FLAT_NOTES[newIdx] : SHARP_NOTES[newIdx];

  return newRoot + quality;
}

/**
 * Transpose all chords in a content string (bracket notation).
 * Content format: "[Am]Lyrics [G]here [F]more"
 */
export function transposeContent(
  content: string,
  originalCapo: number,
  newCapo: number
): string {
  const semitones = originalCapo - newCapo;
  if (semitones === 0) return content;

  return content.replace(/\[([^\]]+)\]/g, (_match, chord: string) => {
    // Handle slash chords: "Am/G" -> transpose both parts
    if (chord.includes("/")) {
      const [main, bass] = chord.split("/");
      return `[${transposeChord(main, semitones)}/${transposeChord(bass, semitones)}]`;
    }
    return `[${transposeChord(chord, semitones)}]`;
  });
}

/** Extract unique chord names from bracket-notation content, sorted alphabetically. */
export function extractChords(content: string): string[] {
  const chords = new Set<string>();
  const re = /\[([^\]]+)\]/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    chords.add(match[1]);
  }
  return Array.from(chords).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}
