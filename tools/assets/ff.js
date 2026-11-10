// ffmpeg.wasm wrapper. Runs the single-threaded core in a worker (GitHub Pages cannot send the headers
// that threaded WebAssembly needs). The input file is mounted, not copied, so big files don't fill memory.
import { FFmpeg } from "./vendor/ffmpeg/index.js";
import { CancelError, ToolError } from "./err.js";

const here = new URL("./vendor/ffmpeg/", import.meta.url).href;

/** mkArgs(inputPath) -> ffmpeg args. onTime(secondsDone) optional. */
export async function runFF(ctx, file, mkArgs, outName, mime, { U, onFrac, knownDuration, keepLog = false } = {}) {
  const ff = new FFmpeg();
  const log = [];
  let duration = knownDuration || 0;
  const ext = (file.name.match(/\.[^.]+$/) || [""])[0].toLowerCase();
  const input = new File([file], "in" + ext, { type: file.type });
  ff.on("log", ({ message }) => {
    log.push(message); if (log.length > 60) log.shift();
    const d = message.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (d && !duration) duration = +d[1] * 3600 + +d[2] * 60 + +d[3];
    const t = message.match(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (t && duration) { const s = +t[1] * 3600 + +t[2] * 60 + +t[3]; onFrac?.(Math.min(0.99, s / duration)); }
  });
  ctx.onCancel(() => { try { ff.terminate(); } catch (e) { /* gone */ } });
  try {
    await ff.load({ coreURL: here + "core/ffmpeg-core.js", wasmURL: here + "core/ffmpeg-core.wasm", classWorkerURL: here + "worker.js" });
    if (ctx.cancelled) throw new CancelError();
    await ff.createDir("/in");
    await ff.mount("WORKERFS", { files: [input] }, "/in");
    const code = await ff.exec(mkArgs(`/in/${input.name}`));
    if (code !== 0) throw classify(log.join("\n"));
    const data = await ff.readFile(outName);
    if (!data || !data.length) throw classify(log.join("\n"));
    const blob = mime ? new Blob([data], { type: mime }) : data;
    return blob;
  } catch (e) {
    if (ctx.cancelled) throw new CancelError();
    if (e instanceof ToolError) throw e;
    const m = String(e && e.message || e);
    if (/memory|abort|out of bounds|OOM|RangeError/i.test(m)) throw new ToolError("memory", m);
    throw classify(log.join("\n") + "\n" + m);
  } finally {
    try { ff.terminate(); } catch (e) { /* frees the worker and its memory */ }
  }
}

function classify(text) {
  if (/does not contain any stream|matches no streams|no audio|Output file is empty/i.test(text)) return new ToolError("noAudio", text);
  if (/Invalid data found|could not find codec|Unknown format|moov atom not found|Error opening input|Invalid argument/i.test(text)) return new ToolError("unreadable", text);
  if (/Cannot allocate|out of memory|ENOMEM|memory access/i.test(text)) return new ToolError("memory", text);
  return new ToolError("generic", text);
}

/** Mono 16 kHz float samples for Whisper, from any audio or video the engine can read. */
export async function extractAudio(ctx, file, onFrac) {
  const bytes = await runFF(ctx, file, (i) => ["-i", i, "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-c:a", "pcm_f32le", "out.raw"], "out.raw", null, { onFrac });
  return new Float32Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 4)).slice();
}
