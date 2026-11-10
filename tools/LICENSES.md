# Licences for /tools/

Everything listed under "Shipped with the site" is served from `tools/assets/vendor/`. Everything listed under "Fetched on
first use" is downloaded from Hugging Face by the visitor's browser, not stored in this repository. Commercial use is
allowed by every licence below.

## Shipped with the site

| Part | Exact version | Used by | Licence | Licence text |
| --- | --- | --- | --- | --- |
| @huggingface/transformers (`transformers.min.js`) | 4.3.2 | Transcribe, Remove background | Apache-2.0 | `assets/vendor/transformers/LICENSE-transformers.txt` |
| ONNX Runtime Web (`ort-wasm-simd-threaded.asyncify.*`) | 1.31.0-dev.20260914-8d85527a0 | Transcribe, Remove background | MIT | `assets/vendor/transformers/LICENSE-onnxruntime.txt` |
| @ffmpeg/ffmpeg (wrapper) | 0.12.15 | Video tools, Transcribe | MIT | `assets/vendor/ffmpeg/LICENSE-ffmpeg-wasm.txt` |
| @ffmpeg/core (FFmpeg 5.1.4 with x264 and LAME, compiled to WebAssembly) | 0.12.10 | Video tools, Transcribe | GPL-2.0-or-later | `assets/vendor/ffmpeg/core/LICENSE-GPL-2.0.txt` |
| libheif-js (libheif + libde265, compiled to WebAssembly) | 1.23.5 | HEIC to JPG, and HEIC input elsewhere | LGPL-3.0 | `assets/vendor/heif/LICENSE-libheif-js.txt`, `assets/vendor/heif/LICENSE-libheif.txt` |
| Inter (font) | as used by `/pdf/` | All pages | SIL OFL 1.1 | `assets/fonts/OFL.txt` |
| `assets/zip.js` | Webspind's own | Batch downloads | Part of this site | |

### Source code for the GPL part

`@ffmpeg/core` is GPL because it includes x264. We use it unmodified, as published on npm. The complete corresponding
source is here:

- Package as published: <https://www.npmjs.com/package/@ffmpeg/core/v/0.12.10>
- Build scripts and sources: <https://github.com/ffmpegwasm/ffmpeg.wasm> (tag `v0.12.10`)
- FFmpeg itself: <https://ffmpeg.org/download.html>
- x264: <https://code.videolan.org/videolan/x264>

The GPL lets anyone use, study, change and share this part. It applies to that program, not to the videos it makes.

### LGPL part

`libheif-js` is loaded as a separate, unmodified file (`assets/vendor/heif/libheif-bundle.mjs`), so it can be replaced
with another build of the same library. Source: <https://github.com/catdad-experiments/libheif-js> and
<https://github.com/strukturag/libheif>.

## Fetched on first use (model weights, not stored here)

| Model | Used by | Host | Licence |
| --- | --- | --- | --- |
| Whisper base, small and large-v3-turbo (OpenAI), ONNX conversions by `onnx-community` | Transcribe | huggingface.co | MIT (OpenAI Whisper code and weights) |
| U-2-Net (Qin et al.), ONNX conversion `BritishWerewolf/U-2-Net` | Remove background | huggingface.co | Apache-2.0 |

Upstream licences: <https://github.com/openai/whisper/blob/main/LICENSE> and
<https://github.com/xuebinqin/U-2-Net/blob/master/LICENSE>.

## Considered and rejected for licence reasons

- `@imgly/background-removal`: AGPL.
- RMBG-1.4 / RMBG-2.0 (BRIA): non-commercial.
- ISNet ONNX (`onnx-community/ISNet-ONNX`): tagged AGPL-3.0.

BiRefNet lite (MIT) was tried first but did not run in the browser: WebGPU hit a shader limit and the CPU build ran out
of memory at its fixed 1024 x 1024 input.
