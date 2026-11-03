// Pure PDF operations with pdf-lib. They run in the browser and in Node (tests).
// Nothing here touches the network: files never leave the user's device.
import { PDFDocument, StandardFonts, degrees, rgb } from "./vendor/pdf-lib.esm.min.js";

const LOAD = { ignoreEncryption: false, updateMetadata: false };

export class ToolError extends Error {
  constructor(code, detail = "") {
    super(detail || code);
    this.code = code; // translated in the UI: "encrypted", "notpdf", "range", "empty"
  }
}

export async function load(bytes) {
  try {
    return await PDFDocument.load(bytes, LOAD);
  } catch (e) {
    const m = String(e && e.message || e);
    if (/encrypt/i.test(m)) throw new ToolError("encrypted", m);
    throw new ToolError("notpdf", m);
  }
}

export async function pageCount(bytes) {
  return (await load(bytes)).getPageCount();
}

/** "1-3, 5, 8-" -> [0,1,2,4,7,8,...] (0-based, in the order written, no duplicates). */
export function parseRanges(text, total) {
  const out = [];
  const parts = String(text).split(/[,;\s]+/).filter(Boolean);
  if (!parts.length) throw new ToolError("range", "empty");
  for (const part of parts) {
    const m = part.match(/^(\d*)\s*[-–]\s*(\d*)$|^(\d+)$/);
    if (!m) throw new ToolError("range", part);
    let a, b;
    if (m[3]) a = b = +m[3];
    else { a = m[1] ? +m[1] : 1; b = m[2] ? +m[2] : total; }
    if (a < 1 || b > total || a > b) throw new ToolError("range", part);
    for (let i = a; i <= b; i++) if (!out.includes(i - 1)) out.push(i - 1);
  }
  return out;
}

export async function merge(list) {
  if (list.length < 2) throw new ToolError("empty", "need two files");
  const out = await PDFDocument.create();
  for (const bytes of list) {
    const src = await load(bytes);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  return out.save();
}

/** Pick pages (0-based indices, in order) into a new PDF. */
export async function extract(bytes, indices) {
  const src = await load(bytes);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  return out.save();
}

/** mode "ranges": each comma group becomes one file; mode "each": one file per page. */
export async function split(bytes, mode, text = "") {
  const src = await load(bytes);
  const total = src.getPageCount();
  const groups = mode === "each"
    ? src.getPageIndices().map((i) => [i])
    : String(text).split(/[,;]+/).map((g) => g.trim()).filter(Boolean).map((g) => parseRanges(g, total));
  if (!groups.length) throw new ToolError("range", "empty");
  const files = [];
  for (const g of groups) files.push({ pages: g, bytes: await extract(bytes, g) });
  return files;
}

/** plan: [{ index, rotate }] in the new order; pages left out are deleted. rotate in degrees, added to the page's own. */
export async function organize(bytes, plan) {
  if (!plan.length) throw new ToolError("empty", "no pages left");
  const src = await load(bytes);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, plan.map((p) => p.index));
  pages.forEach((p, k) => {
    const r = ((plan[k].rotate || 0) % 360 + 360) % 360;
    if (r) p.setRotation(degrees((p.getRotation().angle + r) % 360));
    out.addPage(p);
  });
  return out.save();
}

const SIZES = { a4: [595.28, 841.89], letter: [612, 792] };

/** images: [{ bytes, type: "jpg"|"png" }]. size: "fit" | "a4" | "letter". margin in points. */
export async function imagesToPdf(images, size = "fit", margin = 0) {
  if (!images.length) throw new ToolError("empty", "no images");
  const out = await PDFDocument.create();
  for (const im of images) {
    const img = im.type === "png" ? await out.embedPng(im.bytes) : await out.embedJpg(im.bytes);
    let [w, h] = size === "fit" ? [img.width + 2 * margin, img.height + 2 * margin] : SIZES[size];
    if (size !== "fit" && img.width > img.height && w < h) [w, h] = [h, w]; // landscape photo on a landscape page
    const page = out.addPage([w, h]);
    const s = Math.min((w - 2 * margin) / img.width, (h - 2 * margin) / img.height);
    const dw = img.width * s, dh = img.height * s;
    page.drawImage(img, { x: (w - dw) / 2, y: (h - dh) / 2, width: dw, height: dh });
  }
  return out.save();
}

