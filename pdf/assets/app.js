// Webspind PDF: the in-browser workbench for every tool page. All processing is local.
import * as T from "./tools.js";
import { zip } from "./zip.js";

const S = JSON.parse(document.getElementById("strings").textContent);
const U = S.ui, TL = S.tool, ID = S.id;
const bench = document.getElementById("bench");
const VENDOR = new URL("./vendor/", import.meta.url).href;

// ---------- helpers ----------
function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (k === "text") e.textContent = v;
    else e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null) e.append(k instanceof Node ? k : document.createTextNode(k));
  return e;
}
const fmtSize = (n) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);
const base = (name) => name.replace(/\.[^.]+$/, "");
const readFile = (f) => f.arrayBuffer().then((b) => new Uint8Array(b));
const isPdf = (f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name);
const isImage = (f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(f.name);
const canvasBlob = (c, type, q) => new Promise((res) => c.toBlob(res, type, q));
const blobBytes = async (b) => new Uint8Array(await b.arrayBuffer());

function errorText(e) {
  console.error(e);
  const map = { encrypted: U.errEncrypted, notpdf: U.errNotPdf, range: U.errRange, empty: U.errEmpty };
  return (e && map[e.code]) || U.errGeneric;
}

let pdfjsLib;
async function pdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import("./vendor/pdf.min.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = VENDOR + "pdf.worker.min.mjs";
  }
  return pdfjsLib;
}
async function openDoc(bytes) {
  const lib = await pdfjs();
  try {
    return await lib.getDocument({ data: bytes.slice(), isEvalSupported: false }).promise;
  } catch (e) {
    throw new T.ToolError(/password/i.test(e && e.name + e.message) ? "encrypted" : "notpdf", String(e));
  }
}
/** Render page n (1-based) to a canvas at `scale` (1 = 72 dpi). White background, so JPG export has no black areas. */
async function render(doc, n, scale) {
  const page = await doc.getPage(n);
  const vp = page.getViewport({ scale });
  const c = el("canvas", { width: Math.ceil(vp.width), height: Math.ceil(vp.height) });
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  const pt = page.getViewport({ scale: 1 });
  page.cleanup();
  return { canvas: c, wPt: pt.width, hPt: pt.height };
}

// ---------- shell: drop zone, options, run, results ----------
const state = { files: [] };
const zone = el("div", { class: "zone" });
const list = el("div", { class: "flist" });
const opts = el("div", { class: "opts" });
const runBtn = el("button", { class: "btn run", type: "button", text: U.run });
const status = el("p", { class: "status", role: "status" });
const results = el("div", { class: "results" });

function dropZone({ multiple, accept, onFiles }) {
  const input = el("input", { type: "file", accept, multiple, class: "sr", id: "file" });
  input.addEventListener("change", () => { onFiles([...input.files]); input.value = ""; });
  const label = el("label", { for: "file", class: "zlabel" },
    el("span", { class: "zclip", "aria-hidden": "true" }),
    el("span", { class: "ztext" }, multiple ? U.drop : U.dropOne, " ", el("u", { text: multiple ? U.choose : U.chooseOne })));
  zone.replaceChildren(input, label);
  ["dragenter", "dragover"].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.add("over"); }));
  ["dragleave", "drop"].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.remove("over"); }));
  zone.addEventListener("drop", (e) => onFiles([...e.dataTransfer.files]));
}

function setBusy(on, text = U.working) {
  runBtn.disabled = on;
  bench.classList.toggle("busy", on);
  status.textContent = on ? text : "";
}
function fail(e) { setBusy(false); status.textContent = errorText(e); status.classList.add("err"); }

