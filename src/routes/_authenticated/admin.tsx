import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useRole";
import { EXAM_BOARDS } from "@/lib/subjects";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Shared content admin — RevisionPath" },
      {
        name: "description",
        content:
          "Maintain the shared RevisionPath content: subjects, topic lists, past paper links and revision sites.",
      },
      { property: "og:title", content: "Shared content admin — RevisionPath" },
      {
        property: "og:description",
        content: "Maintain shared RevisionPath subjects, topics, past papers and revision sites.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

type TabKey = "subjects" | "topics" | "papers" | "sites";

const TABS: { key: TabKey; label: string }[] = [
  { key: "subjects", label: "Subjects" },
  { key: "topics", label: "Topic lists" },
  { key: "papers", label: "Past papers" },
  { key: "sites", label: "Revision sites" },
];

const input =
  "w-full rounded-[10px] bg-background px-3 py-2 text-sm font-medium ring-1 ring-border focus:outline-none focus:ring-ring";
const label = "text-[11px] font-bold uppercase tracking-wide text-muted-foreground";
const pill = "rounded-full px-4 py-2 text-[13px] font-bold";

function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useIsAdmin();
  const [tab, setTab] = useState<TabKey>("subjects");

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/plan", replace: true });
  }, [loading, isAdmin, navigate]);

  if (loading || !isAdmin) {
    return (
      <AppShell>
        <p className="text-sm font-semibold text-muted-foreground">Checking your access…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold tracking-tight">Shared content</h1>
      <p className="mt-1 text-[13px] font-medium text-muted-foreground">
        Everything here is shared by every student. Students can read it; only admins can change it.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`${pill} ${
              tab === t.key
                ? "bg-structure text-structure-foreground"
                : "bg-card text-foreground ring-1 ring-border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "subjects" ? <SubjectsPanel /> : null}
        {tab === "topics" ? <TopicsPanel /> : null}
        {tab === "papers" ? <PapersPanel /> : null}
        {tab === "sites" ? <SitesPanel /> : null}
      </div>
    </AppShell>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[16px] bg-card p-4 ring-1 ring-black/5">{children}</div>;
}

function useSubjectList() {
  return useQuery({
    queryKey: ["admin-subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, exam_board, color_key, is_custom")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

function SubjectsPanel() {
  const qc = useQueryClient();
  const { data: subjects = [], isLoading } = useSubjectList();
  const [name, setName] = useState("");
  const [board, setBoard] = useState<string>(EXAM_BOARDS[0] ?? "AQA");
  const [colorKey, setColorKey] = useState("media");

  async function add() {
    if (!name.trim()) return;
    const { error } = await supabase
      .from("subjects")
      .insert({ name: name.trim(), exam_board: board, color_key: colorKey, is_custom: false });
    if (error) { toast.error(error.message); return; }
    setName("");
    toast.success("Subject added");
    void qc.invalidateQueries({ queryKey: ["admin-subjects"] });
    void qc.invalidateQueries({ queryKey: ["subjects"] });
  }

  async function saveRow(id: string, patch: Record<string, string>) {
    const { error } = await supabase.from("subjects").update(patch as never).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    void qc.invalidateQueries({ queryKey: ["admin-subjects"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Subject removed");
    void qc.invalidateQueries({ queryKey: ["admin-subjects"] });
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-extrabold">Add a subject</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <label className="block sm:col-span-2">
            <span className={label}>Name</span>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block">
            <span className={label}>Exam board</span>
            <select className={input} value={board} onChange={(e) => setBoard(e.target.value)}>
              {EXAM_BOARDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={label}>Colour key</span>
            <input
              className={input}
              value={colorKey}
              onChange={(e) => setColorKey(e.target.value)}
            />
          </label>
        </div>
        <button
          onClick={add}
          className="mt-3 rounded-full bg-primary px-5 py-2.5 text-[13px] font-extrabold text-primary-foreground"
        >
          Add subject
        </button>
      </Card>

      {isLoading ? (
        <p className="text-sm font-semibold text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-2">
          {subjects.map((s) => (
            <EditableRow
              key={s.id}
              fields={[
                { key: "name", label: "Name", value: s.name },
                { key: "exam_board", label: "Exam board", value: s.exam_board },
                { key: "color_key", label: "Colour", value: s.color_key },
              ]}
              onSave={(patch) => saveRow(s.id, patch)}
              onDelete={() => remove(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const { data: subjects = [] } = useSubjectList();
  return (
    <label className="block">
      <span className={label}>Subject</span>
      <select className={input} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose a subject…</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} · {s.exam_board}
          </option>
        ))}
      </select>
    </label>
  );
}

function TopicsPanel() {
  const qc = useQueryClient();
  const [subjectId, setSubjectId] = useState("");
  const [topic, setTopic] = useState("");

  const { data: rows = [] } = useQuery({
    queryKey: ["admin-topic-library", subjectId],
    enabled: Boolean(subjectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topic_library")
        .select("id, position, topic")
        .eq("subject_id", subjectId)
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
  });

  async function add() {
    if (!subjectId || !topic.trim()) return;
    const nextPosition = (rows.at(-1)?.position ?? 0) + 1;
    const { error } = await supabase
      .from("topic_library")
      .insert({ subject_id: subjectId, topic: topic.trim(), position: nextPosition });
    if (error) { toast.error(error.message); return; }
    setTopic("");
    void qc.invalidateQueries({ queryKey: ["admin-topic-library", subjectId] });
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-extrabold">Topic list per subject</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <SubjectPicker value={subjectId} onChange={setSubjectId} />
          <label className="block">
            <span className={label}>New topic</span>
            <input className={input} value={topic} onChange={(e) => setTopic(e.target.value)} />
          </label>
        </div>
        <button
          onClick={add}
          disabled={!subjectId}
          className="mt-3 rounded-full bg-primary px-5 py-2.5 text-[13px] font-extrabold text-primary-foreground disabled:opacity-60"
        >
          Add topic
        </button>
      </Card>

      {subjectId ? (
        <div className="space-y-2">
          {rows.map((row) => (
            <EditableRow
              key={row.id}
              fields={[
                { key: "position", label: "Order", value: String(row.position) },
                { key: "topic", label: "Topic", value: row.topic },
              ]}
              onSave={async (patch) => {
                const { error } = await supabase
                  .from("topic_library")
                  .update({ topic: patch["topic"], position: Number(patch["position"]) })
                  .eq("id", row.id);
                if (error) { toast.error(error.message); return; }
                toast.success("Saved");
                void qc.invalidateQueries({ queryKey: ["admin-topic-library", subjectId] });
              }}
              onDelete={async () => {
                const { error } = await supabase.from("topic_library").delete().eq("id", row.id);
                if (error) { toast.error(error.message); return; }
                void qc.invalidateQueries({ queryKey: ["admin-topic-library", subjectId] });
              }}
            />
          ))}
          {rows.length === 0 ? (
            <p className="text-sm font-semibold text-muted-foreground">
              No topics stored for this subject yet.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function PapersPanel() {
  const qc = useQueryClient();
  const [subjectId, setSubjectId] = useState("");
  const [form, setForm] = useState({
    spec_code: "",
    official_portal_url: "",
    free_resource_url: "",
    free_resource_name: "",
  });

  const { data: rows = [] } = useQuery({
    queryKey: ["admin-past-papers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("past_papers")
        .select(
          "id, spec_code, official_portal_url, free_resource_url, free_resource_name, subjects(name, exam_board)",
        )
        .order("spec_code");
      if (error) throw error;
      return (data ?? []) as unknown as {
        id: string;
        spec_code: string;
        official_portal_url: string;
        free_resource_url: string;
        free_resource_name: string;
        subjects: { name: string; exam_board: string } | null;
      }[];
    },
  });

  async function add() {
    if (!subjectId) return;
    const { error } = await supabase.from("past_papers").insert({ subject_id: subjectId, ...form });
    if (error) { toast.error(error.message); return; }
    setForm({
      spec_code: "",
      official_portal_url: "",
      free_resource_url: "",
      free_resource_name: "",
    });
    toast.success("Past paper row added");
    void qc.invalidateQueries({ queryKey: ["admin-past-papers"] });
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-extrabold">Add a past paper row</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <SubjectPicker value={subjectId} onChange={setSubjectId} />
          {(
            [
              ["spec_code", "Spec code"],
              ["official_portal_url", "Official portal link"],
              ["free_resource_name", "Free question bank name"],
              ["free_resource_url", "Free question bank link"],
            ] as const
          ).map(([key, text]) => (
            <label key={key} className="block">
              <span className={label}>{text}</span>
              <input
                className={input}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
        </div>
        <button
          onClick={add}
          disabled={!subjectId}
          className="mt-3 rounded-full bg-primary px-5 py-2.5 text-[13px] font-extrabold text-primary-foreground disabled:opacity-60"
        >
          Add row
        </button>
      </Card>

      <div className="space-y-2">
        {rows.map((row) => (
          <EditableRow
            key={row.id}
            heading={
              row.subjects ? `${row.subjects.name} · ${row.subjects.exam_board}` : "Unlinked subject"
            }
            fields={[
              { key: "spec_code", label: "Spec code", value: row.spec_code },
              { key: "official_portal_url", label: "Official link", value: row.official_portal_url },
              {
                key: "free_resource_name",
                label: "Question bank",
                value: row.free_resource_name,
              },
              { key: "free_resource_url", label: "Bank link", value: row.free_resource_url },
            ]}
            onSave={async (patch) => {
              const { error } = await supabase.from("past_papers").update(patch as never).eq("id", row.id);
              if (error) { toast.error(error.message); return; }
              toast.success("Saved");
              void qc.invalidateQueries({ queryKey: ["admin-past-papers"] });
            }}
            onDelete={async () => {
              const { error } = await supabase.from("past_papers").delete().eq("id", row.id);
              if (error) { toast.error(error.message); return; }
              void qc.invalidateQueries({ queryKey: ["admin-past-papers"] });
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SitesPanel() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    subject_name: "",
    site_name: "",
    site_url: "",
    description: "",
  });

  const { data: rows = [] } = useQuery({
    queryKey: ["admin-revision-sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revision_sites")
        .select("id, subject_name, site_name, site_url, description")
        .order("site_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  async function add() {
    if (!form.site_name.trim() || !form.site_url.trim()) return;
    const { error } = await supabase.from("revision_sites").insert({
      subject_name: form.subject_name.trim() || null,
      site_name: form.site_name.trim(),
      site_url: form.site_url.trim(),
      description: form.description.trim(),
    });
    if (error) { toast.error(error.message); return; }
    setForm({ subject_name: "", site_name: "", site_url: "", description: "" });
    toast.success("Site added");
    void qc.invalidateQueries({ queryKey: ["admin-revision-sites"] });
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-extrabold">Add a revision site</p>
        <p className="mt-1 text-[12px] font-medium text-muted-foreground">
          Leave the subject blank to show it in the universal section.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["subject_name", "Subject (optional)"],
              ["site_name", "Site name"],
              ["site_url", "Link"],
              ["description", "One-line note"],
            ] as const
          ).map(([key, text]) => (
            <label key={key} className="block">
              <span className={label}>{text}</span>
              <input
                className={input}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
        </div>
        <button
          onClick={add}
          className="mt-3 rounded-full bg-primary px-5 py-2.5 text-[13px] font-extrabold text-primary-foreground"
        >
          Add site
        </button>
      </Card>

      <div className="space-y-2">
        {rows.map((row) => (
          <EditableRow
            key={row.id}
            fields={[
              { key: "subject_name", label: "Subject", value: row.subject_name ?? "" },
              { key: "site_name", label: "Site", value: row.site_name },
              { key: "site_url", label: "Link", value: row.site_url },
              { key: "description", label: "Note", value: row.description },
            ]}
            onSave={async (patch) => {
              const { error } = await supabase
                .from("revision_sites")
                .update({ ...patch, subject_name: patch["subject_name"] || null } as never)
                .eq("id", row.id);
              if (error) { toast.error(error.message); return; }
              toast.success("Saved");
              void qc.invalidateQueries({ queryKey: ["admin-revision-sites"] });
            }}
            onDelete={async () => {
              const { error } = await supabase.from("revision_sites").delete().eq("id", row.id);
              if (error) { toast.error(error.message); return; }
              void qc.invalidateQueries({ queryKey: ["admin-revision-sites"] });
            }}
          />
        ))}
      </div>
    </div>
  );
}

function EditableRow({
  heading,
  fields,
  onSave,
  onDelete,
}: {
  heading?: string;
  fields: { key: string; label: string; value: string }[];
  onSave: (patch: Record<string, string>) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}) {
  const [draft, setDraft] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, f.value])),
  );
  const [busy, setBusy] = useState(false);
  const dirty = fields.some((f) => draft[f.key] !== f.value);

  return (
    <div className="rounded-[14px] bg-card p-3 ring-1 ring-black/5">
      {heading ? (
        <p className="mb-2 text-[12px] font-extrabold text-muted-foreground">{heading}</p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className={label}>{f.label}</span>
            <input
              className={input}
              value={draft[f.key] ?? ""}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          disabled={!dirty || busy}
          onClick={async () => {
            setBusy(true);
            await onSave(draft);
            setBusy(false);
          }}
          className="rounded-full bg-structure px-4 py-2 text-[12px] font-extrabold text-structure-foreground disabled:opacity-40"
        >
          Save
        </button>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onDelete();
            setBusy(false);
          }}
          className="rounded-full px-3 py-2 text-[12px] font-bold text-muted-foreground"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
