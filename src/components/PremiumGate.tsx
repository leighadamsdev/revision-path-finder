import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Check, Lock } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { PREMIUM_FEATURES, PREMIUM_PRICES, usePremium } from "@/hooks/usePremium";

/** Small "Premium" tag for menus and buttons. */
export function PremiumTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-primary ${className}`}
    >
      Premium
    </span>
  );
}

/** The upgrade message shown in place of a Premium feature. */
export function UpgradeCard({ feature }: { feature: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-[16px] bg-structure p-6 text-structure-foreground shadow-lg sm:p-8">
      <span className="inline-flex size-11 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
        <Lock className="size-5" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{feature} is part of Premium</h1>
      <p className="mt-2 text-[15px] font-medium leading-relaxed opacity-90">
        Your subjects, topics and red, amber and green ratings are free. Upgrade to turn them into a
        plan and keep testing yourself as you revise.
      </p>
      <ul className="mt-4 space-y-2">
        {PREMIUM_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[14px] font-medium">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={3} aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        to="/upgrade"
        className="mt-6 inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground"
      >
        Upgrade from {PREMIUM_PRICES.month} a month
      </Link>
      <p className="mt-3 text-[12px] font-medium opacity-75">
        Or {PREMIUM_PRICES.year} a year. Cancel any time.
      </p>
    </div>
  );
}

/** Shows its children to Premium students, and an upgrade message to everyone else. */
export function PremiumGate({ feature, children }: { feature: string; children: ReactNode }) {
  const { isPremium, loading } = usePremium();
  if (loading) return <Skeleton className="mx-auto h-64 w-full max-w-xl" />;
  if (!isPremium) return <UpgradeCard feature={feature} />;
  return <>{children}</>;
}