function download(name, bytes, type = "application/pdf") {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  return el("a", { class: "btn dl", href: url, download: name, text: U.download });
}
function showResults(files, note = "") {
  status.classList.remove("err");
  const rows = files.map((f) => el("div", { class: "res" }, el("span", { class: "rname", text: f.name }), el("span", { class: "rsize", text: fmtSize(f.bytes.length) }), download(f.name, f.bytes, f.type)));
  const extra = [];
  if (files.length > 1) extra.push(el("a", { class: "btn btn-outline", href: URL.createObjectURL(new Blob([zip(files)], { type: "application/zip" })), download: `${ID}.zip`, text: U.downloadAll }));
  extra.push(el("button", { class: "btn btn-outline", type: "button", onclick: reset, text: U.again }));
  results.replaceChildren(el("h2", { text: U.done }), note ? el("p", { class: "note", text: note }) : "", ...rows, el("div", { class: "ractions" }, ...extra));
  results.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function reset() { state.files = []; results.replaceChildren(); list.replaceChildren(); status.textContent = ""; status.classList.remove("err"); TOOL.reset?.(); refresh(); }
function refresh() { runBtn.hidden = !TOOL.ready(); opts.hidden = !state.files.length; }

async function addFiles(files, { pdf = true, images = false, single = false } = {}) {
  const ok = files.filter((f) => (pdf && isPdf(f)) || (images && isImage(f)));
  if (!ok.length) { status.textContent = U.errNotPdf; status.classList.add("err"); return; }
  status.textContent = ""; status.classList.remove("err");
  const add = single ? ok.slice(0, 1) : ok;
  const loaded = [];
  for (const f of add) loaded.push({ name: f.name, size: f.size, type: f.type, file: f, bytes: await readFile(f) });
  state.files = single ? loaded : state.files.concat(loaded);
  results.replaceChildren();
  await TOOL.onFiles?.();
  refresh();
}

// ---------- reorderable file list (merge, images) ----------
function fileList(extra) {
  list.replaceChildren(...state.files.map((f, i) => {
    const row = el("div", { class: "frow", draggable: "true" },
      el("span", { class: "grip", "aria-hidden": "true" }), extra?.(f) || "", el("span", { class: "fname", text: f.name }),
      el("span", { class: "fmeta", text: f.pages ? `${f.pages} ${U.pages}` : fmtSize(f.size) }),
      el("button", { type: "button", class: "ib", title: U.moveUp, "aria-label": U.moveUp, disabled: i === 0, onclick: () => move(i, i - 1), text: "↑" }),
      el("button", { type: "button", class: "ib", title: U.moveDown, "aria-label": U.moveDown, disabled: i === state.files.length - 1, onclick: () => move(i, i + 1), text: "↓" }),
      el("button", { type: "button", class: "ib", title: U.remove, "aria-label": U.remove, onclick: () => { state.files.splice(i, 1); fileList(extra); refresh(); }, text: "×" }));
    row.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", String(i)));
    row.addEventListener("dragover", (e) => e.preventDefault());
    row.addEventListener("drop", (e) => { e.preventDefault(); e.stopPropagation(); move(+e.dataTransfer.getData("text/plain"), i); });
    return row;
  }));
  function move(a, b) { if (b < 0 || b >= state.files.length || a === b) return; const [x] = state.files.splice(a, 1); state.files.splice(b, 0, x); fileList(extra); }
}

// ---------- page thumbnails (organize, rotate, delete) ----------
const pageGrid = { doc: null, plan: [] };
async function thumbs() {
  const f = state.files[0];
  pageGrid.doc = await openDoc(f.bytes);
  const n = pageGrid.doc.numPages;
  pageGrid.plan = Array.from({ length: n }, (_, i) => ({ index: i, rotate: 0, deleted: false, canvas: null }));
  list.replaceChildren(el("div", { class: "thumbs" }));
  drawThumbs();
  for (let i = 0; i < n; i++) {
    const { canvas } = await render(pageGrid.doc, i + 1, 0.3);
    pageGrid.plan.find((p) => p.index === i).canvas = canvas;
    drawThumbs();
  }
}
function drawThumbs() {
  const grid = list.querySelector(".thumbs");
  if (!grid) return;
  grid.replaceChildren(...pageGrid.plan.map((p, k) => {
    const card = el("div", { class: `thumb${p.deleted ? " gone" : ""}`, draggable: "true" },
      el("div", { class: "tframe" }, p.canvas ? Object.assign(p.canvas, { style: `transform:rotate(${p.rotate}deg)` }) : el("span", { class: "tload" })),
      el("span", { class: "tnum", text: `${U.page} ${p.index + 1}` }),
      el("div", { class: "tbtns" },
        el("button", { type: "button", class: "ib", title: U.rotate, "aria-label": `${U.rotate} ${p.index + 1}`, onclick: () => { p.rotate = (p.rotate + 90) % 360; drawThumbs(); }, text: "↻" }),
        el("button", { type: "button", class: "ib", title: p.deleted ? U.restore : U.delete, "aria-label": `${p.deleted ? U.restore : U.delete} ${p.index + 1}`,
          onclick: () => { p.deleted = !p.deleted; drawThumbs(); refresh(); }, text: p.deleted ? "↺" : "×" })));
    card.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", String(k)));
    card.addEventListener("dragover", (e) => e.preventDefault());
    card.addEventListener("drop", (e) => { e.preventDefault(); const a = +e.dataTransfer.getData("text/plain"); const [x] = pageGrid.plan.splice(a, 1); pageGrid.plan.splice(k, 0, x); drawThumbs(); });
    return card;
  }));
}
const pagesTool = (extraOpts) => ({
  accept: "application/pdf,.pdf", single: true,
  async onFiles() { await thumbs(); extraOpts?.(); },
  ready: () => state.files.length === 1 && pageGrid.plan.some((p) => !p.deleted),
  async run() {
    const plan = pageGrid.plan.filter((p) => !p.deleted).map((p) => ({ index: p.index, rotate: p.rotate }));
    return [{ name: `${base(state.files[0].name)}-${ID}.pdf`, bytes: await T.organize(state.files[0].bytes, plan) }];
  },
});

// ---------- small option builders ----------
const field = (label, input) => el("label", { class: "field" }, el("span", { text: label }), input);
const select = (name, pairs, value) => el("select", { name }, ...pairs.map(([v, t]) => el("option", { value: v, selected: v === value, text: t })));
const radios = (name, pairs, value) => el("div", { class: "radios", role: "radiogroup" }, ...pairs.map(([v, t]) => el("label", {}, el("input", { type: "radio", name, value: v, checked: v === value }), " ", t)));
const val = (name) => { const e = opts.querySelector(`[name="${name}"]`); if (!e) return null; if (e.type === "radio") return opts.querySelector(`[name="${name}"]:checked`).value; if (e.type === "checkbox") return e.checked; return e.value; };

// ---------- the tools ----------
const OCR_LANGS = [["eng", "English"], ["dan", "Dansk"], ["deu", "Deutsch"], ["nor", "Norsk"], ["swe", "Svenska"], ["spa", "Español"], ["fra", "Français"],
  ["ita", "Italiano"], ["nld", "Nederlands"], ["por", "Português"], ["pol", "Polski"], ["fin", "Suomi"]];
const OCR_DEFAULT = { en: "eng", da: "dan", de: "deu", no: "nor", sv: "swe", es: "spa", fr: "fra", it: "ita", nl: "nld", pt: "por", pl: "pol", fi: "fin" };

const TOOLS = {
  merge: {
    accept: "application/pdf,.pdf", multiple: true,
    async onFiles() { for (const f of state.files) if (f.pages == null) f.pages = await T.pageCount(f.bytes).catch(() => "?"); fileList(); },
    ready: () => state.files.length >= 2,
    run: async () => [{ name: "merged.pdf", bytes: await T.merge(state.files.map((f) => f.bytes)) }],
  },
  split: {
    accept: "application/pdf,.pdf", single: true,
    async onFiles() {
      state.files[0].pages = await T.pageCount(state.files[0].bytes); fileList();
      opts.replaceChildren(radios("mode", [["each", TL.optEach], ["ranges", TL.optRanges]], "ranges"),
        field(TL.rangesLabel, el("input", { name: "ranges", type: "text", placeholder: TL.rangesHint, value: `1-${Math.ceil(state.files[0].pages / 2)}, ${Math.ceil(state.files[0].pages / 2) + 1}-` })));
    },
    ready: () => state.files.length === 1,
    async run() {
      const f = state.files[0];
      const parts = await T.split(f.bytes, val("mode"), val("ranges"));
      const label = (pages) => { const a = pages[0] + 1, b = pages[pages.length - 1] + 1; return pages.length === 1 ? `${a}` : `${a}-${b}`; };
      return parts.map((p) => ({ name: `${base(f.name)}-${U.page.toLowerCase()}-${label(p.pages)}.pdf`, bytes: p.bytes }));
    },
  },
  organize: pagesTool(),
  rotate: pagesTool(() => opts.replaceChildren(el("button", { type: "button", class: "btn btn-outline", onclick: () => { pageGrid.plan.forEach((p) => (p.rotate = (p.rotate + 90) % 360)); drawThumbs(); }, text: TL.rotateAll }))),
  delete: pagesTool(),
  "jpg-to-pdf": {
    accept: "image/*", multiple: true, pdf: false, images: true,
    async onFiles() {
      for (const f of state.files) f.url ||= URL.createObjectURL(f.file);
      fileList((f) => el("img", { class: "fthumb", src: f.url, alt: "" }));
      if (!opts.children.length) opts.replaceChildren(field(TL.pageSize, select("size", [["a4", TL.sizeA4], ["letter", TL.sizeLetter], ["fit", TL.sizeFit]], S.lang === "en" ? "letter" : "a4")),
        el("label", { class: "check" }, el("input", { type: "checkbox", name: "margin", checked: true }), " ", TL.margin));
    },
    ready: () => state.files.length >= 1,
    async run() {
      const images = [];
      for (const f of state.files) {
        const t = /png$/i.test(f.type) || /\.png$/i.test(f.name) ? "png" : /jpe?g$/i.test(f.type) || /\.jpe?g$/i.test(f.name) ? "jpg" : null;
        if (t) { images.push({ bytes: f.bytes, type: t }); continue; }
        const bmp = await createImageBitmap(f.file); // webp, gif, bmp, and HEIC where the browser supports it
        const c = el("canvas", { width: bmp.width, height: bmp.height }); const ctx = c.getContext("2d");
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(bmp, 0, 0);
        images.push({ bytes: await blobBytes(await canvasBlob(c, "image/jpeg", 0.92)), type: "jpg" });
      }
      return [{ name: state.files.length === 1 ? `${base(state.files[0].name)}.pdf` : "images.pdf", bytes: await T.imagesToPdf(images, val("size"), val("margin") ? 28 : 0) }];
    },
  },
  "pdf-to-jpg": {
    accept: "application/pdf,.pdf", single: true,
    async onFiles() {
      state.files[0].pages = await T.pageCount(state.files[0].bytes); fileList();
      opts.replaceChildren(field(TL.format, select("fmt", [["jpg", "JPG"], ["png", "PNG"]], "jpg")), field(TL.quality, select("dpi", [["72", "72 dpi"], ["150", "150 dpi"], ["300", "300 dpi"]], "150")));
    },
    ready: () => state.files.length === 1,
    async run(progress) {
      const f = state.files[0], doc = await openDoc(f.bytes), png = val("fmt") === "png", scale = +val("dpi") / 72, out = [];
      for (let i = 1; i <= doc.numPages; i++) {
        progress(i, doc.numPages);
        const { canvas } = await render(doc, i, scale);
        out.push({ name: `${base(f.name)}-${i}.${png ? "png" : "jpg"}`, type: png ? "image/png" : "image/jpeg", bytes: await blobBytes(await canvasBlob(canvas, png ? "image/png" : "image/jpeg", 0.9)) });
        canvas.width = canvas.height = 0;
      }
      return out;
    },
  },
  compress: {
    accept: "application/pdf,.pdf", single: true,
    async onFiles() {
      state.files[0].pages = await T.pageCount(state.files[0].bytes); fileList();
      opts.replaceChildren(radios("level", [["light", TL.levelLight], ["medium", TL.levelMedium], ["strong", TL.levelStrong]], "medium"));
    },
    ready: () => state.files.length === 1,
    async run(progress) {
      const [dpi, q] = { light: [150, 0.82], medium: [110, 0.68], strong: [80, 0.5] }[val("level")];
      const f = state.files[0], doc = await openDoc(f.bytes), pages = [];
      for (let i = 1; i <= doc.numPages; i++) {
        progress(i, doc.numPages);
        const { canvas, wPt, hPt } = await render(doc, i, dpi / 72);
        pages.push({ jpg: await blobBytes(await canvasBlob(canvas, "image/jpeg", q)), width: wPt, height: hPt });
        canvas.width = canvas.height = 0;
      }
      const bytes = await T.fromPageImages(pages);
      if (bytes.length >= f.bytes.length * 0.97) return { files: [], note: TL.notSmaller };
      return { files: [{ name: `${base(f.name)}-compressed.pdf`, bytes }], note: `${U.size}: ${fmtSize(f.bytes.length)} ${U.before} → ${fmtSize(bytes.length)} ${U.after}` };
    },
  },
  "page-numbers": {
    accept: "application/pdf,.pdf", single: true,
    async onFiles() {
      state.files[0].pages = await T.pageCount(state.files[0].bytes); fileList();
      opts.replaceChildren(field(TL.position, select("pos", [["bottom-center", TL.posBottomCenter], ["bottom-right", TL.posBottomRight], ["top-right", TL.posTopRight]], "bottom-center")),
        field(TL.start, el("input", { name: "start", type: "number", min: "0", value: "1", inputmode: "numeric" })),
        radios("format", [["n", TL.formatN], ["n-of-total", TL.formatNofT]], "n"),
        el("label", { class: "check" }, el("input", { type: "checkbox", name: "skip" }), " ", TL.skipFirst));
    },
    ready: () => state.files.length === 1,
    run: async () => [{ name: `${base(state.files[0].name)}-numbered.pdf`, bytes: await T.pageNumbers(state.files[0].bytes,
      { position: val("pos"), start: Math.max(0, parseInt(val("start"), 10) || 1), format: val("format"), ofWord: U.of, skipFirst: val("skip") }) }],
  },
  watermark: {
    accept: "application/pdf,.pdf", single: true,
    async onFiles() {
      state.files[0].pages = await T.pageCount(state.files[0].bytes); fileList();
      opts.replaceChildren(field(TL.text, el("input", { name: "text", type: "text", value: TL.textDefault, maxlength: "40" })),
        field(TL.opacity, el("input", { name: "opacity", type: "range", min: "0.08", max: "0.5", step: "0.02", value: "0.18" })));
    },
    ready: () => state.files.length === 1,
    run: async () => [{ name: `${base(state.files[0].name)}-watermark.pdf`, bytes: await T.watermark(state.files[0].bytes, { text: val("text"), opacity: +val("opacity") }) }],
  },
  sign: (() => {
    let pad, doc, preview, spot = { x: 0.55, y: 0.78 }, drawn = false;
    function setupPad() {
      pad = el("canvas", { class: "pad", width: 600, height: 200, "aria-label": TL.drawHere });
      const ctx = pad.getContext("2d", { willReadFrequently: true }); ctx.lineWidth = 3.2; ctx.lineCap = ctx.lineJoin = "round"; ctx.strokeStyle = "#111418";
      let down = false;
      const pos = (e) => { const r = pad.getBoundingClientRect(); return [(e.clientX - r.left) * (pad.width / r.width), (e.clientY - r.top) * (pad.height / r.height)]; };
      pad.addEventListener("pointerdown", (e) => { down = true; pad.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.moveTo(...pos(e)); });
      pad.addEventListener("pointermove", (e) => { if (!down) return; ctx.lineTo(...pos(e)); ctx.stroke(); drawn = true; refresh(); drawPreview(); });
      pad.addEventListener("pointerup", () => { down = false; });
      return pad;
    }
    function trimmed() {
      const ctx = pad.getContext("2d"), { data, width, height } = ctx.getImageData(0, 0, pad.width, pad.height);
      let x0 = width, y0 = height, x1 = 0, y1 = 0;
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (data[(y * width + x) * 4 + 3] > 10) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      if (x1 <= x0) return null;
      const c = el("canvas", { width: x1 - x0 + 8, height: y1 - y0 + 8 });
      c.getContext("2d").drawImage(pad, x0 - 4, y0 - 4, c.width, c.height, 0, 0, c.width, c.height);
      return c;
    }
    async function drawPreview() {
      if (!doc) return;
      const n = +val("page") || 1;
      const { canvas } = await render(doc, n, 0.9);
      const sig = drawn && trimmed();
      if (sig) { const w = canvas.width * +val("sigsize"); canvas.getContext("2d").drawImage(sig, canvas.width * spot.x, canvas.height * spot.y, w, (sig.height / sig.width) * w); }
      preview.replaceChildren(canvas);
    }
    return {
      accept: "application/pdf,.pdf", single: true,
      async onFiles() {
        doc = await openDoc(state.files[0].bytes);
        state.files[0].pages = doc.numPages; fileList();
        preview = el("div", { class: "sigpreview", title: TL.clickPlace });
        preview.addEventListener("click", (e) => { const r = preview.firstChild.getBoundingClientRect(); spot = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; drawPreview(); });
        const pages = Array.from({ length: doc.numPages }, (_, i) => [String(i + 1), `${TL.pageLabel} ${i + 1}`]);
        opts.replaceChildren(el("div", { class: "padwrap" }, el("p", { class: "hint", text: TL.drawHere }), setupPad(),
          el("button", { type: "button", class: "btn btn-outline", onclick: () => { pad.getContext("2d").clearRect(0, 0, pad.width, pad.height); drawn = false; refresh(); drawPreview(); }, text: TL.clear })),
          field(TL.pageLabel, Object.assign(select("page", pages, String(doc.numPages)), { onchange: drawPreview })),
          field(TL.sizeLabel, Object.assign(el("input", { name: "sigsize", type: "range", min: "0.12", max: "0.5", step: "0.02", value: "0.28" }), { oninput: drawPreview })),
          el("p", { class: "hint", text: TL.clickPlace }), preview);
        drawPreview();
      },
      reset() { doc = null; drawn = false; opts.replaceChildren(); },
      ready: () => state.files.length === 1 && drawn,
      async run() {
        const sig = trimmed();
        if (!sig) throw new T.ToolError("empty");
        const png = await blobBytes(await canvasBlob(sig, "image/png"));
        return [{ name: `${base(state.files[0].name)}-signed.pdf`, bytes: await T.stampImage(state.files[0].bytes, { png, pageIndex: +val("page") - 1, x: spot.x, y: spot.y, width: +val("sigsize") }) }];
      },
    };
  })(),
  ocr: {
    accept: "application/pdf,.pdf,image/*", multiple: true, images: true,
    async onFiles() {
      fileList();
      if (!opts.children.length) opts.replaceChildren(field(TL.language, select("lang", OCR_LANGS, OCR_DEFAULT[S.lang] || "eng")));
    },
    ready: () => state.files.length >= 1,
    async run(progress) {
      const Tess = (await import("./vendor/tesseract.esm.min.js")).default;
      const worker = await Tess.createWorker(val("lang"), 1, { workerPath: VENDOR + "tesseract-worker.min.js", corePath: VENDOR + "tesseract-core/" });
      try {
        const sources = [];
        for (const f of state.files) {
          if (isPdf(f)) { const d = await openDoc(f.bytes); for (let i = 1; i <= d.numPages; i++) sources.push(() => render(d, i, 2).then((r) => r.canvas)); }
          else sources.push(async () => { const bmp = await createImageBitmap(f.file); const c = el("canvas", { width: bmp.width, height: bmp.height }); c.getContext("2d").drawImage(bmp, 0, 0); return c; });
        }
        const pdfs = [], texts = [];
        for (let i = 0; i < sources.length; i++) {
          progress(i + 1, sources.length);
          const c = await sources[i]();
          const { data } = await worker.recognize(c, {}, { text: true, pdf: true });
          texts.push(data.text.trim());
          pdfs.push(Uint8Array.from(data.pdf));
          c.width = c.height = 0;
        }
        const text = texts.join("\n\n");
        const name = state.files.length === 1 ? base(state.files[0].name) : "ocr";
        const out = [{ name: `${name}-searchable.pdf`, bytes: await T.concat(pdfs) }, { name: `${name}.txt`, type: "text/plain", bytes: new TextEncoder().encode(text) }];
        out.text = text;
        return out;
      } finally {
        await worker.terminate();
      }
    },
  },
};

const TOOL = TOOLS[ID];

// ---------- wire up ----------
dropZone({ multiple: !!TOOL.multiple, accept: TOOL.accept, onFiles: (fs) => addFiles(fs, { pdf: TOOL.pdf !== false, images: !!TOOL.images, single: !!TOOL.single }).catch(fail) });
runBtn.addEventListener("click", async () => {
  status.classList.remove("err");
  setBusy(true);
  const progress = (i, n) => { status.textContent = `${U.working} ${U.page.toLowerCase()} ${i} ${U.of} ${n}`; };
  try {
    const r = await TOOL.run(progress);
    setBusy(false);
    const files = Array.isArray(r) ? r : r.files;
    if (!files.length) { results.replaceChildren(el("p", { class: "note", text: r.note })); return; }
    showResults(files, r.note || "");
    if (r.text != null) {
      const ta = el("textarea", { class: "ocrtext", readonly: true, "aria-label": TL.textResult }); ta.value = r.text;
      const copy = el("button", { type: "button", class: "btn btn-outline", text: TL.copy, onclick: async () => { await navigator.clipboard.writeText(r.text); copy.textContent = TL.copied; } });
      results.append(el("h3", { text: TL.textResult }), ta, copy);
    }
  } catch (e) { fail(e); }
});
bench.replaceChildren(zone, list, opts, el("div", { class: "runrow" }, runBtn, status), results);
refresh();
window.__pdfReady = true; // used by the browser tests
