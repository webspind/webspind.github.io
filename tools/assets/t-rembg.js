// Remove the background from photos with U-2-Net (Apache-2.0 licence), in a worker on this device.
export function make(sh) {
  const { U, TL, state, opts, el, field, select, val, base, isPhone, ToolError, CancelError, objectUrl } = sh;
  const isImage = (f) => /image\/(jpeg|png|webp|bmp|heic|heif|avif)/.test(f.type) || /\.(jpe?g|png|webp|bmp|heic|heif)$/i.test(f.name);
  const isHeic = (f) => /image\/hei[cf]/.test(f.type) || /\.(heic|heif)$/i.test(f.name);

  async function heicToBitmap(file) { // images.worker decodes HEIC and hands back a JPG blob we can read
    const w = new Worker(new URL("./images.worker.js", import.meta.url), { type: "module" });
    return new Promise((res, rej) => {
      w.onmessage = async ({ data }) => { w.terminate(); data.error ? rej(new ToolError("unreadable")) : res(await createImageBitmap(data.blob)); };
      w.postMessage({ file, job: { kind: "heic", quality: 0.97 } });
    });
  }
  const MAX = 4096;
  return {
    multiple: false,
    accept: "image/jpeg,image/png,image/webp,image/bmp,.heic,.heif", isOk: isImage,
    tooBig: () => (isPhone() ? TL.phoneWarn : null),
    onFiles() { if (!opts.children.length) opts.replaceChildren(field(TL.background, select("bg", [["transparent", TL.bgTransparent], ["white", TL.bgWhite]], "transparent"))); },
    reset() { opts.replaceChildren(); },
    ready: () => state.files.length === 1,
    run: (ctx) => new Promise(async (resolve, reject) => {
      const f = state.files[0];
      let worker;
      ctx.onCancel(() => { worker?.terminate(); reject(new CancelError()); });
      try {
        ctx.progress(null, U.working);
        const bmp = isHeic(f) ? await heicToBitmap(f) : await createImageBitmap(f).catch(() => { throw new ToolError("unreadable"); });
        const k = Math.min(1, MAX / Math.max(bmp.width, bmp.height)), w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
        const c = new OffscreenCanvas(w, h), g = c.getContext("2d", { willReadFrequently: true });
        g.drawImage(bmp, 0, 0, w, h); bmp.close();
        const px = g.getImageData(0, 0, w, h);
        worker = new Worker(new URL("./rembg.worker.js", import.meta.url), { type: "module" });
        const bg = val("bg");
        worker.onmessage = async ({ data: m }) => {
          if (m.type === "loading") ctx.progress(m.frac, m.frac == null ? TL.preparing : `${TL.downloadingModel} ${Math.round(m.frac * 100)}%`);
          else if (m.type === "working") ctx.progress(null, TL.cutting);
          else if (m.type === "error") { worker.terminate(); reject(new ToolError(m.code || "generic", m.detail)); }
          else if (m.type === "done") {
            worker.terminate();
            const mask = new Uint8Array(m.alpha);
            for (let i = 0; i < mask.length; i++) px.data[i * 4 + 3] = mask[i];
            const out = new OffscreenCanvas(w, h), og = out.getContext("2d");
            if (bg === "white") { og.fillStyle = "#fff"; og.fillRect(0, 0, w, h); const t = new OffscreenCanvas(w, h); t.getContext("2d").putImageData(px, 0, 0); og.drawImage(t, 0, 0); }
            else og.putImageData(px, 0, 0);
            const blob = await out.convertToBlob({ type: "image/png" });
            resolve({ note: "", extra: el("div", { class: "preview checker" }, el("img", { src: objectUrl(blob), alt: TL.previewAlt })), files: [{ name: `${base(f.name)}-no-background.png`, blob }] });
          }
        };
        worker.onerror = (e) => { worker.terminate(); reject(new ToolError("memory", e.message)); };
        worker.postMessage({ rgba: px.data.buffer.slice(0), w, h });
      } catch (e) { worker?.terminate(); reject(e); }
    }),
  };
}
