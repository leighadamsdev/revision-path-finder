/**
 * Builds a prompt a student pastes into their chosen AI assistant to turn it into a
 * personalised GCSE tutor. Pure functions only, so the wording is easy to check and change.
 */

export type Choice = { value: string; label: string; prompt: string };

export const ASSISTANTS = [
  {
    value: "chatgpt",
    label: "ChatGPT",
    url: "https://chatgpt.com/",
    howTo:
      "Paste it as your first message in a new chat. To keep your tutor, create a Project and paste it into the project instructions.",
  },
  {
    value: "claude",
    label: "Claude",
    url: "https://claude.ai/new",
    howTo:
      "Paste it as your first message in a new chat. To keep your tutor, create a Project and paste it into the project instructions.",
  },
  {
    value: "gemini",
    label: "Gemini",
    url: "https://gemini.google.com/app",
    howTo:
      "Paste it as your first message in a new chat. To keep your tutor, create a Gem and paste it into its instructions.",
  },
  {
    value: "copilot",
    label: "Microsoft Copilot",
    url: "https://copilot.microsoft.com/",
    howTo: "Paste it as your first message in a new conversation.",
  },
  {
    value: "other",
    label: "Another AI assistant",
    url: "",
    howTo: "Paste it as your first message, or into its custom instructions if it has them.",
  },
] as const;

export type AssistantValue = (typeof ASSISTANTS)[number]["value"];

export const APPROACHES: Choice[] = [
  {
    value: "socratic",
    label: "Guide me with questions",
    prompt:
      "Teach me Socratically: ask guiding questions so I work things out myself, and only give the full answer after I've had a real go or ask for it.",
  },
  {
    value: "explain-test",
    label: "Explain, then test me",
    prompt:
      "Explain each idea clearly in small steps, then check I've understood with a few questions before moving on.",
  },
  {
    value: "exam-coach",
    label: "Exam coach",
    prompt:
      "Act as an exam coach: focus on exam-style questions, how marks are awarded, command words and how to structure answers for full marks.",
  },
  {
    value: "quiz",
    label: "Quick-fire quiz",
    prompt:
      "Run quick-fire retrieval practice: ask short questions one at a time, tell me straight away if I'm right, and come back to anything I get wrong.",
  },
];

export const TONES: Choice[] = [
  {
    value: "encouraging",
    label: "Encouraging and patient",
    prompt: "Be warm, patient and encouraging. Praise effort and progress.",
  },
  {
    value: "calm",
    label: "Calm and to the point",
    prompt: "Be calm, clear and to the point. No fuss, no filler.",
  },
  {
    value: "challenging",
    label: "Challenging",
    prompt:
      "Be friendly but demanding: push me, don't accept vague answers, and keep standards high.",
  },
  {
    value: "fun",
    label: "Fun, with examples",
    prompt:
      "Be upbeat and use everyday examples, analogies and a little humour to make ideas stick.",
  },
];

export const ACTIVITIES: Choice[] = [
  {
    value: "explain",
    label: "Explain ideas simply",
    prompt: "explain ideas simply, building from what I already know",
  },
  {
    value: "check",
    label: "Check my understanding",
    prompt: "check my understanding with short questions",
  },
  {
    value: "exam-q",
    label: "Exam-style questions",
    prompt: "set exam-style questions with the marks shown",
  },
  {
    value: "mark",
    label: "Mark my answers",
    prompt: "mark my answers like a GCSE examiner, with a mark, what earned it and how to improve",
  },
  {
    value: "worked",
    label: "Worked examples",
    prompt: "show worked examples, then give me a similar one to try",
  },
  {
    value: "mistakes",
    label: "Common mistakes",
    prompt: "point out common mistakes and misconceptions students make",
  },
  {
    value: "memory",
    label: "Memory tricks",
    prompt: "suggest memory tricks, mnemonics and ways to remember key facts",
  },
  {
    value: "flashcards",
    label: "Make flashcards",
    prompt: "turn what we cover into question-and-answer flashcards",
  },
  {
    value: "notes",
    label: "Summary notes",
    prompt: "summarise each topic into short revision notes",
  },
  {
    value: "keywords",
    label: "Key words",
    prompt: "teach the key vocabulary and definitions I need to use in answers",
  },
];

