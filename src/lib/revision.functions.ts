import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TopicsInput = z.object({
  subject: z.string().min(1),
  count: z.number().int().min(1).max(120),
  weakTopics: z.array(z.string()).max(40).default([]),
  avoidTopics: z.array(z.string()).max(200).default([]),
});

export const generateTopics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TopicsInput.parse(input))
  .handler(async ({ data }) => {
    const { askForJson, AiError } = await import("@/lib/ai.server");
    try {
      const result = await askForJson<{ topics: string[] }>({
        instructions:
          "You plan GCSE revision for UK students. Produce a spread-out sequence of specific, exam-spec-accurate revision topics. Cover breadth of the specification before the exam, never repeat a topic unless asked to revisit it, and keep each topic short (max 10 words) and concrete.",
        schemaName: "revision_topics",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["topics"],
          properties: {
            topics: { type: "array", items: { type: "string" } },
          },
        },
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: [
                  `Subject: ${data.subject}`,
                  `Produce exactly ${data.count} topics, in the order they should be studied.`,
                  data.weakTopics.length
                    ? `The student rated these topics low in confidence — weave each of them back in during the later half of the sequence: ${data.weakTopics.join("; ")}.`
                    : "",
                  data.avoidTopics.length
                    ? `Already covered elsewhere in this plan, do not repeat: ${data.avoidTopics.slice(0, 80).join("; ")}.`
                    : "",
                ]
                  .filter(Boolean)
                  .join("\n"),
              },
            ],
          },
        ],
      });
      return { topics: result.topics.slice(0, data.count) };
    } catch (error) {
      if (error instanceof AiError) throw new Error(error.message);
      throw error;
    }
  });

const BookletInput = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  dataUrl: z.string().min(16),
});

export const parseOptionsBooklet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => BookletInput.parse(input))
  .handler(async ({ data }) => {
    const { askForJson, AiError } = await import("@/lib/ai.server");
    const isPdf = data.mimeType === "application/pdf";
    try {
      const result = await askForJson<{
        detected: Array<{ subject: string; exam_board: string }>;
      }>({
        instructions:
          "You read UK school GCSE options booklets, which vary wildly in layout. Extract every GCSE subject offered along with its awarding body (exam board) where stated. Normalise board names to exactly one of: AQA, Edexcel, OCR, WJEC Eduqas. If a subject's board is not stated, use an empty string for exam_board. Ignore key-stage-3 content, staff names and general school information. Return an empty list if the document contains no recognisable subject information.",
        schemaName: "detected_subjects",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["detected"],
          properties: {
            detected: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["subject", "exam_board"],
                properties: {
                  subject: { type: "string" },
                  exam_board: { type: "string" },
                },
              },
            },
          },
        },
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Extract the GCSE subjects and their exam boards from this options booklet. Read any text in the image or document carefully, including tables.",
              },
              isPdf
                ? { type: "input_file", filename: data.fileName, file_data: data.dataUrl }
                : { type: "input_image", image_url: data.dataUrl },
            ],
          },
        ],
      });
      return { detected: result.detected.slice(0, 40) };
    } catch (error) {
      if (error instanceof AiError) throw new Error(error.message);
      throw error;
    }
  });

const TopicDocInput = z.object({
  subject: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  dataUrl: z.string().min(16),
});

