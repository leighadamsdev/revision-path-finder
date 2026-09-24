import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PublicHeader } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { LibraryManager, SubjectFields } from "@/components/library/LibraryManager";
import { ImportPanel } from "@/components/library/ImportPanel";
import { useLibrary } from "@/hooks/useLibrary";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { addSubject, deleteSubject, markOnboardingComplete, updateSubject, type LibSubject } from "@/lib/library";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set Up Your Revision Subjects — rev.plan" },
      { name: "description", content: "Add the subjects, Topics and content you are studying to personalise rev.plan." },
      { property: "og:title", content: "Set Up Your Revision Subjects — rev.plan" },
      { property: "og:description", content: "Add your subjects, Topics and content to get started." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OnboardingPage,
});

const STEPS = ["Add subjects", "Add Topics and content", "Review and finish"];
const blank = { name: "", exam_board: "", qualification_level: "" };

function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subjects, refresh } = useLibrary();
  const [step, setStep] = useState(0);
  const [value, setValue] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [importAfterCreate, setImportAfterCreate] = useState<LibSubject | null>(null);
  const [saving, setSaving] = useState(false);

  const withContent = subjects.filter((s) => s.topics.some((t) => t.items.length > 0));
  const totalTopics = subjects.reduce((n, s) => n + s.topics.length, 0);
  const totalItems = subjects.reduce((n, s) => n + s.topics.reduce((m, t) => m + t.items.length, 0), 0);

  async function saveSubject(thenImport = false) {
    if (!value.name.trim()) return void toast.error("Enter the subject name first.");
    try {
      if (editing) await updateSubject(editing, { name: value.name.trim(), exam_board: value.exam_board || null, qualification_level: value.qualification_level || null });
      else {
        const id = await addSubject(value);
        if (thenImport) setImportAfterCreate({ id, name: value.name.trim(), exam_board: null, qualification_level: null, position: 0, topics: [] });
      }
      setValue(blank);
      setEditing(null);
      refresh();
    } catch {
      toast.error("Couldn't save that subject.");
    }
  }

  async function finish() {
    if (!user) return;
    setSaving(true);
    try {
      await markOnboardingComplete(user.id);
      const { data } = await supabase.from("plans").select("id").limit(1);
      void navigate({ to: data && data.length ? "/plan" : "/setup" });
    } catch {
      toast.error("Couldn't finish setup — try again.");
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16 pt-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Set Up Your Revision Subjects</h1>
        <p className="mt-2 text-[14px] font-medium text-muted-foreground">
          Add the subjects, topics and content you are studying. This will personalise your Knowledge Checker and Revision Planner.
        </p>
        <p className="mt-2 text-[13px] font-medium text-muted-foreground">
          Your subjects and topics provide the content for your revision tools. You will continue to choose and manage your revision priorities using the app’s existing priority process.
        </p>

        <div className="mt-5">
          <p className="text-[12px] font-extrabold uppercase tracking-wide text-muted-foreground">
            Step {step + 1} of 3 — {STEPS[step]}
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {STEPS.map((s, i) => <div key={s} className={`h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />)}
          </div>
        </div>

        {step === 0 ? (
          <section className="mt-6 space-y-4">
            <div className="rounded-[16px] bg-card p-4 ring-1 ring-black/5">
              <p className="text-sm font-extrabold">{editing ? "Edit subject" : "Add a subject manually"}</p>
              <div className="mt-3"><SubjectFields value={value} onChange={setValue} /></div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => void saveSubject()}><Plus /> {editing ? "Save changes" : "Add subject"}</Button>
                {editing ? <Button variant="ghost" onClick={() => { setEditing(null); setValue(blank); }}>Cancel</Button> : null}
              </div>
              {!editing ? <p className="mt-2 text-[12px] font-medium text-muted-foreground">Add all your subjects first — you'll add topics in the next step.</p> : null}
            </div>

            {subjects.length ? (
              <div className="rounded-[16px] bg-card p-4 ring-1 ring-black/5">
                <p className="text-sm font-extrabold">My existing subjects</p>
                <ul className="mt-2 divide-y divide-border">
                  {subjects.map((s) => (
                    <li key={s.id} className="flex items-center gap-2 py-2">
                      <span className="flex-1 text-[13px] font-bold">
                        {s.name}
                        <span className="ml-2 font-medium text-muted-foreground">{[s.exam_board, s.qualification_level].filter(Boolean).join(" · ")}</span>
                      </span>
                      <Button size="icon" variant="ghost" aria-label="Edit subject" onClick={() => { setEditing(s.id); setValue({ name: s.name, exam_board: s.exam_board ?? "", qualification_level: s.qualification_level ?? "" }); }}><Pencil /></Button>
                      <Button size="icon" variant="ghost" aria-label="Delete subject" onClick={async () => { await deleteSubject(s.id); refresh(); }}><Trash2 /></Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button disabled={!subjects.length} onClick={() => setStep(1)}>Continue</Button>
            </div>
            {!subjects.length ? <p className="text-right text-[12px] font-medium text-muted-foreground">Add at least one subject to continue.</p> : null}
          </section>
        ) : null}

        {step === 1 ? (
          <section className="mt-6 space-y-4">
            <LibraryManager subjects={subjects} refresh={refresh} />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button disabled={!withContent.length} onClick={() => setStep(2)}>Continue</Button>
            </div>
            <p className="text-right text-[12px] font-medium text-muted-foreground">
              {withContent.length
                ? subjects.length > withContent.length ? "You can skip the rest for now and finish them later in My Topic Library." : ""
                : "Add at least one Topic with a content item to continue."}
            </p>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="mt-6 space-y-4">
            <div className="rounded-[16px] bg-accent p-4 text-[13px] font-bold">
              Your subjects and Topics will now populate your Knowledge Checker and Revision Planner. Your existing priority process will remain unchanged.
            </div>
            <p className="text-[13px] font-medium text-muted-foreground">
              {subjects.length} subjects · {totalTopics} Topics · {totalItems} content items. Tap a subject's arrow to see its Topics.
            </p>
            <LibraryManager subjects={subjects} refresh={refresh} />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={saving || !subjects.length || !totalTopics || !totalItems} onClick={() => void finish()}>
                {saving ? "Saving…" : "Save and Finish Setup"}
              </Button>
            </div>
          </section>
        ) : null}
      </main>

      {importAfterCreate ? (
        <ImportPanel open onOpenChange={(v) => !v && setImportAfterCreate(null)} subjectId={importAfterCreate.id} subjectName={importAfterCreate.name} existingCount={0} onSaved={refresh} />
      ) : null}
    </div>
  );
}
