import type { ReactNode } from "react";

import { AppShell } from "@/components/AppShell";
import { UpgradeCard } from "@/components/PremiumGate";
import { Skeleton } from "@/components/ui/skeleton";
import { usePremium } from "@/hooks/usePremium";

/**
 * Wraps a whole Premium page. Premium students get the page as normal (it renders its own
 * AppShell); everyone else gets the app frame with an upgrade message instead.
 */
export function PremiumPage({ feature, children }: { feature: string; children: ReactNode }) {
  const { isPremium, loading } = usePremium();
  if (isPremium) return <>{children}</>;
  return (
    <AppShell>
      {loading ? <Skeleton className="mx-auto h-64 w-full max-w-xl" /> : <UpgradeCard feature={feature} />}
    </AppShell>
  );
}
