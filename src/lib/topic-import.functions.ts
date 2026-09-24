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
Extract ONLY numbered primary headings that begin with the word "Topic" (e.g. "Topic 1 — Energy") and the printed content entries listed directly under each one, in the exact printed order.
For each Topic, include entries after its heading and before the first of: any line beginning "Revision", "Revision Questions for Topic …", the next "Topic" heading, "Practical Skills", "Working Scientifically", or the end of the page.
Never include: revision sections, Working Scientifically, Practical Skills, Answers, Glossary, Index, formula pages, appendices, page numbers, dotted leaders, QR codes/instructions, headers, footers, logos, handwriting, ticks, highlighting, or any heading not starting with "Topic". Do not include a Topic's own title as an item.
Do not invent, merge or silently correct text. Keep the best visible reading. List every title or item whose reading you are unsure of, verbatim, in "uncertain".
Use "—" between the topic number and name. If no valid Topic headings exist, return an empty topics array.`;

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
        .map((t) => ({ title: clean(t.title), items: t.items.map(clean).filter((i) => i && !EXCLUDE.test(i) && !/^topic\b/i.test(i)) }))
        .filter((t) => /^topic\b/i.test(t.title));
      return { ok: true as const, topics, uncertain: result.uncertain.map(clean) };
    } catch (error) {
      const message = error instanceof AiError ? error.message : "We couldn't read that page. Try again.";
      return { ok: false as const, error: message, topics: [], uncertain: [] };
    }
  });