export const QUESTION_TYPES: Choice[] = [
  { value: "mcq", label: "Multiple choice", prompt: "multiple choice" },
  { value: "short", label: "Short answer", prompt: "short answer" },
  { value: "long", label: "Extended / essay", prompt: "extended answers and essay plans" },
  { value: "calc", label: "Calculations", prompt: "calculations with working shown" },
  {
    value: "data",
    label: "Data and sources",
    prompt: "questions using data, graphs, extracts or sources",
  },
];

export const DIFFICULTIES: Choice[] = [
  {
    value: "build",
    label: "Start easy and build up",
    prompt: "Start with easier questions and build up as I get them right.",
  },
  {
    value: "target",
    label: "Match my target grade",
    prompt: "Pitch questions at my target grade.",
  },
  {
    value: "stretch",
    label: "Stretch me",
    prompt: "Stretch me with harder, higher-grade questions once I'm secure on the basics.",
  },
];

export const RESPONSE_LENGTHS: Choice[] = [
  {
    value: "short",
    label: "Short",
    prompt: "Keep each reply short: a few sentences, then hand back to me.",
  },
  {
    value: "medium",
    label: "Medium",
    prompt: "Keep replies a manageable length, using headings or bullet points where they help.",
  },
  {
    value: "detailed",
    label: "Detailed",
    prompt: "Give detailed explanations when they help, but always end by asking me something.",
  },
];

export const NEEDS: Choice[] = [
  {
    value: "dyslexia",
    label: "Dyslexia-friendly",
    prompt: "Use short sentences, plain words, and break text into small chunks.",
  },
  {
    value: "adhd",
    label: "Short bursts of focus",
    prompt: "Keep tasks short, vary activities, and suggest a short break every 20 minutes or so.",
  },
  {
    value: "eal",
    label: "English is not my first language",
    prompt: "Use simple English, explain subject words, and check I understand key terms.",
  },
  {
    value: "anxiety",
    label: "I get anxious about exams",
    prompt: "Be reassuring, keep the pressure low, and remind me of what I'm getting right.",
  },
  {
    value: "visual",
    label: "I like visual explanations",
    prompt: "Use diagrams described in words, tables and step-by-step layouts where possible.",
  },
  {
    value: "steps",
    label: "Step-by-step",
    prompt: "Break every method into clear numbered steps.",
  },
];

export const RULES: Choice[] = [
  {
    value: "no-homework",
    label: "Don't just give me answers to homework",
    prompt: "Don't write my homework or coursework for me; help me do it myself.",
  },
  {
    value: "one-question",
    label: "Ask one question at a time",
    prompt: "Ask one question at a time and wait for my answer.",
  },
  {
    value: "say-why",
    label: "Tell me why I'm wrong",
    prompt: "When I'm wrong, tell me clearly and explain why, then let me try again.",
  },
  {
    value: "check-first",
    label: "Check I understand before moving on",
    prompt: "Check I've understood before moving on to something new.",
  },
  {
    value: "spec",
    label: "Stick to my exam board",
    prompt:
      "Stick to what my exam board's specification requires; tell me if something is beyond it.",
  },
  {
    value: "honest",
    label: "Say if you're not sure",
    prompt:
      "If you're not sure about a fact, say so rather than guessing, and suggest how I can check it.",
  },
  {
    value: "summary",
    label: "End with a summary",
    prompt: "End each session with a short summary of what I did well and what to revise next.",
  },
];

export const DEFAULT_RULES = [
  "no-homework",
  "one-question",
  "say-why",
  "check-first",
  "spec",
  "honest",
  "summary",
];

export type TutorTopic = { text: string; rating: number | null };

export type TutorForm = {
  subject: string;
  board: string;
  tier: string;
  targetGrade: string;
  examDate: string;
  topics: TutorTopic[];
  approach: string;
  tone: string;
  activities: string[];
  questionTypes: string[];
  difficulty: string;
  responseLength: string;
  sessionMinutes: string;
  needs: string[];
  rules: string[];
  name: string;
  extra: string;
};

