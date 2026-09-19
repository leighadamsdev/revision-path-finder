import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TopicsInput = z.object({
  subject: z.string().min(1),
  examBoard: z.string().min(1),
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
                  `Exam board: ${data.examBoard}`,
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