/** position: "bottom-center" | "bottom-right" | "top-right" ...; format "n" | "n-of-total"; ofWord for "n of N" in the UI language. */
export async function pageNumbers(bytes, { position = "bottom-center", start = 1, format = "n", ofWord = "of", size = 11, skipFirst = false } = {}) {
  const doc = await load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;
  pages.forEach((page, i) => {
    if (skipFirst && i === 0) return;
    const n = start + i - (skipFirst ? 1 : 0);
    const label = format === "n-of-total" ? `${n} ${ofWord} ${total + start - 1 - (skipFirst ? 1 : 0)}` : String(n);
    const { width, height } = page.getSize();
    const tw = font.widthOfTextAtSize(label, size);
    const m = 28;
    const [v, hpos] = position.split("-");
    const x = hpos === "left" ? m : hpos === "right" ? width - m - tw : (width - tw) / 2;
    const y = v === "top" ? height - m - size : m;
    page.drawText(label, { x, y, size, font, color: rgb(0.067, 0.078, 0.094) });
  });
  return doc.save();
}

/** Diagonal text watermark on every page. opacity 0..1. */
export async function watermark(bytes, { text, opacity = 0.18, size = 0, color = [0.7, 0.15, 0.12] } = {}) {
  if (!text || !String(text).trim()) throw new ToolError("empty", "no text");
  const doc = await load(bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const angle = Math.atan2(height, width);
    const diag = Math.hypot(width, height);
    const s = size || Math.min(96, (diag * 0.7) / Math.max(1, font.widthOfTextAtSize(text, 1)));
    const tw = font.widthOfTextAtSize(text, s);
    const cx = width / 2 - (Math.cos(angle) * tw) / 2 + (Math.sin(angle) * s) / 3;
    const cy = height / 2 - (Math.sin(angle) * tw) / 2 - (Math.cos(angle) * s) / 3;
    page.drawText(text, { x: cx, y: cy, size: s, font, color: rgb(...color), opacity, rotate: degrees((angle * 180) / Math.PI) });
  }
  return doc.save();
}

/** Place a PNG (e.g. a drawn signature) on one page. x, y, width are fractions of the page (0..1), y from the top. */
export async function stampImage(bytes, { png, pageIndex = 0, x = 0.6, y = 0.8, width = 0.3 }) {
  const doc = await load(bytes);
  const page = doc.getPage(pageIndex);
  const img = await doc.embedPng(png);
  const { width: pw, height: ph } = page.getSize();
  const w = pw * width, h = (img.height / img.width) * w;
  page.drawImage(img, { x: pw * x, y: ph - ph * y - h, width: w, height: h });
  return doc.save();
}

/** Build a PDF from rendered page images (used by compress and by OCR fallback). pages: [{ jpg, width, height }] in points. */
export async function fromPageImages(pages) {
  const out = await PDFDocument.create();
  for (const p of pages) {
    const img = await out.embedJpg(p.jpg);
    const page = out.addPage([p.width, p.height]);
    page.drawImage(img, { x: 0, y: 0, width: p.width, height: p.height });
  }
  return out.save();
}

/** Merge per-page PDFs (e.g. from OCR) into one. */
export async function concat(list) {
  const out = await PDFDocument.create();
  for (const bytes of list) {
    const src = await PDFDocument.load(bytes);
    (await out.copyPages(src, src.getPageIndices())).forEach((p) => out.addPage(p));
  }
  return out.save();
}
