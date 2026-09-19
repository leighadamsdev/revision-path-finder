import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data: current }) => {
      setSession(current.session);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading } as {
    session: Session | null;
    user: User | null;
    loading: boolean;
  };
}

/** Makes sure the signed-in user has a profile row (plans reference it). */
export async function ensureProfile(user: User) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name:
        (user.user_metadata?.["full_name"] as string | undefined) ??
        user.email?.split("@")[0] ??
        null,
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}
