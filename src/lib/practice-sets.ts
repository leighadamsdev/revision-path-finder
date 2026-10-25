import { supabase } from "@/integrations/supabase/client";
import type { PracticeSettings } from "@/lib/practice-prompt";

export type PracticeSet = {
  id: string;
  name: string;
  settings: PracticeSettings;
  created_at: string;
};

// practice_sets is newer than the generated database types, so it's queried untyped here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const table = () => (supabase as any).from("practice_sets");

export async function fetchPracticeSets(): Promise<PracticeSet[]> {
  const { data, error } = await table()
    .select("id, name, settings, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PracticeSet[];
}

export async function savePracticeSet(name: string, settings: PracticeSettings) {
  const { error } = await table().insert({
    name: name.trim() || settings.subject || "Practice set",
    settings,
  });
  if (error) throw error;
}

export async function deletePracticeSet(id: string) {
  const { error } = await table().delete().eq("id", id);
  if (error) throw error;
}
