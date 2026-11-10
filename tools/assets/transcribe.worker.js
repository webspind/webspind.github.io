// Runs Whisper (transformers.js + ONNX Runtime) in this worker. Only the model is downloaded; audio stays here.
import { pipeline, env, WhisperTextStreamer } from "./vendor/transformers/transformers.min.js";

env.allowLocalModels = false;
env.useBrowserCache = true;
const V = new URL("./vendor/transformers/", import.meta.url).href;
env.backends.onnx.wasm.wasmPaths = { mjs: V + "ort-wasm-simd-threaded.asyncify.mjs", wasm: V + "ort-wasm-simd-threaded.asyncify.wasm" };
env.backends.onnx.wasm.numThreads = 1;

const MODELS = {
  base: { id: "onnx-community/whisper-base", webgpu: { encoder_model: "q4", decoder_model_merged: "q4" }, wasm: { encoder_model: "q8", decoder_model_merged: "q8" } },
  small: { id: "onnx-community/whisper-small", webgpu: { encoder_model: "q4", decoder_model_merged: "q4" }, wasm: { encoder_model: "q8", decoder_model_merged: "q8" } },
  turbo: { id: "onnx-community/whisper-large-v3-turbo", webgpu: { encoder_model: "q4f16", decoder_model_merged: "q4f16" } },
};

async function load(model, device) {
  const m = MODELS[model], files = {};
  return pipeline("automatic-speech-recognition", m.id, {
    device, dtype: m[device],
    progress_callback: (p) => {
      if (p.status === "progress" && p.total) {
        files[p.file] = { loaded: p.loaded, total: p.total };
        const all = Object.values(files), total = all.reduce((s, f) => s + f.total, 0), loaded = all.reduce((s, f) => s + f.loaded, 0);
        self.postMessage({ type: "loading", frac: total > 5e6 ? loaded / total : null });
      } else if (p.status === "initiate" || p.status === "done") self.postMessage({ type: "loading", frac: null });
    },
  });
}

async function transcribe(asr, audio, language, sr = 16000) {
  const window = 30 * sr, stride = 5 * sr, jump = window - 2 * stride;
  let total = 1, off = 0; while (off + window < audio.length) { off += jump; total++; }
  let done = 0, text = "";
  const streamer = new WhisperTextStreamer(asr.tokenizer, {
    skip_prompt: true,
    callback_function: (t) => { text += t; },
  });
  // One generate() call per 30-second window, so counting calls gives the true progress.
  const generate = asr.model.generate.bind(asr.model);
  asr.model.generate = async (...args) => {
    const r = await generate(...args);
    done++;
    self.postMessage({ type: "chunk", done, total, text });
    return r;
  };
  self.postMessage({ type: "chunk", done: 0, total, text: "" });
  return asr(audio, { chunk_length_s: 30, stride_length_s: 5, return_timestamps: true, language, task: "transcribe", streamer });
}

self.onmessage = async ({ data: { audio, model, language, device } }) => {
  const order = device === "webgpu" && MODELS[model].webgpu ? ["webgpu", "wasm"] : ["wasm"];
  for (const dev of order) {
    try {
      const asr = await load(MODELS[model][dev] ? model : "small", dev); // the largest model has no CPU build
      self.postMessage({ type: "ready" });
      const out = await transcribe(asr, audio, language);
      self.postMessage({ type: "done", text: out.text, chunks: out.chunks, device: dev });
      return;
    } catch (e) {
      console.error(dev, e);
      if (dev === order[order.length - 1]) {
        const m = String(e?.message || e);
        self.postMessage({ type: "error", code: /fetch|network|load/i.test(m) ? "modelDownload" : /memory|alloc/i.test(m) ? "memory" : "generic", detail: m });
      }
    }
  }
};
