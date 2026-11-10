// Decodes, resizes and encodes one image at a time. Runs in a worker so the page stays responsive,
// and is terminated after the batch so its memory is returned.
let libheif;
async function decodeHeic(file) {
  if (!libheif) libheif = (await import("./vendor/heif/libheif-bundle.mjs")).default();
  const decoder = new libheif.HeifDecoder();
  const images = decoder.decode(new Uint8Array(await file.arrayBuffer()));
  if (!images.length) throw Object.assign(new Error("no image"), { code: "unreadable" });
  const img = images[0], w = img.get_width(), h = img.get_height();
  const data = await new Promise((res, rej) => img.display({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }, (d) => (d ? res(d) : rej(new Error("heif display")))));
  images.forEach((i) => i.free?.());
  const c = new OffscreenCanvas(w, h);
  c.getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(data.data.buffer, data.data.byteOffset, w * h * 4), w, h), 0, 0);
  return c;
}
const isHeic = (f) => /image\/hei[cf]/.test(f.type) || /\.(heic|heif)$/i.test(f.name);
async function decode(file) {
  try { return isHeic(file) ? await decodeHeic(file) : await createImageBitmap(file); }
  catch (e) { throw Object.assign(new Error(e.message), { code: "unreadable" }); }
}
const release = (s) => { if (s.close) s.close(); else s.width = s.height = 0; };
const isPng = (f) => f.type === "image/png" || /\.png$/i.test(f.name);
const isWebp = (f) => f.type === "image/webp" || /\.webp$/i.test(f.name);

/** Scales down in halves first, which keeps thin lines and text sharp at small sizes. */
function scale(src, w, h, crop = null) {
  let cur = src, cw = src.width, ch = src.height;
  const sx = crop ? crop.x : 0, sy = crop ? crop.y : 0, sw = crop ? crop.w : cw, sh = crop ? crop.h : ch;
  if (crop) { const c = new OffscreenCanvas(sw, sh); c.getContext("2d").drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh); cur = c; cw = sw; ch = sh; }
  while (cw / 2 >= w && ch / 2 >= h) {
    cw = Math.max(1, Math.floor(cw / 2)); ch = Math.max(1, Math.floor(ch / 2));
    const c = new OffscreenCanvas(cw, ch), g = c.getContext("2d");
    g.imageSmoothingQuality = "high"; g.drawImage(cur, 0, 0, cw, ch);
    if (cur !== src) release(cur);
    cur = c;
  }
  if (cw === w && ch === h && cur !== src) return cur;
  const c = new OffscreenCanvas(w, h), g = c.getContext("2d");
  g.imageSmoothingQuality = "high"; g.drawImage(cur, 0, 0, w, h);
  if (cur !== src) release(cur);
  return c;
}
const flatten = (src) => { // JPG has no transparency: put it on white.
  const c = new OffscreenCanvas(src.width, src.height), g = c.getContext("2d");
  g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(src, 0, 0);
  return c;
};

