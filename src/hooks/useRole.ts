import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

/** True when the signed-in user has an admin role row. */
export function useIsAdmin() {
  const query = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) return false;
      return Boolean(data);
    },
    staleTime: 5 * 60 * 1000,
  });

  return { isAdmin: query.data === true, loading: query.isLoading };
}
