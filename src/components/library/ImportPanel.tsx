import { useEffect, useRef, useState } from "react";
import { Camera, ChevronDown, ChevronRight, Crop as CropIcon, RotateCcw, RotateCw, Upload, Undo2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { extractTopics } from "@/lib/topic-import.functions";
import { newKey, saveTopics, type DraftTopic } from "@/lib/library";
import { TopicDraftEditor } from "./TopicDraftEditor";
import { fileToImage, renderPrepared, type Crop } from "./image-prep";

type Stage = "upload" | "prepare" | "review" | "choose";

export function ImportPanel({
  open,
  onOpenChange,
  subjectId,
  subjectName,
  existingCount,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  subjectName: string;
  existingCount: number;
  onSaved: () => void;
}) {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState<Crop | null>(null);
  const [cropping, setCropping] = useState(false);
  const [enhance, setEnhance] = useState(true);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [topics, setTopics] = useState<DraftTopic[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const extract = useServerFn(extractTopics);

  function reset() {
    setStage("upload");
    setFile(null);
    setImg(null);
    setRotation(0);
    setCrop(null);
    setTopics([]);
    setSelected(new Set());
  }

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  useEffect(() => {
    if (img) setPreview(renderPrepared(img, rotation, crop, enhance, 1200));
  }, [img, rotation, crop, enhance]);

  async function takeFile(f: File) {
    const ok = /\.(jpe?g|png|hei[cf]|pdf)$/i.test(f.name) || /image\/|application\/pdf/.test(f.type);
    if (!ok) return void toast.error("Please upload a JPG, PNG, HEIC or PDF.");
    setBusy(true);
    try {
      setImg(await fileToImage(f));
      setFile(f);
      setStage("prepare");
    } catch {
      toast.error("We couldn't open that file. Try a photo or a different PDF.");
    } finally {
      setBusy(false);
    }
  }

  async function runExtract() {
    if (!img) return;
    setBusy(true);
    const result = await extract({ data: { dataUrl: renderPrepared(img, rotation, crop, enhance) } }).catch(() => null);
    setBusy(false);
    if (!result || !result.ok) return void toast.error(result?.error ?? "We couldn't read that page. Try again.");
    if (!result.topics.length) {
      toast.error("No section titles or topics were found. Try straightening or cropping the photo, or add Topics manually.");
      return;
    }
    const unsure = new Set(result.uncertain.map((u) => u.toLowerCase()));
    setTopics((prev) => [
      ...prev,
      ...result.topics.map((t) => ({
        key: newKey(),
        title: t.title,
        items: t.items.map((title) => ({ key: newKey(), title, uncertain: unsure.has(title.toLowerCase()) })),
      })),
    ]);
    setStage("review");
  }

  async function addSelected() {
    const chosen = topics.filter((t) => selected.has(t.key) && t.title.trim());
    if (!chosen.length) return;
    setBusy(true);
    try {
      let path: string | null = null;
      const { data: auth } = await supabase.auth.getUser();
      if (file && auth.user) {
        path = `${auth.user.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
        const { error } = await supabase.storage.from("topic-sources").upload(path, file);
        if (error) path = null;
      }
      const isPdf = file?.type === "application/pdf" || file?.name.toLowerCase().endsWith(".pdf");
      await saveTopics(subjectId, chosen, { type: isPdf ? "pdf" : "image", path }, existingCount);
      toast.success(`${chosen.length} Topic${chosen.length === 1 ? "" : "s"} added to ${subjectName}.`);
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Couldn't save those Topics — try again.");
    } finally {
      setBusy(false);
    }
  }

  const count = selected.size;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Import Topics — {subjectName}</SheetTitle>
        </SheetHeader>

        {stage === "upload" ? (
          <div className="mt-5 space-y-3">
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) void takeFile(f);
              }}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-[16px] border-2 border-dashed p-8 text-center ${dragOver ? "border-primary bg-accent" : "border-border"}`}
            >
              <Upload className="size-6 text-muted-foreground" />
              <span className="text-sm font-extrabold">{busy ? "Opening…" : topics.length ? `Upload another page (${topics.length} Topics so far)` : "Upload contents page"}</span>
              <span className="text-[12px] font-medium text-muted-foreground">Drag and drop, or tap to choose. JPG, PNG, HEIC or PDF.</span>
              <input type="file" accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void takeFile(f); e.target.value = ""; }} />
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full py-3 text-sm font-extrabold ring-1 ring-border sm:hidden">
              <Camera className="size-4" /> Take photo
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void takeFile(f); e.target.value = ""; }} />
            </label>
            <p className="text-[12px] font-medium text-muted-foreground">
              Try a screenshot or photo of your revision guide&apos;s contents page, or a topic list from school. Section titles become Topics, with the content listed under them. Got more than one page? Add them one after another. Nothing is saved until you choose which Topics to add.
            </p>
          </div>
        ) : null}

        {stage === "prepare" && img ? (
          <div className="mt-5 space-y-3">
            <CropBox src={preview} active={cropping} onCrop={(c) => { setCrop(c); setCropping(false); }} />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => { setCrop(null); setRotation((r) => r - 90); }}><RotateCcw /> Rotate Left</Button>
              <Button variant="outline" size="sm" onClick={() => { setCrop(null); setRotation((r) => r + 90); }}><RotateCw /> Rotate Right</Button>
              <Button variant={cropping ? "default" : "outline"} size="sm" onClick={() => { setCrop(null); setCropping((v) => !v); }}><CropIcon /> {cropping ? "Drag over the page" : "Crop"}</Button>
              <Button variant="outline" size="sm" onClick={() => { setRotation(0); setCrop(null); setCropping(false); }}><Undo2 /> Reset</Button>
              <label className="flex items-center gap-1.5 text-[12px] font-bold">
                <input type="checkbox" checked={enhance} onChange={(e) => setEnhance(e.target.checked)} /> Improve contrast
              </label>
            </div>
            <p className="text-[12px] font-medium text-muted-foreground">Turn the page so the text reads upright, and crop away any background.</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={() => void runExtract()} disabled={busy}>{busy ? "Reading your page…" : "Extract Topics"}</Button>
            </div>
          </div>
        ) : null}

        {stage === "review" ? (
          <div className="mt-5 space-y-4">
            <p className="text-[13px] font-medium text-muted-foreground">
              Check the wording. Highlighted items were hard to read — please correct them. Drag to reorder, or move items between Topics.
            </p>
            <TopicDraftEditor topics={topics} onChange={setTopics} />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setStage("prepare")}>Back to image</Button>
              <Button variant="outline" onClick={() => { setImg(null); setRotation(0); setCrop(null); setStage("upload"); }}><Upload /> Add another page</Button>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={() => setStage("choose")} disabled={!topics.length}>Continue</Button>
            </div>
          </div>
        ) : null}

        {stage === "choose" ? (
          <div className="mt-5 space-y-3">
            <div>
              <p className="text-lg font-extrabold tracking-tight">Choose Topics to Add</p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                Select the Topics you want to add to this Subject. You can return to the previous step if you need to edit them.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelected(new Set(topics.map((t) => t.key)))}>Select all</Button>
              <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>Clear all</Button>
              <span className="ml-auto text-[12px] font-bold text-muted-foreground">{count} of {topics.length} Topics selected</span>
            </div>
            {topics.map((t) => {
              const on = selected.has(t.key);
              const isOpen = expanded.has(t.key);
              return (
                <div key={t.key} className={`rounded-[14px] p-3 ring-1 ${on ? "bg-accent ring-primary" : "bg-background ring-border"}`}>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={on} aria-label={`Select ${t.title}`} onChange={() => setSelected((s) => { const n = new Set(s); if (n.has(t.key)) n.delete(t.key); else n.add(t.key); return n; })} />
                    <span className="text-sm font-extrabold">{t.title || "Untitled Topic"}</span>
                    <span className="ml-auto text-[12px] font-bold text-muted-foreground">{t.items.length} items</span>
                    <button aria-label={isOpen ? "Collapse" : "Expand"} onClick={() => setExpanded((s) => { const n = new Set(s); if (n.has(t.key)) n.delete(t.key); else n.add(t.key); return n; })}>
                      {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </button>
                    <button className="text-[12px] font-bold underline" onClick={() => setStage("review")}>Edit</button>
                  </div>
                  {isOpen ? (
                    <ul className="mt-2 list-disc pl-10 text-[13px] font-medium text-muted-foreground">
                      {t.items.map((i) => <li key={i.key}>{i.title}</li>)}
                    </ul>
                  ) : null}
                </div>
              );
            })}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" onClick={() => setStage("review")}>Back to review</Button>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={() => void addSelected()} disabled={count === 0 || busy}>
                {busy ? "Saving…" : `Add ${count} Selected Topic${count === 1 ? "" : "s"}`}
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function CropBox({ src, active, onCrop }: { src: string; active: boolean; onCrop: (c: Crop) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [box, setBox] = useState<Crop | null>(null);
  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) };
  };
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-[12px] ring-1 ring-border ${active ? "cursor-crosshair touch-none" : ""}`}
      onPointerDown={(e) => { if (!active) return; const p = pos(e); setStart(p); setBox({ x: p.x, y: p.y, w: 0, h: 0 }); }}
      onPointerMove={(e) => { if (!active || !start) return; const p = pos(e); setBox({ x: Math.min(p.x, start.x), y: Math.min(p.y, start.y), w: Math.abs(p.x - start.x), h: Math.abs(p.y - start.y) }); }}
      onPointerUp={() => { if (active && box && box.w > 0.05 && box.h > 0.05) onCrop(box); setStart(null); setBox(null); }}
    >
      {src ? <img src={src} alt="Your contents page, ready to read" className="block w-full select-none" draggable={false} /> : null}
      {box ? <div className="absolute border-2 border-primary bg-primary/10" style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%` }} /> : null}
    </div>
  );
}