/** Reads a student's own document (spec, checklist, scheme of work) into a topic list. */
export const extractTopicsFromDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TopicDocInput.parse(input))
  .handler(async ({ data }) => {
    const { askForJson, AiError } = await import("@/lib/ai.server");
    const isPdf = data.mimeType === "application/pdf";
    try {
      const result = await askForJson<{ topics: string[] }>({
        instructions:
          "You read UK GCSE revision documents — specifications, topic checklists, schemes of work, class handouts. Identify each section title (e.g. 'Energy', 'Paper 1: Algebra') and extract every revision topic listed under it, in printed order. Write each item as 'Section title: topic' (topic max 10 words); if the page has no section titles, just give the topic. Keep them specific enough to revise from. Ignore page furniture, staff names, dates and assessment admin. Return an empty list if there are no recognisable topics.",
        schemaName: "document_topics",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["topics"],
          properties: { topics: { type: "array", items: { type: "string" } } },
        },
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Subject: ${data.subject}. Extract the revision topics from this document, reading any text in tables or images carefully.`,
              },
              isPdf
                ? { type: "input_file", filename: data.fileName, file_data: data.dataUrl }
                : { type: "input_image", image_url: data.dataUrl },
            ],
          },
        ],
      });
      return { topics: result.topics.slice(0, 200) };
    } catch (error) {
      if (error instanceof AiError) throw new Error(error.message);
      throw error;
    }
  });

const ExamDatesInput = z
  .object({
    subjects: z.array(z.string()).max(40).default([]),
    /** "final" for the summer exam timetable, "mock" for a school's mock timetable. */
    kind: z.enum(["final", "mock"]).default("final"),
    /** Today's date (yyyy-MM-dd), so mock dates without a year land in the right school year. */
    today: z.string().optional(),
    fileName: z.string().min(1).optional(),
    mimeType: z.string().min(1).optional(),
    dataUrl: z.string().min(16).optional(),
    /** Text from a pasted list, CSV, Word or Excel file (read in the browser). */
    text: z.string().min(1).max(120_000).optional(),
    /** A web page or PDF link from the school's website. */
    url: z.string().url().max(2000).optional(),
  })
  .refine((d) => Boolean(d.dataUrl || d.text || d.url), {
    message: "Add a file, a link or some text.",
  });

/** Refuses links to this machine or private networks. */
function isPublicUrl(raw: string) {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const h = u.hostname.toLowerCase();
    if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || !h.includes("."))
      return false;
    if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(h)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
    if (h.startsWith("[")) return false;
    return true;
  } catch {
    return false;
  }
}

/** Fetches a school web page (as readable text) or a linked PDF (as a file). */
async function readLink(
  url: string,
): Promise<{ kind: "text"; text: string } | { kind: "pdf"; fileName: string; dataUrl: string }> {
  if (!isPublicUrl(url)) throw new Error("That link can't be opened. Use a public web address.");
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "RevPlan exam date reader",
      Accept: "text/html,application/pdf;q=0.9,*/*;q=0.5",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok)
    throw new Error(
      `That page couldn't be opened (error ${res.status}). Check the link, or download the timetable and upload it instead.`,
    );
  const type = res.headers.get("content-type") ?? "";
  const buf = await res.arrayBuffer();
  if (buf.byteLength > 15_000_000)
    throw new Error("That file is too large to read. Try a smaller file.");
  if (type.includes("pdf") || url.toLowerCase().endsWith(".pdf")) {
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i += 0x8000)
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return {
      kind: "pdf",
      fileName: url.split("/").pop() || "timetable.pdf",
      dataUrl: `data:application/pdf;base64,${btoa(binary)}`,
    };
  }
  const html = new TextDecoder().decode(buf);
  const text = html
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(br|\/p|\/div|\/li|\/tr|\/h\d)[^>]*>/gi, "\n")
    .replace(/<\/t[dh]>/gi, " | ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim()
    .slice(0, 100_000);
  if (text.length < 20)
    throw new Error(
      "That page didn't have any readable text. If the timetable is a picture, take a screenshot and upload it.",
    );
  return { kind: "text", text };
}

/** Reads exam dates out of an exam timetable: a PDF, photo, scan, web page or pasted/downloaded list. */
export const extractExamDates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ExamDatesInput.parse(input))
  .handler(async ({ data }) => {
    const { askForJson, AiError } = await import("@/lib/ai.server");
    let fileName = data.fileName ?? "timetable";
    let mimeType = data.mimeType ?? "application/pdf";
    let dataUrl = data.dataUrl;
    let text = data.text;
    if (data.url) {
      const page = await readLink(data.url);
      if (page.kind === "pdf") {
        fileName = page.fileName;
        mimeType = "application/pdf";
        dataUrl = page.dataUrl;
      } else text = page.text;
    }
    const mock = data.kind === "mock";
    const instructions = mock
      ? `You read UK school mock (practice) exam timetables for GCSE students, which vary a lot in layout: web pages, printed sheets, spreadsheets and lists. Extract every mock exam sitting with its subject and calendar date. Return each date strictly as yyyy-MM-dd. Mocks usually run between November and March. If the year is not shown, use the current school year (September to July) based on today's date, ${data.today ?? "unknown"}. Use the paper field for the paper name or number when shown, otherwise an empty string. Ignore rooms, times, seat numbers, other year groups' exams if clearly marked, and general instructions. Return an empty list if there are no recognisable exam dates.`
      : "You read UK school GCSE exam timetables, which vary in layout. Extract every exam sitting with its subject and calendar date. Return each date strictly as yyyy-MM-dd. If the year is not printed, infer it from the exam season (summer GCSE exams run May–June). Use the paper field for the paper name or number when shown, otherwise an empty string. Ignore rooms, times, seat numbers and general instructions. Return an empty list if there are no recognisable exam dates.";
    const isPdf = mimeType === "application/pdf";
    const source: Array<
      | { type: "input_text"; text: string }
      | { type: "input_image"; image_url: string }
      | { type: "input_file"; filename: string; file_data: string }
    > = [];
    if (text) source.push({ type: "input_text", text: `Timetable:\n${text}` });
    if (dataUrl) {
      source.push(
        isPdf
          ? { type: "input_file", filename: fileName, file_data: dataUrl }
          : { type: "input_image", image_url: dataUrl },
      );
    }
    try {
      const result = await askForJson<{
        exams: Array<{ subject: string; date: string; paper: string }>;
      }>({
        instructions,
        schemaName: "exam_dates",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["exams"],
          properties: {
            exams: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["subject", "date", "paper"],
                properties: {
                  subject: { type: "string" },
                  date: { type: "string" },
                  paper: { type: "string" },
                },
              },
            },
          },
        },
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: [
                  `Extract every ${mock ? "mock exam" : "exam"} sitting from this timetable, reading tables and images carefully.`,
                  data.subjects.length
                    ? `The student is sitting these subjects — match names to this list wherever you can: ${data.subjects.join("; ")}.`
                    : "",
                ]
                  .filter(Boolean)
                  .join("\n"),
              },
              ...source,
            ],
          },
        ],
      });
      const exams = result.exams
        .filter((exam) => /^\d{4}-\d{2}-\d{2}$/.test(exam.date))
        .slice(0, 80);
      return { exams };
    } catch (error) {
      if (error instanceof AiError) throw new Error(error.message);
      throw error;
    }
  });
