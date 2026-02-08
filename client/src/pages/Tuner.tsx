import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const STRINGS = [
  { note: "E2", freq: 82.41, label: "E", octave: "low" },
  { note: "A2", freq: 110.0, label: "A", octave: "" },
  { note: "D3", freq: 146.83, label: "D", octave: "" },
  { note: "G3", freq: 196.0, label: "G", octave: "" },
  { note: "B3", freq: 246.94, label: "B", octave: "" },
  { note: "E4", freq: 329.63, label: "e", octave: "high" },
];

const ALL_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function noteFromFrequency(freq: number): { note: string; cents: number; octave: number } {
  const noteNum = 12 * (Math.log2(freq / 440));
  const noteIndex = Math.round(noteNum) + 69;
  const note = ALL_NOTES[noteIndex % 12];
  const octave = Math.floor(noteIndex / 12) - 1;
  const cents = Math.round((noteNum - Math.round(noteNum)) * 100);
  return { note, cents, octave };
}

function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  // Simple autocorrelation pitch detection
  let size = buf.length;
  let rms = 0;

  for (let i = 0; i < size; i++) {
    rms += buf[i] * buf[i];
  }
  rms = Math.sqrt(rms / size);

  if (rms < 0.01) return -1; // Not enough signal

  // Trim silence from edges
  let r1 = 0, r2 = size - 1;
  const threshold = 0.2;
  for (let i = 0; i < size / 2; i++) {
    if (Math.abs(buf[i]) < threshold) { r1 = i; break; }
  }
  for (let i = 1; i < size / 2; i++) {
    if (Math.abs(buf[size - i]) < threshold) { r2 = size - i; break; }
  }

  buf = buf.slice(r1, r2);
  size = buf.length;

  // Autocorrelation
  const c = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size - i; j++) {
      c[i] += buf[j] * buf[j + i];
    }
  }

  // Find first dip
  let d = 0;
  while (c[d] > c[d + 1] && d < size) d++;

  // Find peak after dip
  let maxVal = -1;
  let maxPos = -1;
  for (let i = d; i < size; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i];
      maxPos = i;
    }
  }

  const T0 = maxPos;
  if (T0 === 0 || T0 === -1) return -1;

  return sampleRate / T0;
}

export default function Tuner() {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string>("-");
  const [detectedOctave, setDetectedOctave] = useState<number>(0);
  const [cents, setCents] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [selectedString, setSelectedString] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const startTuner = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsActive(true);
      detect();
    } catch (err) {
      alert("Could not access microphone. Please allow microphone access.");
      console.error(err);
    }
  }, []);

  const stopTuner = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    setIsActive(false);
    setDetectedNote("-");
    setCents(0);
    setFrequency(0);
  }, []);

  const detect = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const buf = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(buf);

    const freq = autoCorrelate(buf, audioContextRef.current.sampleRate);

    if (freq > 0 && freq < 1000) {
      const { note, cents: c, octave } = noteFromFrequency(freq);
      setDetectedNote(note);
      setCents(c);
      setDetectedOctave(octave);
      setFrequency(Math.round(freq * 10) / 10);
    }

    rafRef.current = requestAnimationFrame(detect);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close();
    };
  }, []);

  // Needle rotation: -45deg to +45deg based on cents (-50 to +50)
  const needleRotation = Math.max(-45, Math.min(45, (cents / 50) * 45));
  const isInTune = Math.abs(cents) < 5;
  const isClose = Math.abs(cents) < 15;

  return (
    <div className="flex min-h-dvh flex-col bg-surface-900 text-white">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(-1)} className="btn-icon text-white hover:bg-white/10">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">🎸 Guitar Tuner</h1>
      </header>

      {/* Main */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4 lg:flex-row lg:gap-16">
        {/* Tuner Display */}
        <div className="flex flex-col items-center gap-6">
          {/* Note Display */}
          <div className="text-center">
            <div
              className={`text-8xl font-bold transition-colors ${
                isInTune ? "text-green-400" : isClose ? "text-yellow-400" : "text-red-400"
              }`}
            >
              {detectedNote}
            </div>
            {detectedNote !== "-" && (
              <div className="mt-1 text-sm text-surface-400">
                {frequency} Hz &middot; Octave {detectedOctave}
              </div>
            )}
          </div>

          {/* Needle Meter */}
          <div className="relative h-32 w-64">
            {/* Arc background */}
            <svg viewBox="0 0 200 100" className="w-full">
              <path
                d="M 10 90 A 90 90 0 0 1 190 90"
                fill="none"
                stroke="#334155"
                strokeWidth="4"
              />
              {/* Green zone in center */}
              <path
                d="M 92 14 A 90 90 0 0 1 108 14"
                fill="none"
                stroke="#22c55e"
                strokeWidth="6"
              />
              {/* Tick marks */}
              {Array.from({ length: 11 }, (_, i) => {
                const angle = -90 + i * 18;
                const rad = (angle * Math.PI) / 180;
                const x1 = 100 + 82 * Math.cos(rad);
                const y1 = 90 + 82 * Math.sin(rad);
                const x2 = 100 + 90 * Math.cos(rad);
                const y2 = 90 + 90 * Math.sin(rad);
                return (
                  <line
                    key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={i === 5 ? "#22c55e" : "#64748b"}
                    strokeWidth={i === 5 ? 2 : 1}
                  />
                );
              })}
            </svg>
            {/* Needle */}
            <div
              className="absolute bottom-2 left-1/2 h-24 w-0.5 origin-bottom transition-transform duration-150"
              style={{
                transform: `translateX(-50%) rotate(${needleRotation}deg)`,
                background: isInTune
                  ? "#22c55e"
                  : isClose
                  ? "#eab308"
                  : "#ef4444",
              }}
            />
            <div className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-white" />
          </div>

          {/* Cents display */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-surface-400">-50</span>
            <span
              className={`text-lg font-bold ${
                isInTune ? "text-green-400" : isClose ? "text-yellow-400" : "text-red-400"
              }`}
            >
              {cents > 0 ? "+" : ""}
              {cents} cents
            </span>
            <span className="text-surface-400">+50</span>
          </div>

          {/* Start/Stop */}
          <button
            onClick={isActive ? stopTuner : startTuner}
            className={`rounded-full px-8 py-3 text-lg font-bold transition-all ${
              isActive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isActive ? "Stop" : "Start Tuner"}
          </button>
        </div>

        {/* String Buttons */}
        <div className="flex gap-3 lg:flex-col">
          {STRINGS.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelectedString(selectedString === i ? null : i)}
              className={`flex h-16 w-16 flex-col items-center justify-center rounded-xl text-sm font-bold transition-all ${
                selectedString === i
                  ? "bg-primary-600 scale-110"
                  : "bg-surface-700 hover:bg-surface-600"
              } ${
                isActive &&
                detectedNote === s.label.toUpperCase() &&
                Math.abs(cents) < 10
                  ? "ring-2 ring-green-400"
                  : ""
              }`}
            >
              <span className="text-xl">{s.label}</span>
              <span className="text-[10px] text-surface-300">
                {s.freq.toFixed(0)} Hz
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
