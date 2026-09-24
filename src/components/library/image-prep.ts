/** Browser-side preparation of a contents-page upload. */

export async function fileToImage(file: File): Promise<HTMLImageElement> {
  let blob: Blob = file;
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    blob = await pdfFirstPage(file);
  } else if (file.type.includes("heic") || file.type.includes("heif") || /\.hei[cf]$/.test(name)) {
    const heic2any = (await import("heic2any")).default;
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    blob = Array.isArray(out) ? out[0]! : out;
  }
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.src = url;
  await img.decode();
  return img;
}

async function pdfFirstPage(file: File): Promise<Blob> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext("2d")!, viewport, canvas }).promise;
  return await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92));
}

export type Crop = { x: number; y: number; w: number; h: number }; // fractions 0–1 of rotated image

/** Draws the image rotated, cropped and (optionally) contrast-enhanced; returns a JPEG data URL. */
export function renderPrepared(img: HTMLImageElement, rotation: number, crop: Crop | null, enhance: boolean, maxSide = 2000) {
  const quarter = ((rotation % 360) + 360) % 360;
  const swap = quarter === 90 || quarter === 270;
  const rw = swap ? img.naturalHeight : img.naturalWidth;
  const rh = swap ? img.naturalWidth : img.naturalHeight;
  const rotated = document.createElement("canvas");
  rotated.width = rw;
  rotated.height = rh;
  const rc = rotated.getContext("2d")!;
  rc.translate(rw / 2, rh / 2);
  rc.rotate((quarter * Math.PI) / 180);
  rc.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  const c = crop ?? { x: 0, y: 0, w: 1, h: 1 };
  const sx = c.x * rw, sy = c.y * rh, sw = Math.max(1, c.w * rw), sh = Math.max(1, c.h * rh);
  const scale = Math.min(1, maxSide / Math.max(sw, sh));
  const out = document.createElement("canvas");
  out.width = Math.round(sw * scale);
  out.height = Math.round(sh * scale);
  const oc = out.getContext("2d")!;
  if (enhance) oc.filter = "grayscale(1) contrast(1.35) brightness(1.08)";
  oc.drawImage(rotated, sx, sy, sw, sh, 0, 0, out.width, out.height);
  return out.toDataURL("image/jpeg", 0.9);
}
