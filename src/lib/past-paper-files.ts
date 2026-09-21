import p1ms from "@/assets/papers/Higher_November_2024_Paper1_NonCalculator_MS.pdf.asset.json";
import p1qp from "@/assets/papers/Higher_November_2024_Paper1_NonCalculator_QP.pdf.asset.json";
import p2ms from "@/assets/papers/Higher_November_2024_Paper2_Calculator_MS.pdf.asset.json";
import p2qp from "@/assets/papers/Higher_November_2024_Paper2_Calculator_QP.pdf.asset.json";
import p3ms from "@/assets/papers/Higher_November_2024_Paper3_Calculator_MS.pdf.asset.json";
import p3qp from "@/assets/papers/Higher_November_2024_Paper3_Calculator_QP.pdf.asset.json";

export type PaperKind = "qp" | "ms";

export type PaperFile = {
  /** Subject name as it appears in the subject catalogue. */
  subject: string;
  /** Foundation / Higher, or null when the subject isn't tiered. */
  tier: string | null;
  series: string;
  paper: string;
  kind: PaperKind;
  url: string;
};

export const PAPER_FILES: PaperFile[] = [
  {
    subject: "Mathematics",
    tier: "Higher",
    series: "November 2024",
    paper: "Paper 1 (non-calculator)",
    kind: "qp",
    url: p1qp.url,
  },
  {
    subject: "Mathematics",
    tier: "Higher",
    series: "November 2024",
    paper: "Paper 1 (non-calculator)",
    kind: "ms",
    url: p1ms.url,
  },
  {
    subject: "Mathematics",
    tier: "Higher",
    series: "November 2024",
    paper: "Paper 2 (calculator)",
    kind: "qp",
    url: p2qp.url,
  },
  {
    subject: "Mathematics",
    tier: "Higher",
    series: "November 2024",
    paper: "Paper 2 (calculator)",
    kind: "ms",
    url: p2ms.url,
  },
  {
    subject: "Mathematics",
    tier: "Higher",
    series: "November 2024",
    paper: "Paper 3 (calculator)",
    kind: "qp",
    url: p3qp.url,
  },
  {
    subject: "Mathematics",
    tier: "Higher",
    series: "November 2024",
    paper: "Paper 3 (calculator)",
    kind: "ms",
    url: p3ms.url,
  },
];

/** Papers held in the app for one subject, optionally narrowed to a tier. */
export function papersForSubject(subjectName: string, tier: string | null) {
  const name = subjectName.trim().toLowerCase();
  const files = PAPER_FILES.filter((file) => {
    if (file.subject.toLowerCase() !== name) return false;
    if (!file.tier || !tier) return true;
    return file.tier.toLowerCase() === tier.trim().toLowerCase();
  });
  return {
    questionPapers: files.filter((f) => f.kind === "qp"),
    markSchemes: files.filter((f) => f.kind === "ms"),
  };
}
