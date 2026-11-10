// Compress video, video to MP3, video to GIF. All through ffmpeg.wasm on this device.
import { runFF } from "./ff.js";

export function make(sh) {
  const { U, TL, ID, state, opts, el, field, select, radios, val, fmtSize, base, isPhone, ToolError, objectUrl } = sh;
  const isVideo = (f) => /^video\//.test(f.type) || /\.(mp4|mov|m4v|webm|mkv|avi|mpe?g|3gp|wmv|ts|mts)$/i.test(f.name);
  const isMedia = (f) => isVideo(f) || /^audio\//.test(f.type) || /\.(m4a|aac|flac|wav|ogg|opus|wma|mp3)$/i.test(f.name);
  const pct = (frac, label) => `${label} ${Math.round(frac * 100)}%`;
  const phoneMB = (mb, msg) => (fs) => isPhone() && fs[0].size > mb * 1024 * 1024 ? msg.replace("{size}", fmtSize(fs[0].size)) : null;
  const scaleTo = (L) => `scale=w='if(gt(iw,ih),trunc(min(${L},iw)/2)*2,-2)':h='if(gt(iw,ih),-2,trunc(min(${L},ih)/2)*2)':flags=bicubic`;

  if (ID === "compress-video") return {
    accept: "video/*,.mp4,.mov,.m4v,.webm,.mkv,.avi", isOk: isVideo,
    tooBig: phoneMB(400, U.warnPhone),
    onFiles() {
      if (!opts.children.length) opts.replaceChildren(
        field(TL.quality, select("level", [["small", TL.levelSmall], ["balanced", TL.levelBalanced], ["high", TL.levelHigh]], "balanced")),
        field(TL.resolution, select("res", [["1080", "1080p"], ["720", "720p"], ["480", "480p"]], "720"), TL.resolutionHint),
        el("label", { class: "check" }, el("input", { type: "checkbox", name: "mute" }), " ", TL.mute));
    },
    reset() { opts.replaceChildren(); },
    ready: () => state.files.length === 1,
    async run(ctx) {
      const f = state.files[0], crf = { small: 30, balanced: 26, high: 22 }[val("level")], L = val("res"), mute = val("mute");
      ctx.progress(null, U.loadingEngine);
      const blob = await runFF(ctx, f, (i) => ["-i", i, "-map", "0:v:0", ...(mute ? [] : ["-map", "0:a:0?"]), "-vf", scaleTo(L), "-c:v", "libx264", "-preset", "veryfast", "-crf", String(crf), "-pix_fmt", "yuv420p",
        ...(mute ? ["-an"] : ["-c:a", "aac", "-b:a", "128k"]), "-movflags", "+faststart", "out.mp4"],
      "out.mp4", "video/mp4", { U, onFrac: (x) => ctx.progress(x, pct(x, U.processing)) });
      if (blob.size >= f.size * 0.98) return { files: [], note: TL.notSmaller, extra: null };
      return { note: `${U.size}: ${fmtSize(f.size)} ${U.before} → ${fmtSize(blob.size)} ${U.after}`,
        extra: el("div", { class: "preview" }, el("video", { src: objectUrl(blob), controls: true, preload: "metadata", playsinline: true })),
        files: [{ name: `${base(f.name)}-compressed.mp4`, blob }] };
    },
  };

  if (ID === "video-to-mp3") return {
    accept: "video/*,audio/*,.mp4,.mov,.m4v,.webm,.mkv,.avi,.m4a,.wav,.flac,.ogg", isOk: isMedia,
    tooBig: phoneMB(1200, U.warnPhone),
    onFiles() { if (!opts.children.length) opts.replaceChildren(field(TL.quality, select("kbps", [["128", TL.q128], ["192", TL.q192], ["320", TL.q320]], "192"))); },
    reset() { opts.replaceChildren(); },
    ready: () => state.files.length === 1,
    async run(ctx) {
      const f = state.files[0], kbps = val("kbps");
      ctx.progress(null, U.loadingEngine);
      const blob = await runFF(ctx, f, (i) => ["-i", i, "-vn", "-map", "0:a:0", "-c:a", "libmp3lame", "-b:a", `${kbps}k`, "-ar", "44100", "out.mp3"], "out.mp3", "audio/mpeg", { U, onFrac: (x) => ctx.progress(x, pct(x, U.processing)) });
      return { extra: el("div", { class: "preview" }, el("audio", { src: objectUrl(blob), controls: true, preload: "metadata" })), files: [{ name: `${base(f.name)}.mp3`, blob }] };
    },
  };

  if (ID === "video-to-gif") return {
    accept: "video/*,.mp4,.mov,.m4v,.webm,.mkv,.avi", isOk: isVideo,
    tooBig: phoneMB(250, U.warnPhone),
    onFiles() {
      if (!opts.children.length) opts.replaceChildren(el("div", { class: "twofields" },
        field(TL.start, el("input", { name: "start", type: "number", min: "0", step: "0.5", value: "0", inputmode: "decimal" })),
        field(TL.length, el("input", { name: "length", type: "number", min: "0.5", step: "0.5", max: "60", value: "6", inputmode: "decimal" }))),
        field(TL.width, select("width", [["320", TL.w320], ["480", TL.w480], ["640", TL.w640]], "480")),
        field(TL.fps, select("fps", [["8", "8"], ["12", "12"], ["15", "15"], ["20", "20"]], "12")));
    },
    reset() { opts.replaceChildren(); },
    ready: () => state.files.length === 1,
    async run(ctx) {
      const f = state.files[0], start = Math.max(0, +val("start") || 0), len = Math.min(60, Math.max(0.5, +val("length") || 6)), w = val("width"), fps = val("fps");
      ctx.progress(null, U.loadingEngine);
      const vf = `fps=${fps},scale=${w}:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=200:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`;
      const blob = await runFF(ctx, f, (i) => ["-ss", String(start), "-t", String(len), "-i", i, "-filter_complex", vf, "-loop", "0", "out.gif"], "out.gif", "image/gif", { U, knownDuration: len, onFrac: (x) => ctx.progress(x, pct(x, U.processing)) });
      return { extra: el("div", { class: "preview" }, el("img", { src: objectUrl(blob), alt: TL.previewAlt })), files: [{ name: `${base(f.name)}.gif`, blob }] };
    },
  };
  throw new Error("unknown video tool " + ID);
}
