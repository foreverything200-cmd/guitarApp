/**
 * Client-side chord transposition — mirrors server logic for real-time preview.
 */

const SHARP_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_NOTES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const NOTE_MAP: Record<string, number> = {};
SHARP_NOTES.forEach((n, i) => (NOTE_MAP[n] = i));
FLAT_NOTES.forEach((n, i) => (NOTE_MAP[n] = i));

const CHORD_ROOT_RE = /^([A-G][#b]?)/;

export function transposeChord(chord: string, semitones: number): string {
  const match = chord.match(CHORD_ROOT_RE);
  if (!match) return chord;
  const root = match[1];
  const quality = chord.slice(root.length);
  const idx = NOTE_MAP[root];
  if (idx === undefined) return chord;
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  const useFlats = root.includes("b");
  return (useFlats ? FLAT_NOTES[newIdx] : SHARP_NOTES[newIdx]) + quality;
}

export function transposeContent(content: string, originalCapo: number, newCapo: number): string {
  const semitones = originalCapo - newCapo;
  if (semitones === 0) return content;
  return content.replace(/\[([^\]]+)\]/g, (_m, chord: string) => {
    if (chord.includes("/")) {
      const [main, bass] = chord.split("/");
      return `[${transposeChord(main, semitones)}/${transposeChord(bass, semitones)}]`;
    }
    return `[${transposeChord(chord, semitones)}]`;
  });
}

export function extractChords(content: string): string[] {
  const chords = new Set<string>();
  const re = /\[([^\]]+)\]/g;
  let m;
  while ((m = re.exec(content)) !== null) chords.add(m[1]);
  return Array.from(chords).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}
