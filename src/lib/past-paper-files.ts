import aqaP1ms from "@/assets/papers/Higher_November_2024_Paper1_NonCalculator_MS.pdf.asset.json";
import aqaP1qp from "@/assets/papers/Higher_November_2024_Paper1_NonCalculator_QP.pdf.asset.json";
import aqaP2ms from "@/assets/papers/Higher_November_2024_Paper2_Calculator_MS.pdf.asset.json";
import aqaP2qp from "@/assets/papers/Higher_November_2024_Paper2_Calculator_QP.pdf.asset.json";
import aqaP3ms from "@/assets/papers/Higher_November_2024_Paper3_Calculator_MS.pdf.asset.json";
import aqaP3qp from "@/assets/papers/Higher_November_2024_Paper3_Calculator_QP.pdf.asset.json";
import edxF1qp from "@/assets/papers/Edexcel_June_2024_Foundation_Paper1_NonCalculator_QP.pdf.asset.json";
import edxF2qp from "@/assets/papers/Edexcel_June_2024_Foundation_Paper2_Calculator_QP.pdf.asset.json";
import edxF3qp from "@/assets/papers/Edexcel_June_2024_Foundation_Paper3_Calculator_QP.pdf.asset.json";
import edxH1qp from "@/assets/papers/Edexcel_June_2024_Higher_Paper1_NonCalculator_QP.pdf.asset.json";
import edxH2qp from "@/assets/papers/Edexcel_June_2024_Higher_Paper2_Calculator_QP.pdf.asset.json";
import edxH3qp from "@/assets/papers/Edexcel_June_2024_Higher_Paper3_Calculator_QP.pdf.asset.json";

export type PaperKind = "qp" | "ms";

export type PaperFile = {
  /** Subject name as it appears in the subject catalogue. */
  subject: string;
  /** Exam board the paper belongs to. */
  board: string;
  /** Foundation / Higher, or null when the subject isn't tiered. */
  tier: string | null;
  series: string;
  paper: string;
  kind: PaperKind;
  url: string;
};

export const PAPER_FILES: PaperFile[] = [
  // AQA — November 2024 (Higher)
  {
    subject: "Mathematics",
    board: "AQA",
    tier: "Higher",
    series: "November 2024",
    paper: "Paper 1 (non-calculator)",
    kind: "qp",
    url: aqaP1qp.url,
  },
  {
    subject: "Mathematics",
    board: "AQA",
    tier: "Higher",
    series: "November 2024",
    paper: "Paper 1 (non-calculator)",
    kind: "ms",
    url: aqaP1ms.url,
  },
  {
    subject: "Mathematics",
    board: "AQA",
    tier: "Higher",
    series: "November 2024",
    paper: "Paper 2 (calculator)",
    kind: "qp",
    url: aqaP2qp.url,
  },
  {
    subject: "Mathematics",
    board: "AQA",
    tier: "Higher",
    series: "November 2024",
    paper: "Paper 2 (calculator)",
    kind: "ms",
    url: aqaP2ms.url,
  },
  {
    subject: "Mathematics",
    board: "AQA",
    tier: "Higher",
    series: "November 2024",
    paper: "Paper 3 (calculator)",
    kind: "qp",
    url: aqaP3qp.url,
  },
  {
    subject: "Mathematics",
    board: "AQA",
    tier: "Higher",
    series: "November 2024",
    paper: "Paper 3 (calculator)",
    kind: "ms",
    url: aqaP3ms.url,
  },

  // Edexcel (Pearson) — June 2024
  {
    subject: "Mathematics",
    board: "Edexcel",
    tier: "Foundation",
    series: "June 2024",
    paper: "Paper 1 (non-calculator)",
    kind: "qp",
    url: edxF1qp.url,
  },
  {
    subject: "Mathematics",
    board: "Edexcel",
    tier: "Foundation",
    series: "June 2024",
    paper: "Paper 2 (calculator)",
    kind: "qp",
    url: edxF2qp.url,
  },
  {
    subject: "Mathematics",
    board: "Edexcel",
    tier: "Foundation",
    series: "June 2024",
    paper: "Paper 3 (calculator)",
    kind: "qp",
    url: edxF3qp.url,
  },
  {
    subject: "Mathematics",
    board: "Edexcel",
    tier: "Higher",
    series: "June 2024",
    paper: "Paper 1 (non-calculator)",
    kind: "qp",
    url: edxH1qp.url,
  },
  {
    subject: "Mathematics",
    board: "Edexcel",
    tier: "Higher",
    series: "June 2024",
    paper: "Paper 2 (calculator)",
    kind: "qp",
    url: edxH2qp.url,
  },
  {
    subject: "Mathematics",
    board: "Edexcel",
    tier: "Higher",
    series: "June 2024",
    paper: "Paper 3 (calculator)",
    kind: "qp",
    url: edxH3qp.url,
  },
];

/** Papers held in the app for one subject. All tiers are listed, with the
 * student's own tier first so their papers are easiest to reach. */
export function papersForSubject(subjectName: string, tier: string | null) {
  const name = subjectName.trim().toLowerCase();
  const own = tier?.trim().toLowerCase() ?? null;
  const files = PAPER_FILES.filter((file) => file.subject.toLowerCase() === name).sort(
    (a, b) => {
      if (own) {
        const aOwn = a.tier?.toLowerCase() === own ? 0 : 1;
        const bOwn = b.tier?.toLowerCase() === own ? 0 : 1;
        if (aOwn !== bOwn) return aOwn - bOwn;
      }
      return a.paper.localeCompare(b.paper);
    },
  );
  return {
    questionPapers: files.filter((f) => f.kind === "qp"),
    markSchemes: files.filter((f) => f.kind === "ms"),
  };
}

/** Same papers, grouped by exam board with the subject's own board first. */
export function papersByBoard(
  subjectName: string,
  tier: string | null,
  preferredBoard?: string | null,
) {
  const { questionPapers, markSchemes } = papersForSubject(subjectName, tier);
  const all = [...questionPapers, ...markSchemes];
  const boards = [...new Set(all.map((f) => f.board))].sort((a, b) => {
    const pref = preferredBoard?.trim().toLowerCase();
    if (pref) {
      if (a.toLowerCase() === pref) return -1;
      if (b.toLowerCase() === pref) return 1;
    }
    return a.localeCompare(b);
  });
  return boards.map((board) => ({
    board,
    questionPapers: questionPapers.filter((f) => f.board === board),
    markSchemes: markSchemes.filter((f) => f.board === board),
  }));
}