// ---- 8-bit palette PNG: the only way to make a PNG genuinely smaller without changing format ----
function medianCut(hist, maxColors) {
  const boxes = [hist.map((_, i) => i).filter((i) => hist[i])];
  const val = (i) => [(i >> 15) & 31, (i >> 10) & 31, (i >> 5) & 31, i & 31];
  const span = (b) => { let m = [99, 99, 99, 99], M = [0, 0, 0, 0], n = 0; for (const i of b) { const v = val(i); n += hist[i]; for (let k = 0; k < 4; k++) { if (v[k] < m[k]) m[k] = v[k]; if (v[k] > M[k]) M[k] = v[k]; } } const r = M.map((x, k) => x - m[k]); const axis = r.indexOf(Math.max(...r)); return { axis, score: r[axis] * n }; };
  while (boxes.length < maxColors) {
    let best = -1, bs = 0, ax = 0;
    boxes.forEach((b, k) => { if (b.length < 2) return; const s = span(b); if (s.score > bs) { bs = s.score; best = k; ax = s.axis; } });
    if (best < 0) break;
    const shift = [15, 10, 5, 0][ax], b = boxes[best].sort((a, c) => ((a >> shift) & 31) - ((c >> shift) & 31));
    let half = 0, n = 0; for (const i of b) n += hist[i];
    let acc = 0, cut = 1; for (let k = 0; k < b.length - 1; k++) { acc += hist[b[k]]; if (acc >= n / 2) { cut = k + 1; break; } }
    boxes.splice(best, 1, b.slice(0, cut), b.slice(cut));
  }
  return boxes;
}
function quantize(rgba, w, h, colors) {
  const hist = new Uint32Array(1 << 20), sum = new Float64Array((1 << 20) * 4);
  const idx = (r, g, b, a) => ((r >> 3) << 15) | ((g >> 3) << 10) | ((b >> 3) << 5) | (a >> 3);
  for (let i = 0; i < rgba.length; i += 4) { const k = idx(rgba[i], rgba[i + 1], rgba[i + 2], rgba[i + 3]); hist[k]++; sum[k * 4] += rgba[i]; sum[k * 4 + 1] += rgba[i + 1]; sum[k * 4 + 2] += rgba[i + 2]; sum[k * 4 + 3] += rgba[i + 3]; }
  const boxes = medianCut(Array.from(hist), colors);
  const pal = boxes.map((b) => { let n = 0, s = [0, 0, 0, 0]; for (const i of b) { n += hist[i]; for (let k = 0; k < 4; k++) s[k] += sum[i * 4 + k]; } return s.map((x) => Math.round(x / n)); });
  const cache = new Int16Array(1 << 20).fill(-1);
  const nearest = (r, g, b, a) => {
    const k = idx(r, g, b, a);
    if (cache[k] >= 0) return cache[k];
    let best = 0, bd = Infinity;
    pal.forEach((p, j) => { const d = (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - b) ** 2 + 3 * (p[3] - a) ** 2; if (d < bd) { bd = d; best = j; } });
    return (cache[k] = best);
  };
  const out = new Uint8Array(w * h);
  let err = new Float32Array((w + 2) * 3), next = new Float32Array((w + 2) * 3);
  const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0);
  for (let y = 0, i = 0; y < h; y++) {
    next.fill(0);
    for (let x = 0; x < w; x++, i += 4) {
      const a = rgba[i + 3], e = x * 3;
      const r = clamp(rgba[i] + err[e + 3]), g = clamp(rgba[i + 1] + err[e + 4]), b = clamp(rgba[i + 2] + err[e + 5]);
      const j = nearest(r, g, b, a), p = pal[j]; out[y * w + x] = j;
      if (a > 16) for (let c = 0; c < 3; c++) { const d = ([r, g, b][c] - p[c]) * 0.75; err[e + 6 + c] += d * 7 / 16; next[e + c] += d * 3 / 16; next[e + 3 + c] += d * 5 / 16; next[e + 6 + c] += d / 16; }
    }
    [err, next] = [next, err];
  }
  return { indices: out, pal };
}
const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = crcT[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const out = new Uint8Array(12 + data.length), dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc(out.subarray(4, 8 + data.length)));
  return out;
}
async function deflate(bytes) {
  const s = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate"));
  return new Uint8Array(await new Response(s).arrayBuffer());
}
async function palettePng(src, colors) {
  const c = new OffscreenCanvas(src.width, src.height), g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(src, 0, 0);
  const { data } = g.getImageData(0, 0, c.width, c.height), w = c.width, h = c.height;
  const { indices, pal } = quantize(data, w, h, colors);
  const raw = new Uint8Array((w + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w + 1)] = 0; raw.set(indices.subarray(y * w, (y + 1) * w), y * (w + 1) + 1); }
  const ihdr = new Uint8Array(13), dv = new DataView(ihdr.buffer);
  dv.setUint32(0, w); dv.setUint32(4, h); ihdr[8] = 8; ihdr[9] = 3;
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("PLTE", Uint8Array.from(pal.flatMap((p) => p.slice(0, 3))))];
  if (pal.some((p) => p[3] < 255)) parts.push(chunk("tRNS", Uint8Array.from(pal.map((p) => p[3]))));
  parts.push(chunk("IDAT", await deflate(raw)), chunk("IEND", new Uint8Array(0)));
  return new Blob(parts, { type: "image/png" });
}

