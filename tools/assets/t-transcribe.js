// Transcribe audio or video to text with Whisper, in a worker on this device.
import { extractAudio } from "./ff.js";

const LANGS = [["english", "English"], ["danish", "Dansk"], ["german", "Deutsch"], ["swedish", "Svenska"], ["norwegian", "Norsk"], ["dutch", "Nederlands"], ["spanish", "Español"], ["french", "Français"], ["italian", "Italiano"], ["portuguese", "Português"], ["polish", "Polski"], ["finnish", "Suomi"]];
const SR = 16000;

export function make(sh) {
  const { S, U, TL, state, opts, el, field, select, val, fmtSize, base, isPhone, ToolError, CancelError } = sh;
  const isAudio = (f) => /^audio\//.test(f.type) || /\.(mp3|m4a|aac|wav|flac|ogg|opus|wma|aiff?)$/i.test(f.name);
  const isVideo = (f) => /^video\//.test(f.type) || /\.(mp4|mov|m4v|webm|mkv|avi|mpe?g|3gp|ts)$/i.test(f.name);
  const hms = (t, sep) => { const ms = Math.round(t * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}${sep}${String(ms % 1000).padStart(3, "0")}`; };
  const hasGpu = () => !!navigator.gpu;

  async function decode(ctx, file) {
    if (isAudio(file) && file.size < 250 * 1024 * 1024) {
      try {
        const buf = await file.arrayBuffer();
        const ac = new OfflineAudioContext(1, 1, SR);
        const ab = await ac.decodeAudioData(buf);
        const out = new Float32Array(ab.length), n = ab.numberOfChannels;
        for (let c = 0; c < n; c++) { const d = ab.getChannelData(c); for (let i = 0; i < d.length; i++) out[i] += d[i] / n; }
        return out;
      } catch (e) { /* the browser cannot decode this format: ffmpeg below can */ }
    }
    if (ctx.cancelled) throw new CancelError();
    ctx.progress(null, U.loadingEngine);
    return extractAudio(ctx, file, (x) => ctx.progress(x, `${TL.readingAudio} ${Math.round(x * 100)}%`));
  }

  function clean(chunks, audio, duration) {
    const out = [];
    for (const c of chunks) {
      const text = (c.text || "").trim();
      if (!text || /^\[.*\]$|^\(.*\)$/.test(text)) continue;
      const start = c.timestamp?.[0] ?? 0;
      const end = c.timestamp?.[1] ?? Math.min(duration, start + 8);
      const a = audio.subarray(Math.floor(start * SR), Math.floor(end * SR));
      let e = 0; for (let i = 0; i < a.length; i += 8) e += a[i] * a[i];
      const rms = Math.sqrt(e / Math.max(1, a.length / 8));
      if (rms < 0.004) continue; // Whisper invents text over silence; drop it
      out.push({ start, end, text });
    }
    return out;
  }
  const toText = (segs) => {
    let s = "", last = 0;
    for (const c of segs) { if (s) s += c.start - last > 2 ? "\n\n" : " "; s += c.text; last = c.end; }
    return s;
  };
  function wrap(text) { // two lines of at most 42 characters, the subtitle convention
    const words = text.split(/\s+/), lines = [""];
    for (const w of words) { const l = lines[lines.length - 1]; if ((l + " " + w).trim().length > 42 && l) lines.push(w); else lines[lines.length - 1] = (l + " " + w).trim(); }
    return lines;
  }
  function toSrt(segs) {
    const cues = [];
    for (const c of segs) {
      const lines = wrap(c.text), parts = [];
      for (let i = 0; i < lines.length; i += 2) parts.push(lines.slice(i, i + 2));
      const total = lines.join(" ").length || 1, dur = Math.max(0.5, c.end - c.start);
      let t = c.start;
      for (const p of parts) { const end = t + dur * (p.join(" ").length / total); cues.push({ start: t, end, text: p.join("\n") }); t = end; }
    }
    return cues.map((c, i) => `${i + 1}\n${hms(c.start, ",")} --> ${hms(c.end, ",")}\n${c.text}\n`).join("\n");
  }

  return {
    accept: "audio/*,video/*,.mp3,.m4a,.wav,.flac,.ogg,.opus,.aac,.mp4,.mov,.m4v,.webm,.mkv", isOk: (f) => isAudio(f) || isVideo(f),
    tooBig: (fs) => (isPhone() && fs[0].size > 300 * 1024 * 1024 ? U.warnPhone.replace("{size}", fmtSize(fs[0].size)) : null),
    onFiles() {
      if (opts.children.length) return;
      const models = [["base", TL.modelBase], ["small", TL.modelSmall]];
      const def = isPhone() ? "base" : "small";
      opts.replaceChildren(
        field(TL.language, select("lang", LANGS, S.lang === "da" ? "danish" : "english")),
        field(TL.accuracy, select("model", models, def), TL.modelHint));
      // The most accurate model needs a graphics chip with 16-bit float support; only offer it where it can run.
      if (hasGpu() && !isPhone()) navigator.gpu.requestAdapter().then((a) => {
        const sel = opts.querySelector('[name="model"]');
        if (a?.features.has("shader-f16") && sel) {
          sel.append(el("option", { value: "turbo", text: TL.modelTurbo }));
          if (S.lang === "da") sel.value = "turbo"; // Danish needs the larger model: Standard makes far more mistakes
        }
      }).catch(() => {});
    },
    reset() { opts.replaceChildren(); },
    ready: () => state.files.length === 1,
    run: (ctx) => new Promise(async (resolve, reject) => {
      const f = state.files[0];
      let worker;
      ctx.onCancel(() => { worker?.terminate(); reject(new CancelError()); });
      try {
        ctx.progress(null, TL.readingAudio);
        const audio = await decode(ctx, f);
        if (ctx.cancelled) return;
        if (audio.length < SR / 4) throw new ToolError("noAudio");
        const duration = audio.length / SR;
        const live = el("div", { class: "live" });
        state.live = live;
        const started = performance.now();
        worker = new Worker(new URL("./transcribe.worker.js", import.meta.url), { type: "module" });
        const keep = audio.slice(); // the worker gets its own copy; this one checks silence afterwards
        const forceWasm = /[?&]device=wasm/.test(location.search);
        document.querySelector(".results").replaceChildren(live);
        worker.onmessage = ({ data: m }) => {
          if (m.type === "loading") ctx.progress(m.frac, m.frac == null ? TL.preparing : `${TL.downloadingModel} ${Math.round(m.frac * 100)}%`);
          else if (m.type === "ready") ctx.progress(0, TL.preparing);
          else if (m.type === "chunk") { ctx.progress(m.done / m.total, `${TL.transcribing} ${Math.round((m.done / m.total) * 100)}%`); if (m.text) { live.textContent = m.text; live.scrollTop = live.scrollHeight; } }
          else if (m.type === "error") { worker.terminate(); reject(new ToolError(m.code || "generic", m.detail)); }
          else if (m.type === "done") {
            worker.terminate();
            const segs = clean(m.chunks, keep, duration), text = toText(segs);
            if (!text.trim()) { reject(new ToolError("noSpeech")); return; }
            const name = base(f.name);
            const ta = el("textarea", { class: "ocrtext", readonly: true, "aria-label": TL.textResult }); ta.value = text;
            const copy = el("button", { type: "button", class: "btn btn-outline", text: TL.copy, onclick: async () => { await navigator.clipboard.writeText(text); copy.textContent = TL.copied; } });
            const secs = Math.max(1, Math.round((performance.now() - started) / 1000));
            const took = secs < 90 ? `${secs} s` : `${Math.round(secs / 60)} min`;
            const note = TL.finished.replace("{time}", took).replace("{engine}", m.device === "webgpu" ? TL.onGpu : TL.onCpu);
            resolve({ note, extra: el("div", {}, ta, el("div", { class: "ractions" }, copy)), files: [
              { name: `${name}.txt`, blob: new Blob([text], { type: "text/plain;charset=utf-8" }) },
              { name: `${name}.srt`, blob: new Blob([toSrt(segs)], { type: "application/x-subrip;charset=utf-8" }) }] });
          }
        };
        worker.onerror = (e) => { worker.terminate(); reject(new ToolError("memory", e.message)); };
        worker.postMessage({ audio, model: val("model"), language: val("lang"), device: forceWasm ? "wasm" : (hasGpu() ? "webgpu" : "wasm") }, [audio.buffer]);
      } catch (e) { worker?.terminate(); reject(e); }
    }),
  };
}
