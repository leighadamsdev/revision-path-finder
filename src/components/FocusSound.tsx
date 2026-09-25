import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";

type Sound = "lofi" | "white" | "rain";
const SOUNDS: { id: Sound; label: string }[] = [
  { id: "lofi", label: "Lo-Fi" },
  { id: "white", label: "White noise" },
  { id: "rain", label: "Rain" },
];

/** Compact focus-sound controls (sound choice, play/pause, volume) — generated in the browser. */
export function FocusSound({ className = "" }: { className?: string }) {
  const [sound, setSound] = useState<Sound>("lofi");
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(35);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const stop = useCallback(() => {
    const ctx = ctxRef.current;
    ctxRef.current = null;
    gainRef.current = null;
    if (ctx) void ctx.close();
  }, []);

  const start = useCallback(
    (selected: Sound, vol: number) => {
      stop();
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = (vol / 100) * 0.22;
      master.connect(ctx.destination);
      if (selected === "lofi") {
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 620;
        filter.connect(master);
        [110, 164.81, 220].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = i === 0 ? "sine" : "triangle";
          o.frequency.value = f;
          g.gain.value = i === 0 ? 0.32 : 0.1;
          o.connect(g).connect(filter);
          o.start();
        });
      } else {
        const len = ctx.sampleRate * 3;
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const ch = buf.getChannelData(0);
        for (let i = 0; i < len; i += 1) ch[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = selected === "rain" ? "bandpass" : "lowpass";
        filter.frequency.value = selected === "rain" ? 1800 : 950;
        noise.connect(filter).connect(master);
        noise.start();
      }
      ctxRef.current = ctx;
      gainRef.current = master;
      return true;
    },
    [stop],
  );

  useEffect(() => stop, [stop]);
  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = (volume / 100) * 0.22;
  }, [volume]);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <select
        value={sound}
        aria-label="Focus sound"
        onChange={(e) => {
          const next = e.target.value as Sound;
          setSound(next);
          if (playing) setPlaying(start(next, volume));
        }}
        className="h-9 rounded-md bg-card px-2 text-xs font-bold text-foreground ring-1 ring-border"
      >
        {SOUNDS.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => {
          if (playing) {
            stop();
            setPlaying(false);
          } else setPlaying(start(sound, volume));
        }}
        className="inline-flex h-9 items-center gap-1 rounded-md px-3 text-xs font-extrabold ring-1 ring-current"
        aria-label={playing ? "Pause sound" : "Play sound"}
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        {playing ? "Pause sound" : "Play sound"}
      </button>
      <label className="flex items-center gap-1.5">
        <Volume2 className="size-4" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Sound volume"
          className="w-24 cursor-pointer"
        />
      </label>
    </div>
  );
}