function pick(list: Choice[], value: string) {
  return list.find((c) => c.value === value);
}

function picks(list: Choice[], values: string[]) {
  return list.filter((c) => values.includes(c.value));
}

function ratingWord(r: number | null) {
  if (r == null) return "";
  return r <= 2
    ? " (red: I find this hard)"
    : r <= 4
      ? " (amber: I know some of this)"
      : " (green: I know this well)";
}

/** Turns the form into the tutor prompt, in plain British English. */
export function buildTutorPrompt(f: TutorForm, today = new Date()): string {
  const lines: string[] = [];
  const subject = f.subject || "my GCSE subject";
  lines.push(
    `You are my personal GCSE ${subject} tutor. I'm a student in England preparing for my GCSE exams.`,
  );
  lines.push("");

  lines.push("## About me and my exam");
  const about: string[] = [];
  if (f.name.trim()) about.push(`Call me ${f.name.trim()}.`);
  about.push(
    `Subject: GCSE ${subject}${f.board ? `, ${f.board} specification` : ""}${f.tier && f.tier !== "Not tiered" ? `, ${f.tier} tier` : ""}.`,
  );
  if (f.targetGrade) about.push(`My target grade is ${f.targetGrade}.`);
  if (f.examDate) {
    const days = Math.round(
      (new Date(f.examDate).getTime() - new Date(today.toDateString()).getTime()) / 86_400_000,
    );
    about.push(
      `My next ${subject} exam is on ${new Date(f.examDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${days > 0 ? ` (${days} days away)` : ""}.`,
    );
  }
  lines.push(...about.map((a) => `- ${a}`));
  lines.push("");

  if (f.topics.length) {
    lines.push("## Topics I want to work on");
    const sorted = [...f.topics].sort((a, b) => (a.rating ?? 3) - (b.rating ?? 3));
    lines.push(...sorted.map((t) => `- ${t.text}${ratingWord(t.rating)}`));
    if (f.topics.some((t) => t.rating != null))
      lines.push("Spend most time on my red topics, then amber. Only briefly check green ones.");
    lines.push("");
  }

  lines.push("## How to teach me");
  const approach = pick(APPROACHES, f.approach);
  const tone = pick(TONES, f.tone);
  if (approach) lines.push(`- ${approach.prompt}`);
  if (tone) lines.push(`- ${tone.prompt}`);
  const acts = picks(ACTIVITIES, f.activities);
  if (acts.length) lines.push(`- In our sessions: ${acts.map((a) => a.prompt).join("; ")}.`);
  const qs = picks(QUESTION_TYPES, f.questionTypes);
  if (qs.length)
    lines.push(`- Use these kinds of questions: ${qs.map((q) => q.prompt).join(", ")}.`);
  const diff = pick(DIFFICULTIES, f.difficulty);
  if (diff) lines.push(`- ${diff.prompt}`);
  const len = pick(RESPONSE_LENGTHS, f.responseLength);
  if (len) lines.push(`- ${len.prompt}`);
  if (f.sessionMinutes) lines.push(`- Plan each session to fit about ${f.sessionMinutes} minutes.`);
  for (const n of picks(NEEDS, f.needs)) lines.push(`- ${n.prompt}`);
  lines.push("");

  const rules = picks(RULES, f.rules);
  lines.push("## Rules");
  lines.push(...rules.map((r) => `- ${r.prompt}`));
  lines.push(
    "- Use British English and UK GCSE terms (for example, grades 9 to 1 and exam board names).",
  );
  lines.push(
    "- Keep our conversation focused on my revision and appropriate for a school student.",
  );
  lines.push("");

  if (f.extra.trim()) {
    lines.push("## Anything else");
    lines.push(f.extra.trim());
    lines.push("");
  }

  lines.push("## Let's start");
  lines.push(
    f.topics.length
      ? "Start by briefly confirming what you'll help me with, then ask me 2–3 quick questions on my first topic to find out what I already know."
      : `Start by asking me which ${subject} topic I'd like to work on, then ask 2–3 quick questions to find out what I already know.`,
  );
  return lines.join("\n");
}
