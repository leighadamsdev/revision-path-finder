import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Brain,
  Clock3,
  ExternalLink,
  FlaskConical,
  Focus,
  Maximize2,
  Minimize2,
  Music2,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Volume2,
  Waves,
} from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { useAuth } from "@/hooks/useAuth";
import { useActivePlan } from "@/hooks/useActivePlan";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/revision-tools")({
  head: () => ({
    meta: [
      { title: "Revision Tools for GCSE Focus | rev.plan" },
      {
        name: "description",
        content:
          "Use a Pomodoro timer, lyric-free focus audio, and a distraction-blocking Focus Mode for productive GCSE revision sessions.",
      },
      { property: "og:title", content: "Your Revision Toolkit | rev.plan" },
      {
        property: "og:description",
        content: "Practical, built-in tools to help GCSE students focus and block distractions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RevisionToolsPage,
});

type TimerMode = "focus" | "break";
type Sound = "lofi" | "white" | "rain";

const TIMER_SECONDS: Record<TimerMode, number> = { focus: 25 * 60, break: 5 * 60 };
const SOUNDS: { id: Sound; label: string; icon: typeof Music2 }[] = [
  { id: "lofi", label: "Lo-Fi Beats", icon: Music2 },
  { id: "white", label: "White Noise", icon: Waves },
  { id: "rain", label: "Rain Sounds", icon: Volume2 },
];

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function ScienceBox({ children }: { children: React.ReactNode }) {
  return (
    <aside className="mt-6 overflow-hidden rounded-[8px] bg-checker-ink text-checker-paper">
      <p className="flex items-center gap-2 border-b border-checker-mint/25 px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-checker-mint">
        <FlaskConical className="size-4" /> The Science
      </p>
      <p className="px-5 py-4 text-sm font-semibold leading-relaxed text-checker-paper/80">
        {children}
      </p>
    </aside>
  );
}

function TimerTool({
  mode,
  remaining,
  running,
  onModeChange,
  onToggle,
  onReset,
  compact = false,
}: {
  mode: TimerMode;
  remaining: number;
  running: boolean;
  onModeChange: (mode: TimerMode) => void;
  onToggle: () => void;
  onReset: () => void;
  compact?: boolean;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 rounded-[8px] bg-secondary p-1" aria-label="Timer type">
        {(["focus", "break"] as const).map((option) => (
          <Button
            key={option}
            type="button"
            variant="ghost"
            onClick={() => onModeChange(option)}
            aria-pressed={mode === option}
            className={cn(
              "h-10 font-extrabold shadow-none",
              mode === option && "bg-card text-checker-ink shadow-sm hover:bg-card",
            )}
          >
            {option === "focus" ? "Focus · 25 min" : "Short break · 5 min"}
          </Button>
        ))}
      </div>
      <div className={cn("py-7 text-center", compact && "py-5")}>
        <p
          className={cn("font-extrabold tabular-nums leading-none", compact ? "text-6xl" : "text-7xl sm:text-8xl")}
          aria-live="polite"
        >
          {formatTime(remaining)}
        </p>
        <p className="mt-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          {remaining === 0 ? "Session complete" : running ? "Keep going" : "Ready when you are"}
        </p>
      </div>
      <div className="flex justify-center gap-2">
        <Button type="button" size="lg" onClick={onToggle} className="min-w-32 font-extrabold">
          {running ? <Pause /> : <Play />}
          {running ? "Pause" : remaining === 0 ? "Start again" : "Start"}
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={onReset} aria-label="Reset timer" title="Reset timer">
          <RotateCcw />
        </Button>
      </div>
    </div>
  );
}

function AudioTool({
  sound,
  playing,
  volume,
  onSoundChange,
  onToggle,
  onVolumeChange,
}: {
  sound: Sound;
  playing: boolean;
  volume: number;
  onSoundChange: (sound: Sound) => void;
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
}) {
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-3">
        {SOUNDS.map((option) => (
          <Button
            key={option.id}
            type="button"
            variant="outline"
            onClick={() => onSoundChange(option.id)}
            aria-pressed={sound === option.id}
            className={cn(
              "h-auto min-h-12 whitespace-normal px-3 py-3 font-extrabold",
              sound === option.id && "border-checker-ink bg-checker-mint/30 text-checker-ink hover:bg-checker-mint/40",
            )}
          >
            <option.icon /> {option.label}
          </Button>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-5 rounded-[8px] bg-secondary p-4 sm:flex-row sm:items-center">
        <Button type="button" onClick={onToggle} className="shrink-0 font-extrabold">
          {playing ? <Pause /> : <Play />}
          {playing ? "Pause audio" : "Play audio"}
        </Button>
        <label className="flex min-w-0 flex-1 items-center gap-3 text-sm font-extrabold">
          <Volume2 className="size-5 shrink-0" />
          <span className="sr-only">Volume</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
            className="h-2 w-full cursor-pointer accent-checker-ink"
            aria-label="Audio volume"
          />
          <span className="w-9 text-right tabular-nums">{volume}%</span>
        </label>
      </div>
      <p className="mt-3 text-center text-xs font-bold text-muted-foreground">
        {playing ? `Playing ${SOUNDS.find((item) => item.id === sound)?.label}` : "Audio paused"}
      </p>
    </div>
  );
}

function RevisionToolsPage() {
  const { user } = useAuth();
  const { plan } = useActivePlan();
  const [timerMode, setTimerMode] = useState<TimerMode>("focus");
  const [remaining, setRemaining] = useState(TIMER_SECONDS.focus);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sound, setSound] = useState<Sound>("lofi");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [volume, setVolume] = useState(35);
  const [focusMode, setFocusMode] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodesRef = useRef<AudioNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const stopAudio = useCallback(() => {
    sourceNodesRef.current.forEach((node) => {
      try {
        if (node instanceof AudioScheduledSourceNode) node.stop();
        node.disconnect();
      } catch {
        // The node may already have stopped.
      }
    });
    sourceNodesRef.current = [];
    gainRef.current = null;
    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context) void context.close();
  }, []);

  const startAudio = useCallback((selected: Sound, selectedVolume: number) => {
    stopAudio();
    const AudioContextConstructor = window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return false;

    const context = new AudioContextConstructor();
    const master = context.createGain();
    master.gain.value = (selectedVolume / 100) * 0.22;
    master.connect(context.destination);
    const nodes: AudioNode[] = [master];

    if (selected === "lofi") {
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 620;
      filter.connect(master);
      nodes.push(filter);
      [110, 164.81, 220].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const noteGain = context.createGain();
        oscillator.type = index === 0 ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        noteGain.gain.value = index === 0 ? 0.32 : 0.1;
        oscillator.connect(noteGain).connect(filter);
        oscillator.start();
        nodes.push(oscillator, noteGain);
      });
    } else {
      const length = context.sampleRate * 3;
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let index = 0; index < length; index += 1) channel[index] = Math.random() * 2 - 1;
      const noise = context.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = selected === "rain" ? "bandpass" : "lowpass";
      filter.frequency.value = selected === "rain" ? 1800 : 950;
      filter.Q.value = selected === "rain" ? 0.45 : 0.2;
      noise.connect(filter).connect(master);
      noise.start();
      nodes.push(noise, filter);
    }

    audioContextRef.current = context;
    gainRef.current = master;
    sourceNodesRef.current = nodes;
    return true;
  }, [stopAudio]);

  useEffect(() => stopAudio, [stopAudio]);

  useEffect(() => {
    const handleFullscreen = () => {
      if (!document.fullscreenElement && focusMode) setFocusMode(false);
    };
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => document.removeEventListener("fullscreenchange", handleFullscreen);
  }, [focusMode]);

  function changeTimerMode(nextMode: TimerMode) {
    setTimerMode(nextMode);
    setRemaining(TIMER_SECONDS[nextMode]);
    setTimerRunning(false);
  }

  function toggleTimer() {
    if (remaining === 0) setRemaining(TIMER_SECONDS[timerMode]);
    setTimerRunning((value) => !value);
  }

  function resetTimer() {
    setRemaining(TIMER_SECONDS[timerMode]);
    setTimerRunning(false);
  }

  function toggleAudio() {
    if (audioPlaying) {
      stopAudio();
      setAudioPlaying(false);
      return;
    }
    setAudioPlaying(startAudio(sound, volume));
  }

  function changeSound(nextSound: Sound) {
    setSound(nextSound);
    if (audioPlaying) setAudioPlaying(startAudio(nextSound, volume));
  }

  function changeVolume(nextVolume: number) {
    setVolume(nextVolume);
    if (gainRef.current) gainRef.current.gain.value = (nextVolume / 100) * 0.22;
  }

  async function enterFocusMode() {
    setFocusMode(true);
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      // The focused overlay still works when fullscreen permission is unavailable.
    }
  }

  async function exitFocusMode() {
    setFocusMode(false);
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // The overlay has already closed.
      }
    }
  }

  const timerProps = {
    mode: timerMode,
    remaining,
    running: timerRunning,
    onModeChange: changeTimerMode,
    onToggle: toggleTimer,
    onReset: resetTimer,
  };
  const audioProps = {
    sound,
    playing: audioPlaying,
    volume,
    onSoundChange: changeSound,
    onToggle: toggleAudio,
    onVolumeChange: changeVolume,
  };

  return (
    <div className="min-h-screen bg-checker-paper font-sans text-checker-ink">
      <PublicHeader />
      <main className="pb-20">
        <section className="bg-checker-ink text-checker-paper">
          <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-checker-mint">
              <span className="rounded-full bg-checker-mint px-3 py-1 text-checker-ink">Revision Tools</span>
              <span>Focus built in</span>
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
               Handy Revision Tools
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-relaxed text-checker-paper/75 sm:text-xl">
              Knowing how to revise is step one. Having the right tools to actually do it is step
              two. Use this built-in toolkit to lock in your focus and block out distractions.
            </p>
          </div>
        </section>
        <section className="mx-auto grid max-w-5xl gap-6 px-5 pt-10 lg:grid-cols-2">
          <article className="rounded-[8px] border border-checker-line bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-checker-mint"><Clock3 className="size-5" /></span>
              <div><p className="text-xs font-extrabold uppercase text-muted-foreground">Tool 1</p><h2 className="text-2xl font-extrabold">The Pomodoro Timer</h2></div>
            </div>
            <p className="mb-6 mt-4 text-sm font-semibold leading-relaxed text-muted-foreground sm:text-base">
              Set your timer, commit to the session, and don't stop until it rings.
            </p>
            <TimerTool {...timerProps} />
            <ScienceBox>Your brain has a limited attention span. The Pomodoro technique works by managing your cognitive load. Short bursts of intense focus followed by guaranteed rest prevents mental fatigue and keeps your retention rates high.</ScienceBox>
          </article>

          <article className="rounded-[8px] border border-checker-line bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-checker-mint"><Music2 className="size-5" /></span>
              <div><p className="text-xs font-extrabold uppercase text-muted-foreground">Tool 2</p><h2 className="text-2xl font-extrabold">Focus Audio Player</h2></div>
            </div>
            <p className="mb-6 mt-4 text-sm font-semibold leading-relaxed text-muted-foreground sm:text-base">
              Drown out the background noise. Choose a track, hit play, and get in the zone.
            </p>
            <AudioTool {...audioProps} />
            <ScienceBox>Listening to music with lyrics forces your brain to multitask, competing for the same language-processing centers you use to read and write. Ambient noise and lo-fi beats mask distracting background sounds without stealing your cognitive bandwidth.</ScienceBox>
          </article>

          <article className="rounded-[8px] border border-checker-line bg-card p-6 shadow-sm lg:col-span-2 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
              <div>
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-checker-mint"><ShieldCheck className="size-5" /></span>
                  <div><p className="text-xs font-extrabold uppercase text-muted-foreground">Tool 3</p><h2 className="text-2xl font-extrabold">Distraction Blocker</h2></div>
                </div>
                <p className="mt-4 text-sm font-semibold leading-relaxed text-muted-foreground sm:text-base">
                  Your phone isn't the only distraction. Keep your browser locked down. Hit Focus Mode to fill your screen, or use a website blocker to banish social media while you work.
                </p>
                <Button type="button" size="lg" onClick={enterFocusMode} className="mt-6 font-extrabold">
                  <Maximize2 /> Toggle Focus Mode
                </Button>
              </div>
              <div className="rounded-[8px] bg-secondary p-5">
                <p className="flex items-center gap-2 text-sm font-extrabold"><Focus className="size-4" /> Block other websites</p>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">For a harder block, try one of these Chrome extensions:</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href="https://getcoldturkey.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[8px] border border-border bg-card px-3 py-2 text-sm font-extrabold hover:bg-checker-mint/20">Cold Turkey <ExternalLink className="size-3.5" /></a>
                  <a href="https://www.stayfocusd.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[8px] border border-border bg-card px-3 py-2 text-sm font-extrabold hover:bg-checker-mint/20">StayFocusd <ExternalLink className="size-3.5" /></a>
                </div>
              </div>
            </div>
            <ScienceBox>Every time you switch tasks to check a notification, you suffer from “Attention Residue.” It takes an average of 23 minutes to fully regain your deep focus after being distracted. Blocking websites removes the temptation entirely.</ScienceBox>
          </article>
        </section>
        <section className="mx-auto mt-10 max-w-5xl px-5">
          <div className="rounded-[8px] bg-checker-ink p-6 text-checker-paper sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div><h2 className="text-xl font-extrabold">Put your focused sessions into a plan</h2><p className="mt-1 text-sm font-semibold text-checker-paper/70">Turn these tools into a routine you can follow each week.</p></div>
            <Button asChild className="mt-4 shrink-0 sm:mt-0">
              {user ? (plan ? <Link to="/plan">Open my plan</Link> : <Link to="/setup">Create your revision plan</Link>) : <Link to="/auth" search={{ mode: "signup", context: "create-plan", returnTo: "/setup" }}>Create your revision plan</Link>}
            </Button>
          </div>
        </section>
      </main>

      {focusMode ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-checker-ink px-4 py-5 text-checker-paper sm:px-8 sm:py-8" role="dialog" aria-modal="true" aria-label="Focus Mode">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between gap-4">
              <p className="flex items-center gap-2 text-sm font-extrabold uppercase text-checker-mint"><Brain className="size-5" /> Focus Mode</p>
              <Button type="button" variant="outline" onClick={exitFocusMode} className="border-checker-mint/40 bg-checker-ink text-checker-paper hover:bg-checker-mint hover:text-checker-ink"><Minimize2 /> Exit</Button>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <section className="rounded-[8px] bg-checker-paper p-5 text-checker-ink shadow-sm sm:p-8"><h2 className="mb-5 text-lg font-extrabold">Timer</h2><TimerTool {...timerProps} compact /></section>
              <section className="rounded-[8px] bg-checker-paper p-5 text-checker-ink shadow-sm sm:p-8"><h2 className="mb-5 text-lg font-extrabold">Focus audio</h2><AudioTool {...audioProps} /></section>
            </div>
            <p className="mt-6 text-center text-sm font-bold text-checker-paper/60">One task. One session. Everything else can wait.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}