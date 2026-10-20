/**
 * Reads the text out of everyday school documents in the browser, without extra libraries:
 * plain text and CSV, Word (.docx) and Excel (.xlsx). PDFs and photos are sent as files instead.
 */

export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

/** True for files we send whole (PDFs and pictures). */
export function isPdfOrImage(file: File) {
  return (
    file.type === "application/pdf" ||
    file.type.startsWith("image/") ||
    /\.(pdf|jpe?g|png|heic|webp)$/i.test(file.name)
  );
}

/** The file's text, or null if it isn't a type we can read as text. */
export async function textFromFile(file: File): Promise<string | null> {
  const name = file.name.toLowerCase();
  if (/\.(txt|csv|tsv|md)$/.test(name) || file.type.startsWith("text/"))
    return (await file.text()).slice(0, 120_000);
  if (name.endsWith(".docx")) return docxText(await file.arrayBuffer());
  if (name.endsWith(".xlsx")) return xlsxText(await file.arrayBuffer());
  return null;
}

// ---------- minimal zip reading (Word and Excel files are zip archives) ----------

type ZipEntry = { name: string; method: number; size: number; offset: number };

function zipEntries(buf: ArrayBuffer): ZipEntry[] {
  const view = new DataView(buf);
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66_000); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("That file looks damaged.");
  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();
  const out: ZipEntry[] = [];
  for (let i = 0; i < count; i++) {
    if (view.getUint32(p, true) !== 0x02014b50) break;
    const method = view.getUint16(p + 10, true);
    const size = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const offset = view.getUint32(p + 42, true);
    const name = decoder.decode(new Uint8Array(buf, p + 46, nameLen));
    out.push({ name, method, size, offset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

async function zipRead(buf: ArrayBuffer, entry: ZipEntry): Promise<string> {
  const view = new DataView(buf);
  const start =
    entry.offset +
    30 +
    view.getUint16(entry.offset + 26, true) +
    view.getUint16(entry.offset + 28, true);
  const data = new Uint8Array(buf, start, entry.size);
  if (entry.method === 0) return new TextDecoder().decode(data);
  if (entry.method !== 8) throw new Error("That file uses a format we can't read.");
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Response(stream).text();
}

function decodeXml(s: string) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

async function docxText(buf: ArrayBuffer): Promise<string> {
  const entry = zipEntries(buf).find((e) => e.name === "word/document.xml");
  if (!entry) throw new Error("That doesn't look like a Word document.");
  const xml = (await zipRead(buf, entry))
    .replace(/<w:tab\/>/g, " ")
    // Each table row on one line, cells separated by " | ".
    .replace(
      /<w:tr[\s>][\s\S]*?<\/w:tr>/g,
      (row) =>
        row
          .split(/<\/w:tc>/)
          .map((cell) =>
            cell
              .replace(/<\/w:p>/g, " ")
              .replace(/<[^>]+>/g, "")
              .trim(),
          )
          .filter(Boolean)
          .join(" | ") + "\n",
    );
  return decodeXml(xml.replace(/<\/w:p>/g, "\n").replace(/<[^>]+>/g, ""))
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim()
    .slice(0, 120_000);
}

/** Excel stores dates as day numbers counted from 30 Dec 1899. */
function excelDate(serial: number) {
  const d = new Date(Date.UTC(1899, 11, 30) + Math.round(serial) * 86_400_000);
  return d.toISOString().slice(0, 10);
}

async function xlsxText(buf: ArrayBuffer): Promise<string> {
  const entries = zipEntries(buf);
  const shared: string[] = [];
  const sst = entries.find((e) => e.name === "xl/sharedStrings.xml");
  if (sst) {
    const xml = await zipRead(buf, sst);
    for (const si of xml.match(/<si>[\s\S]*?<\/si>/g) ?? []) {
      shared.push(
        decodeXml(
          (si.match(/<t[^>]*>([\s\S]*?)<\/t>/g) ?? [])
            .map((t) => t.replace(/<[^>]+>/g, ""))
            .join(""),
        ),
      );
    }
  }
  const sheets = entries.filter((e) => /^xl\/worksheets\/sheet\d+\.xml$/.test(e.name)).slice(0, 5);
  if (!sheets.length) throw new Error("That doesn't look like an Excel file.");
  const lines: string[] = [];
  for (const sheet of sheets) {
    const xml = await zipRead(buf, sheet);
    for (const row of xml.match(/<row[^>]*>[\s\S]*?<\/row>/g) ?? []) {
      const cells: string[] = [];
      for (const c of row.match(/<c[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g) ?? []) {
        const type = c.match(/\st="(\w+)"/)?.[1];
        const v = c.match(/<v>([\s\S]*?)<\/v>/)?.[1];
        const inline = c.match(/<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>/)?.[1];
        let value = "";
        if (type === "s" && v != null) value = shared[Number(v)] ?? "";
        else if (inline != null) value = decodeXml(inline);
        else if (v != null) {
          const n = Number(v);
          // Day numbers between 2009 and 2064 are almost certainly dates.
          value =
            Number.isFinite(n) && n > 40_000 && n < 60_000 && Number.isInteger(n)
              ? excelDate(n)
              : decodeXml(v);
        }
        if (value) cells.push(value);
      }
      if (cells.length) lines.push(cells.join(" | "));
    }
  }
  return lines.join("\n").slice(0, 120_000);
}
