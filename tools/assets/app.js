// Webspind tools: the in-browser workbench shared by every tool page. Files stay on this device.
import { zip } from "./zip.js";
import { ToolError, CancelError } from "./err.js";

const S = JSON.parse(document.getElementById("strings").textContent);
const U = S.ui, TL = S.tool, ID = S.id;
const bench = document.getElementById("bench");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function el(tag, attrs = {}, ...kids) {
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
export const fmtSize = (n) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : n < 1024 ** 3 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${(n / 1024 ** 3).toFixed(2)} GB`);
export const base = (name) => name.replace(/\.[^.]+$/, "");
export const field = (label, input, hint) => el("label", { class: "field" }, el("span", { text: label }), input, hint ? el("small", { text: hint }) : null);
export const select = (name, pairs, value) => el("select", { name }, ...pairs.map(([v, t]) => el("option", { value: v, selected: v === value, text: t })));
export const radios = (name, pairs, value) => el("div", { class: "radios", role: "radiogroup" }, ...pairs.map(([v, t]) => el("label", {}, el("input", { type: "radio", name, value: v, checked: v === value }), " ", t)));
export const isPhone = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

const state = { files: [], urls: [], ack: false, running: false };
const zone = el("div", { class: "zone" });
const list = el("div", { class: "flist" });
const opts = el("div", { class: "opts" });
const runBtn = el("button", { class: "btn run", type: "button", text: TL.button || U.run });
const cancelBtn = el("button", { class: "btn btn-outline", type: "button", text: U.cancel, hidden: true });
const warn = el("p", { class: "warn", hidden: true });
const status = el("p", { class: "status", role: "status" });
const bar = el("progress", { class: "progress", max: "1", "aria-hidden": "true" });
const barWrap = el("div", { class: "progresswrap", hidden: true }, bar);
const results = el("div", { class: "results" });

export const val = (name) => { const e = opts.querySelector(`[name="${name}"]`); if (!e) return null; if (e.type === "radio") return opts.querySelector(`[name="${name}"]:checked`).value; if (e.type === "checkbox") return e.checked; return e.value; };

// Leaving during a long job loses it, so the browser asks first.
const guardLeave = (e) => { e.preventDefault(); e.returnValue = ""; };
function setBusy(on) {
  state.running = on;
  if (on) addEventListener("beforeunload", guardLeave); else removeEventListener("beforeunload", guardLeave);
  runBtn.hidden = on || !TOOL.ready();
  cancelBtn.hidden = !on;
  barWrap.hidden = !on;
  bench.classList.toggle("busy", on);
  zone.querySelector("input").disabled = on;
  list.querySelectorAll("button").forEach((b) => (b.disabled = on));
  opts.querySelectorAll("input, select").forEach((i) => (i.disabled = on));
}
function setStatus(text, err = false) { status.textContent = text; status.classList.toggle("err", err); }
function errorText(e) {
  if (e && e.code === "cancelled") return U.stopped;
  console.error(e);
  return (e && e.code && U.err[e.code]) || U.err.generic;
}
function refresh() {
  if (state.running) return;
  runBtn.hidden = !TOOL.ready();
  opts.hidden = !state.files.length;
}
function clearResults() { state.urls.forEach((u) => URL.revokeObjectURL(u)); state.urls = []; results.replaceChildren(); }
function clearWarning() { state.ack = false; warn.hidden = true; runBtn.textContent = TL.button || U.run; }
export function objectUrl(blob) { const u = URL.createObjectURL(blob); state.urls.push(u); return u; }

function reset() { clearResults(); state.files = []; list.replaceChildren(); setStatus(""); clearWarning(); TOOL.reset?.(); opts.hidden = true; refresh(); }

function renderList() {
  list.replaceChildren(...state.files.map((f, i) => el("div", { class: "frow" },
    el("span", { class: "fname", text: f.name }), el("span", { class: "fmeta", text: fmtSize(f.size) }),
    el("button", { type: "button", class: "ib", title: U.remove, "aria-label": `${U.remove}: ${f.name}`, onclick: () => { state.files.splice(i, 1); renderList(); clearWarning(); TOOL.onFiles?.(); refresh(); }, text: "×" }))));
}
function addFiles(files) {
  if (state.running) return;
  const ok = files.filter(TOOL.isOk);
  if (!ok.length) { setStatus(U.err.wrongType, true); return; }
  setStatus(ok.length < files.length ? U.err.someSkipped : "");
  state.files = TOOL.multiple ? state.files.concat(ok) : ok.slice(0, 1);
  clearResults(); clearWarning();
  renderList();
  TOOL.onFiles?.();
  refresh();
}
function dropZone() {
  const input = el("input", { type: "file", accept: TOOL.accept, multiple: !!TOOL.multiple, class: "sr", id: "file", "aria-label": TOOL.multiple ? U.choose : U.chooseOne });
  input.addEventListener("change", () => { addFiles([...input.files]); input.value = ""; });
  const label = el("label", { for: "file", class: "zlabel" },
    el("span", { class: "zclip", "aria-hidden": "true" }),
    el("span", { class: "ztext" }, TOOL.multiple ? U.drop : U.dropOne, " ", el("u", { text: TOOL.multiple ? U.choose : U.chooseOne })));
  zone.replaceChildren(input, label);
  ["dragenter", "dragover"].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.add("over"); }));
  ["dragleave", "drop"].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.remove("over"); }));
  zone.addEventListener("drop", (e) => addFiles([...e.dataTransfer.files]));
}

function saveAnchor(name, blob, cls = "btn dl") { return el("a", { class: cls, href: objectUrl(blob), download: name, text: U.download }); }
function showResults(r) {
  const files = r.files || [];
  const rows = files.map((f) => el("div", { class: "res" }, el("span", { class: "rname", text: f.name }), el("span", { class: "rsize", text: fmtSize(f.blob.size) }), saveAnchor(f.name, f.blob)));
  const actions = [];
  if (files.length > 1) {
    const b = el("button", { class: "btn btn-outline", type: "button", text: U.downloadAll, onclick: async () => {
      b.disabled = true; b.textContent = U.zipping;
      try {
        const items = [];
        for (const f of files) items.push({ name: f.name, bytes: new Uint8Array(await f.blob.arrayBuffer()) });
        const a = el("a", { href: objectUrl(new Blob([zip(uniqueNames(items))], { type: "application/zip" })), download: `${ID}.zip` });
        a.click();
      } catch (e) { setStatus(U.err.memory, true); console.error(e); }
      b.disabled = false; b.textContent = U.downloadAll;
    } });
    actions.push(b);
  }
  actions.push(el("button", { class: "btn btn-outline", type: "button", onclick: reset, text: U.again }));
  results.replaceChildren(el("h2", { text: U.done }), r.note ? el("p", { class: "note", text: r.note }) : "", r.extra || "", ...rows, el("div", { class: "ractions" }, ...actions));
  results.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
}
function uniqueNames(items) {
  const seen = new Map();
  for (const it of items) {
    const n = seen.get(it.name) || 0;
    seen.set(it.name, n + 1);
    if (n) it.name = it.name.replace(/(\.[^.]+)?$/, ` (${n})$1`);
  }
  return items;
}

// Throttled so a screen reader announces the stage, not every percent.
let lastAnnounced = 0;
function progress(frac, text) {
  if (frac == null) bar.removeAttribute("value"); else bar.value = Math.min(1, Math.max(0, frac));
  const now = performance.now();
  if (text != null && (now - lastAnnounced > 800 || frac == null || frac >= 1)) { lastAnnounced = now; setStatus(text); }
}

async function run() {
  const tooBig = TOOL.tooBig?.(state.files);
  if (tooBig && !state.ack) { state.ack = true; warn.textContent = tooBig; warn.hidden = false; runBtn.textContent = U.tryAnyway; return; }
  warn.hidden = true;
  clearResults();
  const ctx = { cancelled: false, handlers: [], onCancel(fn) { this.handlers.push(fn); }, progress, };
  state.ctx = ctx;
  cancelBtn.onclick = () => { ctx.cancelled = true; setStatus(U.stopping); ctx.handlers.forEach((f) => { try { f(); } catch (e) { /* already stopped */ } }); };
  setStatus(U.working); setBusy(true);
  try {
    const r = await Promise.race([TOOL.run(ctx), new Promise((_, rej) => ctx.onCancel(() => rej(new CancelError())))]);
    setBusy(false); setStatus(""); showResults(r);
  } catch (e) {
    setBusy(false); setStatus(errorText(e), e?.code !== "cancelled");
  } finally {
    clearWarning(); refresh();
  }
}

const shell = { S, U, TL, ID, state, opts, list, el, field, select, radios, val, fmtSize, base, isPhone, ToolError, CancelError, objectUrl, setStatus };
const GROUP = { transcribe: "t-transcribe", "compress-video": "t-video", "video-to-mp3": "t-video", "video-to-gif": "t-video", heic: "t-images", "compress-images": "t-images", "resize-images": "t-images", rembg: "t-rembg" };
const mod = await import(`./${GROUP[ID]}.js`);
const TOOL = mod.make(shell);

dropZone();
runBtn.addEventListener("click", run);
bench.replaceChildren(zone, list, opts, warn, barWrap, el("div", { class: "runrow" }, runBtn, cancelBtn, status), results);
refresh();
window.__toolReady = true; // used by the browser tests
