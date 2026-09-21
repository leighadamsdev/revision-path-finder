import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** A soft two-note chime — nothing jarring for a study timer. */
function playChime() {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    [0, 0.45].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = i === 0 ? 587.33 : 880;
      const start = ctx.currentTime + offset;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.14, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 1);
    });
    setTimeout(() => void ctx.close(), 2000);
  } catch {
    // A missing audio device shouldn't break the timer.
  }
}

function clock(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function SessionTimer({
  open,
  onOpenChange,
  topic,
  subjectName,
  plannedMinutes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: string;
  subjectName: string;
  plannedMinutes: number;
}) {
  const [minutes, setMinutes] = useState(plannedMinutes);
  const [remaining, setRemaining] = useState(plannedMinutes * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reopening the timer starts from the planned length again.
  useEffect(() => {
    if (!open) return;
    setMinutes(plannedMinutes);
    setRemaining(plannedMinutes * 60);
    setRunning(false);
    setFinished(false);
  }, [open, plannedMinutes]);

  useEffect(() => {
    if (!running) return;
    interval.current = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false);
          setFinished(true);
          playChime();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [running]);

  function adjust(next: number) {
    const clamped = Math.min(180, Math.max(5, next));
    setMinutes(clamped);
    setRemaining(clamped * 60);
    setRunning(false);
    setFinished(false);
  }

  function reset() {
    setRemaining(minutes * 60);
    setRunning(false);
    setFinished(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{subjectName}</DialogTitle>
          <DialogDescription className="font-semibold text-foreground">
            {topic || "Topic to be decided"}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-[16px] bg-background p-5 text-center ring-1 ring-border">
          <p className="text-5xl font-extrabold tabular-nums tracking-tight">{clock(remaining)}</p>
          <p className="mt-2 text-[12px] font-bold text-muted-foreground">
            {finished ? "Time's up — nicely done." : `${minutes} minute session`}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => adjust(minutes - 5)}>
            −5 min
          </Button>
          <Button variant="outline" size="sm" onClick={() => adjust(minutes + 5)}>
            +5 min
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => {
              if (finished) reset();
              setRunning((value) => !value);
            }}
          >
            {running ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            {running ? "Pause" : finished ? "Start again" : remaining < minutes * 60 ? "Resume" : "Start"}
          </Button>
          <Button variant="outline" onClick={reset}>
            <RotateCcw aria-hidden="true" />
            Reset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
