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

const ExamDatesInput = z.object({
  subjects: z.array(z.string()).max(40).default([]),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  dataUrl: z.string().min(16),
});

/** Reads exam dates out of a school exam timetable (PDF, photo or scan). */
export const extractExamDates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ExamDatesInput.parse(input))
  .handler(async ({ data }) => {
    const { askForJson, AiError } = await import("@/lib/ai.server");
    const isPdf = data.mimeType === "application/pdf";
    try {
      const result = await askForJson<{
        exams: Array<{ subject: string; date: string; paper: string }>;
      }>({
        instructions:
          "You read UK school GCSE exam timetables, which vary in layout. Extract every exam sitting with its subject and calendar date. Return each date strictly as yyyy-MM-dd. If the year is not printed, infer it from the exam season (summer GCSE exams run May–June). Use the paper field for the paper name or number when shown, otherwise an empty string. Ignore rooms, times, seat numbers and general instructions. Return an empty list if there are no recognisable exam dates.",
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
                  "Extract every exam sitting from this exam timetable, reading tables and images carefully.",
                  data.subjects.length
                    ? `The student is sitting these subjects — match names to this list wherever you can: ${data.subjects.join("; ")}.`
                    : "",
                ]
                  .filter(Boolean)
                  .join("\n"),
              },
              isPdf
                ? { type: "input_file", filename: data.fileName, file_data: data.dataUrl }
                : { type: "input_image", image_url: data.dataUrl },
            ],
          },
        ],
      });
      const exams = result.exams
        .filter((exam) => /^\d{4}-\d{2}-\d{2}$/.test(exam.date))
        .slice(0, 60);
      return { exams };
    } catch (error) {
      if (error instanceof AiError) throw new Error(error.message);
      throw error;
    }
  });
