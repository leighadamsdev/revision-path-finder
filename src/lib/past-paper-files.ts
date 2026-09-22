import rawPapers from "./past-papers.json";

export type PaperKind = "qp" | "ms" | "insert" | "resource";

export type PaperFile = {
  /** Subject name as it appears in the subject catalogue. */
  subject: string;
  /** Exam board the paper belongs to. */
  board: string;
  /** Foundation / Higher / Intermediate, or null when the paper isn't tiered. */
  tier: string | null;
  /** Human label for the exam series, e.g. "June 2025". */
  series: string;
  /** Sortable series key (year * 100 + month), newest highest. */
  seriesKey: number;
  paper: string;
  kind: PaperKind;
  url: string;
};

export const PAPER_FILES: PaperFile[] = rawPapers as PaperFile[];

export const KIND_LABELS: Record<PaperKind, string> = {
  qp: "Question paper",
  ms: "Mark scheme",
  insert: "Insert",
  resource: "Resource",
};

export type PaperGroup = {
  /** Paper name plus tier, e.g. "Paper 1 · Higher". */
  label: string;
  tier: string | null;
  files: PaperFile[];
};

export type SeriesGroup = {
  series: string;
  seriesKey: number;
  papers: PaperGroup[];
};

export type BoardGroup = {
  board: string;
  series: SeriesGroup[];
};

const KIND_ORDER: PaperKind[] = ["qp", "ms", "insert", "resource"];

/**
 * All papers held for a subject, grouped by exam board, then by exam series
 * (most recent first), then by paper — with the question paper and its mark
 * scheme sitting together. The student's own tier is listed first.
 */
export function papersByBoard(
  subjectName: string,
  tier: string | null,
  preferredBoard?: string | null,
): BoardGroup[] {
  const name = subjectName.trim().toLowerCase();
  const own = tier?.trim().toLowerCase() ?? null;
  const files = PAPER_FILES.filter((file) => file.subject.toLowerCase() === name);

  const boards = [...new Set(files.map((f) => f.board))].sort((a, b) => {
    const pref = preferredBoard?.trim().toLowerCase();
    if (pref) {
      if (a.toLowerCase() === pref) return -1;
      if (b.toLowerCase() === pref) return 1;
    }
    return a.localeCompare(b);
  });

  return boards.map((board) => {
    const boardFiles = files.filter((f) => f.board === board);
    const seriesKeys = [...new Set(boardFiles.map((f) => f.seriesKey))].sort((a, b) => b - a);

    const series = seriesKeys.map((seriesKey) => {
      const seriesFiles = boardFiles.filter((f) => f.seriesKey === seriesKey);
      const byPaper = new Map<string, PaperFile[]>();
      for (const file of seriesFiles) {
        const key = `${file.paper}||${file.tier ?? ""}`;
        const list = byPaper.get(key);
        if (list) list.push(file);
        else byPaper.set(key, [file]);
      }

      const papers: PaperGroup[] = [...byPaper.values()]
        .map((group) => {
          const first = group[0]!;
          return {
            label: first.tier ? `${first.paper} · ${first.tier}` : first.paper,
            tier: first.tier,
            files: [...group].sort(
              (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind),
            ),
          };
        })
        .sort((a, b) => {
          if (own) {
            const aOwn = a.tier?.toLowerCase() === own ? 0 : 1;
            const bOwn = b.tier?.toLowerCase() === own ? 0 : 1;
            if (aOwn !== bOwn) return aOwn - bOwn;
          }
          return a.label.localeCompare(b.label, undefined, { numeric: true });
        });

      return { series: seriesFiles[0]!.series, seriesKey, papers };
    });

    return { board, series };
  });
}
