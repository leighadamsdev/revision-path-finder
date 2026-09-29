import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  dataUrl: z.string().startsWith("data:image/").max(15_000_000),
});

type Extracted = {
  topics: { title: string; items: string[] }[];
  uncertain: string[];
};

const INSTRUCTIONS = `You read photographed or scanned textbook/workbook CONTENTS pages. The page may be rotated, skewed, angled, shadowed, a two-page spread, or annotated by hand.
Identify the SECTION TITLES (the main headings, e.g. "Topic 1 — Energy", "Section B: Cell Biology", "Unit 3 Algebra") and use each one as a topic "title". Under each, list the printed content entries (sub-headings/topics) directly beneath it, in the exact printed order, as "items".
For each section, include entries after its heading and before the next section heading or the end of the page. Skip revision-question blocks, Working Scientifically, Practical Skills, Answers, Glossary, Index, formula pages and appendices.
Never include: page numbers, dotted leaders, QR codes/instructions, headers, footers, logos, handwriting, ticks or highlighting. Do not include a section's own title as an item.
Do not invent, merge or silently correct text. Keep the best visible reading. List every title or item whose reading you are unsure of, verbatim, in "uncertain".
Keep any printed section number, using "—" between number and name. If no sections exist, return an empty topics array.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["topics", "uncertain"],
  properties: {
    topics: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "items"],
        properties: { title: { type: "string" }, items: { type: "array", items: { type: "string" } } },
      },
    },
    uncertain: { type: "array", items: { type: "string" } },
  },
};

const EXCLUDE = /^(revision|practical skills|working scientifically|answers|glossary|index|physics formulas|appendix)/i;

function clean(line: string) {
  return line.replace(/\.{2,}.*$/, "").replace(/\s+\d{1,3}\s*$/, "").replace(/\s+/g, " ").trim();
}

export const extractTopics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const { askForJson, AiError } = await import("./ai.server");
    try {
      const result = await askForJson<Extracted>({
        instructions: INSTRUCTIONS,
        schemaName: "contents_topics",
        schema: SCHEMA,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: "Extract the Topics from this contents page as json." },
              { type: "input_image", image_url: data.dataUrl },
            ],
          },
        ],
      });
      const topics = result.topics
        .map((t) => ({ title: clean(t.title), items: t.items.map(clean).filter((i) => i && !EXCLUDE.test(i)) }))
        .filter((t) => t.title && !EXCLUDE.test(t.title));
      return { ok: true as const, topics, uncertain: result.uncertain.map(clean) };
    } catch (error) {
      const message = error instanceof AiError ? error.message : "We couldn't read that page. Try again.";
      return { ok: false as const, error: message, topics: [], uncertain: [] };
    }
  });
