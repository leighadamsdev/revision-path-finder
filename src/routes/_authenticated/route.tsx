import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      if (location.pathname === "/exams") {
        throw redirect({ to: "/auth", search: { returnTo: location.href, context: "exams" } });
      }
      throw redirect({ to: "/auth", search: { returnTo: location.href } });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