async function encode(canvas, type, quality) {
  const b = await canvas.convertToBlob({ type, quality });
  return b;
}
function fitInside(w, h, maxSide) { if (!maxSide || Math.max(w, h) <= maxSide) return [w, h]; const k = maxSide / Math.max(w, h); return [Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k))]; }

async function process(file, job) {
  const src = await decode(file);
  let result, ext, kept = false;
  if (job.kind === "heic") {
    const c = flatten(src); release(src);
    return { blob: await encode(c, "image/jpeg", job.quality), ext: "jpg" };
  }
  if (job.kind === "compress") {
    const [w, h] = fitInside(src.width, src.height, job.maxSide), resized = w !== src.width || h !== src.height;
    const sized = resized ? scale(src, w, h) : src;
    if (job.format === "webp" || (job.format === "keep" && isWebp(file))) {
      const webp = await encode(sized, "image/webp", job.quality);
      if (webp.type === "image/webp") { result = webp; ext = "webp"; }
    }
    if (!result && isPng(file) && job.format === "keep") {
      const colors = job.quality >= 0.8 ? 256 : job.quality >= 0.6 ? 180 : 96;
      if (typeof CompressionStream !== "undefined") { result = await palettePng(sized, colors); ext = "png"; }
      else { result = await encode(sized, "image/png"); ext = "png"; }
    }
    if (!result) { result = await encode(flatten(sized), "image/jpeg", job.quality); ext = "jpg"; }
    if (sized !== src) release(sized);
    release(src);
    if (!resized && result.size >= file.size && !isHeic(file)) { // never hand back a bigger file
      return { blob: file.slice(0, file.size, file.type), ext: (file.name.match(/\.([^.]+)$/) || [, ext])[1], kept: true };
    }
    return { blob: result, ext };
  }
  if (job.kind === "resize") {
    let w, h, crop = null, sw = src.width, sh = src.height;
    if (job.mode === "percent") { w = Math.max(1, Math.round(sw * job.pct / 100)); h = Math.max(1, Math.round(sh * job.pct / 100)); }
    else if (job.w && job.h && job.fit === "stretch") { w = job.w; h = job.h; }
    else if (job.w && job.h && job.fit === "crop") {
      w = job.w; h = job.h;
      const k = Math.max(w / sw, h / sh), cw = Math.round(w / k), ch = Math.round(h / k);
      crop = { x: Math.floor((sw - cw) / 2), y: Math.floor((sh - ch) / 2), w: cw, h: ch };
    } else if (job.w && job.h) { const k = Math.min(job.w / sw, job.h / sh); w = Math.max(1, Math.round(sw * k)); h = Math.max(1, Math.round(sh * k)); }
    else if (job.w) { w = job.w; h = Math.max(1, Math.round(sh * job.w / sw)); }
    else { h = job.h; w = Math.max(1, Math.round(sw * job.h / sh)); }
    const c = scale(src, w, h, crop);
    const f = job.format === "keep" ? (isPng(file) ? "png" : isWebp(file) ? "webp" : "jpg") : job.format;
    let blob;
    if (f === "jpg") { blob = await encode(flatten(c), "image/jpeg", job.quality); ext = "jpg"; }
    else if (f === "webp") { blob = await encode(c, "image/webp", job.quality); ext = blob.type === "image/webp" ? "webp" : "png"; }
    else { blob = await encode(c, "image/png"); ext = "png"; }
    if (c !== src) release(c);
    release(src);
    return { blob, ext };
  }
  throw new Error("unknown job");
}

self.onmessage = async ({ data: { file, job } }) => {
  try { self.postMessage(await process(file, job)); }
  catch (e) { console.error(e); self.postMessage({ error: e.code || (/memory|allocat/i.test(e.message) ? "memory" : "unreadable") }); }
};
