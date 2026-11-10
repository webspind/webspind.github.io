// Background removal with U-2-Net (Apache-2.0 licence), running on the CPU in this worker. Only the model is downloaded.
import { AutoModel, Tensor, env } from "./vendor/transformers/transformers.min.js";

env.allowLocalModels = false;
env.useBrowserCache = true;
const V = new URL("./vendor/transformers/", import.meta.url).href;
env.backends.onnx.wasm.wasmPaths = { mjs: V + "ort-wasm-simd-threaded.asyncify.mjs", wasm: V + "ort-wasm-simd-threaded.asyncify.wasm" };
env.backends.onnx.wasm.numThreads = 1;

const MODEL = "BritishWerewolf/U-2-Net";
const SIZE = 320;

self.onmessage = async ({ data: { rgba, w, h } }) => {
  try {
    const files = {};
    const model = await AutoModel.from_pretrained(MODEL, {
      device: "wasm", dtype: "fp32",
      progress_callback: (p) => {
        if (p.status === "progress" && p.total) {
          files[p.file] = { loaded: p.loaded, total: p.total };
          const all = Object.values(files), total = all.reduce((s, f) => s + f.total, 0), loaded = all.reduce((s, f) => s + f.loaded, 0);
          self.postMessage({ type: "loading", frac: total > 5e6 ? loaded / total : null });
        }
      },
    });
    self.postMessage({ type: "working" });

    // Scale to the model's 320 x 320 and normalise the way U-2-Net was trained.
    const src = new OffscreenCanvas(w, h);
    src.getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(rgba), w, h), 0, 0);
    const small = new OffscreenCanvas(SIZE, SIZE), sg = small.getContext("2d", { willReadFrequently: true });
    sg.imageSmoothingQuality = "high";
    sg.fillStyle = "#fff"; sg.fillRect(0, 0, SIZE, SIZE);
    sg.drawImage(src, 0, 0, SIZE, SIZE);
    const px = sg.getImageData(0, 0, SIZE, SIZE).data;
    let max = 0; for (let i = 0; i < px.length; i += 4) max = Math.max(max, px[i], px[i + 1], px[i + 2]);
    const input = new Float32Array(3 * SIZE * SIZE), mean = [0.485, 0.456, 0.406], std = [0.229, 0.224, 0.225];
    for (let i = 0; i < SIZE * SIZE; i++) for (let c = 0; c < 3; c++) input[c * SIZE * SIZE + i] = (px[i * 4 + c] / (max || 1) - mean[c]) / std[c];

    const inName = model.sessions.model.inputNames[0];
    const out = await model.sessions.model.run({ [inName]: new Tensor("float32", input, [1, 3, SIZE, SIZE]).ort_tensor });
    const d = out[model.sessions.model.outputNames[0]].data;

    // Normalise to 0..1, then upscale the mask to full size.
    let lo = Infinity, hi = -Infinity; for (let i = 0; i < d.length; i++) { if (d[i] < lo) lo = d[i]; if (d[i] > hi) hi = d[i]; }
    const m = new OffscreenCanvas(SIZE, SIZE), mg = m.getContext("2d"), mi = mg.createImageData(SIZE, SIZE);
    for (let i = 0; i < SIZE * SIZE; i++) { const v = ((d[i] - lo) / (hi - lo || 1)) * 255; mi.data[i * 4] = mi.data[i * 4 + 1] = mi.data[i * 4 + 2] = v; mi.data[i * 4 + 3] = 255; }
    mg.putImageData(mi, 0, 0);
    const full = new OffscreenCanvas(w, h), fg = full.getContext("2d", { willReadFrequently: true });
    fg.imageSmoothingQuality = "high"; fg.drawImage(m, 0, 0, w, h);
    const fd = fg.getImageData(0, 0, w, h).data, alpha = new Uint8Array(w * h);
    // A gentle curve firms up the edge without hard stair-steps.
    for (let i = 0; i < w * h; i++) { const x = fd[i * 4] / 255, y = x < 0.08 ? 0 : x > 0.92 ? 1 : (x - 0.08) / 0.84; alpha[i] = Math.round(y * 255); }
    self.postMessage({ type: "done", alpha: alpha.buffer }, [alpha.buffer]);
  } catch (e) {
    console.error(e);
    const m = String(e?.message || e);
    self.postMessage({ type: "error", code: /fetch|network|Failed to load/i.test(m) ? "modelDownload" : "memory", detail: m });
  }
};
