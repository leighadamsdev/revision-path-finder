import { createFileRoute, redirect } from "@tanstack/react-router";

/** Onboarding was merged into the plan wizard. Old links and bookmarks land there instead. */
export const Route = createFileRoute("/_authenticated/onboarding")({
  beforeLoad: () => {
    throw redirect({ to: "/setup" });
  },
});
