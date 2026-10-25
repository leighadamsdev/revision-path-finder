import { questionTypesFor, type Choice } from "@/lib/tutor-prompt";

/**
 * Practice exam questions: builds a prompt that turns ChatGPT, Claude, Gemini or Copilot into a
 * GCSE examiner who writes original exam-style questions on the student's topics and holds the
 * mark scheme back until they've answered.
 */

export type PracticeTopic = { text: string; rating: number | null };

export type PracticeSettings = {
  subject: string;
  board: string;
  tier: string;
  topics: PracticeTopic[];
  questionTypes: string[];
  count: string;
  level: string;
  format: string;
  timed: boolean;
  extra: string;
};

export const QUESTION_COUNTS = ["5", "10", "15", "20"] as const;

export const LEVELS: Choice[] = [
  {
    value: "mixed",
    label: "Mixed, like a real paper",
    prompt: "Mix easier and harder questions, getting harder through the set, like a real paper.",
  },
  {
    value: "secure",
    label: "Grades 4–5",
    prompt: "Pitch the questions at grades 4–5: secure the basics before anything harder.",
  },
  {
    value: "strong",
    label: "Grades 6–7",
    prompt:
      "Pitch the questions at grades 6–7: confident application and some multi-step questions.",
  },
  {
    value: "top",
    label: "Grades 8–9",
    prompt:
      "Pitch the questions at grades 8–9: the hardest questions the exam asks, needing deep understanding.",
  },
];

export const FORMATS: Choice[] = [
  {
    value: "interactive",
    label: "One at a time, marked as I go",
    prompt:
      "The AI asks one question, you answer, it marks you and shows the mark scheme, then the next.",
  },
  {
    value: "paper",
    label: "A printable paper",
    prompt:
      "A full paper to print or download, with the mark scheme on a separate page at the end.",
  },
];

export const DEFAULT_PRACTICE: Omit<
  PracticeSettings,
  "subject" | "board" | "tier" | "topics" | "questionTypes"
> = {
  count: "10",
  level: "mixed",
  format: "interactive",
  timed: true,
  extra: "",
};

function ratingNote(rating: number | null) {
  if (rating == null) return "";
  return rating <= 2
    ? " (red: I find this hard)"
    : rating <= 4
      ? " (amber: I know some of this)"
      : " (green: I know this well)";
}

const pick = (list: Choice[], value: string) => list.find((c) => c.value === value);

/** Turns the form into the prompt, in plain British English. */
export function buildPracticePrompt(f: PracticeSettings): string {
  const subject = f.subject || "my GCSE subject";
  const board = f.board && f.board !== "Other" ? f.board : "";
  const tier = f.tier && f.tier !== "Not tiered" ? f.tier : "";
  const spec = [board, `GCSE ${subject}`].filter(Boolean).join(" ");
  const lines: string[] = [];

  lines.push(
    `You are an experienced ${spec} examiner. Write original practice exam questions for me in the style, wording and mark allocation of real ${spec}${tier ? ` ${tier} tier` : ""} papers. Don't copy questions from real past papers.`,
  );
  lines.push("");

  lines.push("## About me");
  lines.push(
    `- I'm a student in England taking ${spec}${tier ? `, ${tier} tier` : ""}${board ? "" : " (I'm not sure of my exam board, so use typical GCSE question styles)"}.`,
  );
  lines.push("");

  lines.push("## Topics to test");
  if (f.topics.length) {
    const ordered = [...f.topics].sort((a, b) => (a.rating ?? 6) - (b.rating ?? 6));
    for (const t of ordered) lines.push(`- ${t.text}${ratingNote(t.rating)}`);
    if (f.topics.some((t) => t.rating != null)) {
      lines.push(
        "Give me more questions on my red topics, fewer on amber, and only a quick check on green ones.",
      );
    }
  } else {
    lines.push(`- Any topics from the ${spec} specification. Cover a good spread.`);
  }
  lines.push("");

  const types = questionTypesFor(f.subject)
    .filter((c) => f.questionTypes.includes(c.value))
    .map((c) => c.prompt);
  const level = pick(LEVELS, f.level);
  lines.push("## The questions");
  lines.push(`- Write ${f.count} questions.`);
  if (types.length) lines.push(`- Use these kinds of questions: ${types.join("; ")}.`);
  if (level) lines.push(`- ${level.prompt}`);
  lines.push(
    "- Show the marks for every question in square brackets, for example [3 marks], and use the command words the real exam uses (such as state, describe, explain, calculate, compare, evaluate).",
  );
  lines.push(
    "- If a question needs a source, extract, diagram or data, write it out in full. Describe any diagram clearly in words.",
  );
  lines.push("");

  if (f.format === "paper") {
    lines.push("## How to lay it out");
    lines.push(
      `1. First write the question paper: a title, the total marks${f.timed ? ", the time allowed (about one minute per mark)" : ""} and the numbered questions with their marks. Don't include any answers, hints or marking points in this part.`,
    );
    lines.push(
      '2. Then write a line saying "MARK SCHEME (print separately)". Below it, give the full mark scheme: for each question, the marking points and the marks each earns, and a model answer. For longer answers, give level descriptors like a real mark scheme.',
    );
    lines.push(
      "3. Keep the paper and the mark scheme clearly separate, so I can print or save the paper on its own.",
    );
    lines.push(
      "4. After I've done the paper, I may tell you my marks for each question. Then tell me, for each topic, whether to rate it red, amber or green in my revision app (red: under half marks, amber: half or more, green: nearly full marks).",
    );
  } else {
    lines.push("## How to run it");
    lines.push(
      "1. Ask me one question at a time, with its marks. Don't show the answer or the mark scheme until I've replied.",
    );
    lines.push(
      `2. When I answer, mark it like a ${board || "GCSE"} examiner: my mark out of the total, what earned marks, what was missing, and a model answer.`,
    );
    lines.push(
      '3. If I say "hint", give me a hint, not the answer. If I say "skip", show the mark scheme and move on.',
    );
    lines.push("4. Then ask the next question.");
    lines.push(
      "5. At the end, give my total score and, for each topic, tell me whether to rate it red, amber or green in my revision app (red: under half marks, amber: half or more, green: nearly full marks).",
    );
  }
  lines.push("");

  lines.push("## Accuracy");
  lines.push(
    `- Only use content from the ${spec} specification${tier ? ` for the ${tier} tier` : ""}. If you're not sure about something, say so rather than guess.`,
  );
  if (f.extra.trim()) {
    lines.push("");
    lines.push("## Anything else");
    lines.push(f.extra.trim());
  }
  lines.push("");
  lines.push(f.format === "paper" ? "Write the question paper now." : "Start now with question 1.");
  return lines.join("\n");
}
