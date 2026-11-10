// HEIC to JPG, compress images, resize images. Each file is decoded and encoded in a worker, one at a time.
export function make(sh) {
  const { U, TL, ID, state, opts, el, field, select, val, fmtSize, base, isPhone, ToolError, CancelError } = sh;
  const isHeic = (f) => /image\/hei[cf]/.test(f.type) || /\.(heic|heif)$/i.test(f.name);
  const isImage = (f) => isHeic(f) || /^image\/(jpeg|png|webp|bmp|avif)/.test(f.type) || /\.(jpe?g|png|webp|bmp|avif)$/i.test(f.name);

  function batch(ctx, job, naming) {
    const files = state.files.slice();
    return new Promise((resolve, reject) => {
      const w = new Worker(new URL("./images.worker.js", import.meta.url), { type: "module" });
      const out = []; let i = 0, skipped = 0;
      ctx.onCancel(() => { w.terminate(); reject(new CancelError()); });
      const send = () => {
        if (i >= files.length) { w.terminate(); resolve({ out, skipped }); return; }
        ctx.progress(i / files.length, `${U.processing} ${i + 1} ${U.of} ${files.length}`);
        w.postMessage({ file: files[i], job });
      };
      w.onmessage = ({ data }) => {
        const f = files[i++];
        if (data.error) { if (files.length === 1) { w.terminate(); reject(new ToolError(data.error)); return; } skipped++; }
        else out.push({ name: naming(f, data.ext), blob: data.blob, inSize: f.size, kept: data.kept });
        send();
      };
      w.onerror = (e) => { w.terminate(); reject(new ToolError("memory", e.message)); };
      send();
    });
  }
  const phoneTotal = (mb, n) => (fs) => {
    const total = fs.reduce((s, f) => s + f.size, 0);
    return isPhone() && (total > mb * 1024 * 1024 || fs.length > n) ? U.warnPhone.replace("{size}", `${fs.length} / ${fmtSize(total)}`) : null;
  };
  const summary = (r) => {
    const a = r.out.reduce((s, f) => s + f.inSize, 0), b = r.out.reduce((s, f) => s + f.blob.size, 0);
    let note = r.out.length ? `${U.size}: ${fmtSize(a)} ${U.before} → ${fmtSize(b)} ${U.after}` : "";
    if (r.out.some((f) => f.kept)) note += ` ${TL.keptNote}`;
    if (r.skipped) note += ` ${U.err.skippedN.replace("{n}", r.skipped)}`;
    return note;
  };
  const common = { multiple: true, ready: () => state.files.length >= 1, reset() { opts.replaceChildren(); } };

  if (ID === "heic") return { ...common,
    accept: ".heic,.heif,image/heic,image/heif", isOk: isHeic, tooBig: phoneTotal(250, 40),
    onFiles() { if (!opts.children.length) opts.replaceChildren(field(TL.quality, select("q", [["0.95", TL.qMax], ["0.9", TL.qHigh], ["0.8", TL.qMed]], "0.9"))); },
    async run(ctx) {
      const r = await batch(ctx, { kind: "heic", quality: +val("q") }, (f) => `${base(f.name)}.jpg`);
      if (!r.out.length) throw new ToolError("unreadable");
      return { files: r.out, note: r.skipped ? U.err.skippedN.replace("{n}", r.skipped) : "" };
    },
  };
  if (ID === "compress-images") return { ...common,
    accept: "image/jpeg,image/png,image/webp,image/bmp,.heic,.heif", isOk: isImage, tooBig: phoneTotal(300, 60),
    onFiles() {
      if (!opts.children.length) opts.replaceChildren(
        field(TL.quality, select("q", [["0.85", TL.qHigh], ["0.72", TL.qMed], ["0.55", TL.qLow]], "0.72")),
        field(TL.maxSide, select("max", [["0", TL.keepSize], ["2560", "2560 px"], ["1920", "1920 px"], ["1280", "1280 px"], ["800", "800 px"]], "0"), TL.maxSideHint),
        field(TL.format, select("fmt", [["keep", TL.fmtKeep], ["webp", TL.fmtWebp]], "keep")));
    },
    async run(ctx) {
      const r = await batch(ctx, { kind: "compress", quality: +val("q"), maxSide: +val("max"), format: val("fmt") }, (f, ext) => `${base(f.name)}-compressed.${ext}`);
      if (!r.out.length) throw new ToolError("unreadable");
      return { files: r.out, note: summary(r) };
    },
  };
  if (ID === "resize-images") return { ...common,
    accept: "image/jpeg,image/png,image/webp,image/bmp,.heic,.heif", isOk: isImage, tooBig: phoneTotal(300, 60),
    onFiles() {
      if (opts.children.length) return;
      const fieldsW = field(TL.width, el("input", { name: "w", type: "number", min: "1", max: "12000", value: "1600", inputmode: "numeric" }));
      const fieldsH = field(TL.height, el("input", { name: "h", type: "number", min: "1", max: "12000", placeholder: TL.auto, inputmode: "numeric" }));
      const pctField = field(TL.percent, el("input", { name: "pct", type: "number", min: "1", max: "400", value: "50", inputmode: "numeric" }));
      const dims = el("div", { class: "twofields" }, fieldsW, fieldsH);
      const fit = field(TL.fit, select("fit", [["keep", TL.fitKeep], ["crop", TL.fitCrop], ["stretch", TL.fitStretch]], "keep"), TL.fitHint);
      const mode = select("mode", [["size", TL.modeSize], ["percent", TL.modePercent]], "size");
      const sync = () => { const p = mode.value === "percent"; dims.hidden = p; fit.hidden = p; pctField.hidden = !p; };
      mode.addEventListener("change", sync);
      opts.replaceChildren(field(TL.mode, mode), dims, pctField, fit, field(TL.format, select("fmt", [["keep", TL.fmtSame], ["jpg", "JPG"], ["png", "PNG"], ["webp", "WebP"]], "keep")));
      sync();
    },
    async run(ctx) {
      const mode = val("mode");
      const w = Math.round(+val("w")) || 0, h = Math.round(+val("h")) || 0, pct = +val("pct") || 0;
      if (mode === "size" && !w && !h || mode === "percent" && !pct) throw new ToolError("needSize");
      const r = await batch(ctx, { kind: "resize", mode, w, h, pct, fit: val("fit"), format: val("fmt"), quality: 0.9 }, (f, ext) => `${base(f.name)}-resized.${ext}`);
      if (!r.out.length) throw new ToolError("unreadable");
      return { files: r.out, note: r.skipped ? U.err.skippedN.replace("{n}", r.skipped) : "" };
    },
  };
  throw new Error("unknown image tool " + ID);
}
