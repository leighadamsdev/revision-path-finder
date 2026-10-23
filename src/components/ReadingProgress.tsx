import { useEffect, useState } from "react";

/** Reading a page can take up to a minute, so show that it's still working. */
export function ReadingProgress({ what = "page" }: { what?: string }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setSeconds((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const stage =
    seconds < 10
      ? `Reading the text on your ${what}…`
      : seconds < 30
        ? "Working out what's on it…"
        : "Nearly there. Long or busy ones take a little longer…";
  return (
    <div role="status" aria-live="polite" className="rounded-[10px] bg-secondary px-3 py-2.5">
      <p className="text-[13px] font-bold">{stage}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-1000"
          style={{ width: `${Math.min(95, Math.round((seconds / 60) * 100))}%` }}
        />
      </div>
      <p className="mt-1.5 text-[12px] font-medium text-muted-foreground">
        This usually takes up to a minute. Please keep this window open.
      </p>
    </div>
  );
}
