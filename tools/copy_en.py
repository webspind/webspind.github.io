# English copy for /tools/. Keep it warm, plain and true: nothing here may claim what the code does not do.
NAV_LABEL = "Main"
NAV_TOOLS = "Tools"
NAV_PDF = "PDF tools"
LANGUAGE = "Language"
FOOT_TOOLS = "Webspind tools"
LICENCES = "Licences"
BYLINE = "Made by Webspind, a one-person studio in Denmark. © 2026"
HOW_TITLE = "How it works"
GOOD_TITLE = "Good to know"
FAQ_TITLE = "Questions"
MORE_TITLE = "More tools"
PDF_TILE_NAME = "PDF tools"
PDF_TILE_DESC = "Merge, split, compress and sign PDFs, the same way: on your device."
PRIVACY_TITLE = "Privacy"
PRIVACY_DESC = "How the Webspind tools handle your files: they stay on your device. What is downloaded, what is stored and what is not collected."

UI = {
    "skip": "Skip to the tool", "noscript": "JavaScript is needed for this tool.",
    "local": "Processed on your device. Nothing is uploaded.",
    "drop": "Drop files here or", "choose": "choose files", "dropOne": "Drop a file here or", "chooseOne": "choose a file",
    "run": "Start", "working": "Working…", "done": "Done", "download": "Download", "downloadAll": "Download all (zip)", "zipping": "Making the zip…",
    "again": "Start over", "remove": "Remove", "cancel": "Cancel", "stopping": "Stopping…", "stopped": "Stopped. Nothing was saved.",
    "tryAnyway": "Try anyway", "loadingEngine": "Getting the video engine ready…", "processing": "Working on it:", "size": "Size", "before": "before", "after": "after", "of": "of",
    "warnPhone": "This is a lot for a phone ({size}). It may run for a long time or stop because the phone runs out of memory. A computer will handle it better. You can still try.",
    "err": {
        "wrongType": "This tool can't open that type of file. Check the file and try again.",
        "someSkipped": "Some files were left out because this tool can't open that type.",
        "skippedN": "{n} file(s) could not be opened and were skipped.",
        "unreadable": "We couldn't read this file. It may be damaged, or in a format this tool doesn't know.",
        "noAudio": "We couldn't find any sound in this file.",
        "noSpeech": "We didn't hear any speech in this file. If there is speech, check that the right language is selected.",
        "memory": "Your device ran out of memory for this job. Close other tabs, or try a smaller file.",
        "modelDownload": "We couldn't download the speech model. Check your internet connection and try again. Your file was not sent anywhere.",
        "needSize": "Enter the size you want first.",
        "generic": "Something went wrong. Try again, or try a smaller file.",
    },
}

HUB = {
    "title": "Free file tools that work on your device | Webspind",
    "desc": "Transcribe audio to text, compress video, convert HEIC to JPG and remove image backgrounds in your browser. Your files are never uploaded.",
    "eyebrow": "Your files never leave your device",
    "h1": "Handy file tools that never upload your files",
    "p": "Everything happens inside your browser, on your own computer or phone. Nothing is sent to a server, so it's fine to use them with private recordings, family videos and photos.",
    "why": [
        ("No upload", "Your files are opened and changed on your own device. We never see them."),
        ("No account", "No sign-up, no email, no watermark. Open a page and use it."),
        ("Honest about limits", "Your device does the work, so very long videos take time. Each page says what to expect."),
    ],
    "faq": [
        ("Are my files uploaded anywhere?", "No. Your files are opened and processed in your browser on your own device. Two tools, transcription and background removal, download an AI model the first time you use them. That download is one way: the model comes to you, and your files stay put."),
        ("Is it really free?", "Yes. There is no account, no trial and no watermark."),
        ("Why are some tools slower than websites that upload?", "Your own device does the work instead of a rented server. That is the price of privacy, and the reason a long video can take a while."),
    ],
}

PRIVACY = """<p>The Webspind tools run in your browser. The audio, video and photos you choose are opened and processed on your own device. They are not uploaded, stored or seen by anyone.</p>
<h2>What your browser downloads</h2>
<ul>
<li>The pages and the code that does the work come from webspind.com, which is hosted on GitHub Pages. As with any website, GitHub receives the usual technical request details (such as your IP address) when your browser asks for a page. We don't get them.</li>
<li>Two tools use an AI model: Transcribe and Remove background. Each downloads its model, not your files, the first time you use it, from the public model host Hugging Face. Your browser keeps the model in its cache so the next run doesn't need the download.</li>
</ul>
<h2>What we don't do</h2>
<ul>
<li>No cookies, no analytics, no tracking and no ads.</li>
<li>No accounts and no sign-up.</li>
<li>Nothing you process is sent to us or to anyone else.</li>
</ul>
<h2>What stays on your device</h2>
<p>The models and the program files are kept in your browser's normal cache so the tools start faster next time. To remove them, clear this site's data in your browser settings. Your own files are only held in the tab's memory while you use the tool, and are gone when you press Start over or close the tab.</p>
<p>The open-source parts we use and their licences are listed in <a href="/tools/LICENSES.md">LICENSES.md</a>. Questions? Write to <a href="mailto:webspind@gmail.com">webspind@gmail.com</a>.</p>
"""

TOOLS = {
    "transcribe": {
        "name": "Transcribe to text",
        "tile": "Turn speech in audio and video into text you can copy, with subtitles.",
        "title": "Transcribe audio and video to text, free and on your device | Webspind",
        "desc": "Turn interviews, voice memos and videos into text and subtitles (SRT) in your browser. Works with English, Danish and more. Your recording is never uploaded.",
        "h1": "Transcribe audio or video to text",
        "lead": "Turn speech into text you can copy, plus subtitles. English, Danish and many other languages.",
        "local": "Your recording stays on your device. Only the speech model is downloaded.",
        "button": "Transcribe",
        "steps": [
            "Choose a recording or a video. Common formats like MP3, M4A, WAV, MP4 and MOV all work.",
            "Pick the language that is spoken, so the tool knows what to listen for.",
            "Press Transcribe. When it's done, copy the text or download it as a text file or SRT subtitles.",
        ],
        "notes": [
            "The transcription runs on your own device with Whisper, a speech-recognition model made by OpenAI. The first time you use it, your browser downloads the model, not your files, once. After that it starts from your browser's cache.",
            "How fast it goes depends on your device. It is quickest on a computer with a recent graphics chip. Without one, expect the transcription to take about as long as the recording, or longer on older machines and phones. Keep the tab open while it works.",
            "It's a good first draft, not a certified transcript. Names and unclear speech can come out wrong, and it does not tell speakers apart. Read it through if accuracy matters.",
        ],
        "faq": [
            ("Is my recording uploaded?", "No. The audio stays in your browser on your own device. The only download is the speech model, the first time you use it."),
            ("Does it work for Danish?", "Yes. Choose Dansk as the language. For Danish, use Most accurate if your computer offers it, or Standard otherwise. The Quick model makes many more mistakes in Danish."),
            ("How long can the recording be?", "Long recordings take proportionally longer and need more memory. In our test a 15-minute recording took about 5 minutes on a laptop with the Quick setting. An hour should be fine on a computer with plenty of memory. On a phone, stay under about 20 minutes."),
            ("Can I make subtitles?", "Yes. Download the SRT file, which most video editors and players can read. The tool times each line for you."),
            ("Is it free?", "Yes. No account, no minute limit and no watermark."),
        ],
        "tl": {
            "readingAudio": "Reading the sound…", "preparing": "Getting the speech model ready…", "downloadingModel": "Downloading the speech model (only the first time):", "transcribing": "Transcribing:",
            "language": "Language in the recording", "accuracy": "Accuracy",
            "modelBase": "Quick (download up to 140 MB)", "modelSmall": "Standard (download up to 300 MB)", "modelTurbo": "Most accurate (download about 560 MB)",
            "modelHint": "The model is downloaded once and kept in your browser, not your files.",
            "textResult": "Your text", "copy": "Copy the text", "copied": "Copied", "finished": "Finished in {time}, on your {engine}.", "onGpu": "graphics chip", "onCpu": "processor",
        },
    },
    "compress-video": {
        "name": "Compress video",
        "tile": "Make a video small enough to email, share or upload, without losing the picture.",
        "title": "Compress video free, without uploading it | Webspind",
        "desc": "Make MP4, MOV and other videos smaller in your browser. Your video is never uploaded. Choose the quality and resolution yourself, no sign-up, no watermark.",
        "h1": "Compress video",
        "lead": "Make a video smaller so it's easy to send, share or store. Pick how small; the rest happens on your device.",
        "button": "Compress video",
        "steps": ["Choose a video from your computer or phone.", "Pick the quality and the largest resolution you want.", "Press Compress video, watch the progress, and download the MP4."],
        "notes": [
            "Your device does the compressing, one processor core at a time, because that is what a static website like this can do in a browser. It is slower than a desktop program: as a guide, on a laptop one minute of 1080p video takes from about a minute to a few minutes to compress to 720p, depending on how much is happening in the picture.",
            "A sensible limit is files up to about 1 GB on a computer and a few hundred MB on a phone. The result is written to memory before you download it, so very large videos can run out.",
            "The result is an MP4 with H.264 video and AAC sound, which plays almost everywhere. If your video is already well compressed, the tool tells you instead of giving you a bigger file.",
        ],
        "faq": [
            ("Is my video uploaded?", "No. The video stays on your device. The engine that compresses it runs in your browser."),
            ("Why is it slower than some other sites?", "Other sites send your video to their computers. Here, your device does the work, using one processor core in the browser. It takes longer but the video never leaves you."),
            ("What's the best setting?", "Balanced at 720p suits most clips: it usually makes a phone video several times smaller and still looks good on any screen."),
            ("Can I stop it?", "Yes. Press Cancel at any time. Nothing is saved until the job is finished."),
        ],
        "tl": {
            "quality": "Quality", "levelSmall": "Smallest file", "levelBalanced": "Balanced", "levelHigh": "High quality",
            "resolution": "Largest resolution", "resolutionHint": "A video smaller than this is left at its size.", "mute": "Remove the sound",
            "notSmaller": "This video is already well compressed. Try the Smallest file setting or a lower resolution, or just keep your original.",
        },
    },
    "video-to-mp3": {
        "name": "Video to MP3",
        "tile": "Pull the sound out of a video and save it as an MP3.",
        "title": "Video to MP3 converter that doesn't upload your file | Webspind",
        "desc": "Convert MP4, MOV and other videos to MP3 in your browser. Choose the bitrate, no upload, no sign-up, no watermark.",
        "h1": "Convert video to MP3",
        "lead": "Keep just the sound from a video and save it as an MP3 you can play anywhere.",
        "button": "Make MP3",
        "steps": ["Choose a video. An audio file such as M4A or WAV works too.", "Pick a quality. 192 kbps is right for most things.", "Press Make MP3 and download the file."],
        "notes": [
            "The sound is converted on your own device, so a long video can take a while on a phone. This tool is the quickest of the video tools because it doesn't have to touch the picture.",
            "Use it for recordings and videos that are yours or that you may use. It only reads files on your device: it doesn't fetch anything from YouTube or other sites.",
        ],
        "faq": [
            ("Is my video uploaded?", "No. It's read and converted in your browser, on your device."),
            ("Which quality should I choose?", "192 kbps sounds good for music and speech. Use 128 kbps for a smaller file, such as a talk or a podcast, and 320 kbps if the original sound is very good."),
            ("Can it convert files from YouTube?", "No, it works only with files you already have on your device."),
            ("Is there a file-size limit?", "No fixed limit. The tool reads big files without loading them all at once; a phone will just take longer on them."),
        ],
        "tl": {"quality": "Quality", "q128": "128 kbps (smaller file)", "q192": "192 kbps (recommended)", "q320": "320 kbps (best quality)"},
    },
    "video-to-gif": {
        "name": "Video to GIF",
        "tile": "Turn a short clip of a video into a GIF that plays anywhere.",
        "title": "Convert video to GIF free, without uploading | Webspind",
        "desc": "Turn a clip from an MP4 or MOV into a GIF in your browser. Pick the start, length, width and speed. Your video is never uploaded.",
        "h1": "Convert video to GIF",
        "lead": "Pick the moment you want and turn it into a GIF. Your video stays on your device.",
        "button": "Make GIF",
        "steps": ["Choose a video.", "Set where the GIF should start and how long it should be.", "Press Make GIF, then check it and download it."],
        "notes": [
            "GIF is an old format and files get big fast. Keep clips under about 10 seconds and width at 480 pixels for a file you can share. The tool allows up to 60 seconds.",
            "Your device does the work, so a short clip takes a moment, and a long or wide one takes longer.",
        ],
        "faq": [
            ("Is my video uploaded?", "No. It's turned into a GIF in your browser, on your device."),
            ("Why is my GIF so big?", "GIF has no modern compression. Lower the width, the frames per second or the length, and it shrinks quickly."),
            ("Does the GIF have sound?", "No. The GIF format has no sound."),
            ("Is there a watermark?", "No."),
        ],
        "tl": {"start": "Start (seconds)", "length": "Length (seconds)", "width": "Width", "w320": "320 px (small)", "w480": "480 px (recommended)", "w640": "640 px (large)", "fps": "Frames per second", "previewAlt": "Your finished GIF"},
    },
    "heic": {
        "name": "HEIC to JPG",
        "tile": "Turn iPhone HEIC photos into JPGs that open everywhere, many at once.",
        "title": "HEIC to JPG converter, free and without uploading | Webspind",
        "desc": "Convert iPhone HEIC photos to JPG in your browser, many at once with a zip download. Your photos are never uploaded.",
        "h1": "Convert HEIC to JPG",
        "lead": "iPhones save photos as HEIC, which many programs and websites won't open. Turn them into JPGs, many at once.",
        "button": "Convert to JPG",
        "steps": ["Choose one or many HEIC photos, or drop them here.", "Press Convert to JPG.", "Download each photo, or all of them at once as a zip."],
        "notes": [
            "The photos are converted in your browser, so they never leave your device. That also means nobody else ever has a copy of your family pictures.",
            "The JPG does not contain the original's location or other camera details. If you need those, keep the HEIC too.",
        ],
        "faq": [
            ("Are my photos uploaded?", "No. They're converted in your browser, on your device."),
            ("Will I lose quality?", "Hardly at all at the default High setting. JPG is compressed slightly differently from HEIC, but you won't see it in normal use."),
            ("How many photos can I convert?", "As many as your device's memory allows. Dozens at a time work fine; a phone is happier with smaller batches."),
            ("Is my location kept?", "No. The JPGs are made from the picture only, so location and camera details are not copied."),
        ],
        "tl": {"quality": "Quality", "qMax": "Maximum", "qHigh": "High (recommended)", "qMed": "Medium (smaller files)"},
    },
    "compress-images": {
        "name": "Compress images",
        "tile": "Make JPG, PNG and WebP images smaller, one at a time or many at once.",
        "title": "Compress images free, without uploading | Webspind",
        "desc": "Make JPG, PNG and WebP images smaller in your browser. Batch several at once and download a zip. Your photos are never uploaded.",
        "h1": "Compress images",
        "lead": "Make photos and images smaller for email, websites and forms. Your pictures stay on your device.",
        "button": "Compress images",
        "steps": ["Choose one or many images.", "Pick a quality, and a maximum size if you also want smaller dimensions.", "Press Compress images and download them, one at a time or as a zip."],
        "notes": [
            "A JPG stays a JPG, a PNG stays a PNG and a WebP stays a WebP. PNG images are reduced to a palette of colours, which suits screenshots and graphics. For photos, choose WebP or use JPG, which handle photos far better.",
            "Compressing removes details such as location and camera data from the file. If an image can't get smaller without becoming larger than it started, we give you back your original unchanged and say so.",
        ],
        "faq": [
            ("Are my images uploaded?", "No. They're compressed in your browser, on your device."),
            ("How much smaller will my images get?", "It depends on the picture. Phone photos often shrink by more than half at the Medium setting, especially if you also limit the size. Already compressed images may shrink very little."),
            ("Is there a limit on the number of images?", "No fixed limit, only your device's memory. Dozens at a time work fine on a computer."),
            ("Does it reduce the picture size?", "Only if you choose a maximum size. Otherwise the dimensions stay the same."),
        ],
        "tl": {
            "quality": "Quality", "qHigh": "High", "qMed": "Medium (recommended)", "qLow": "Low (smallest files)",
            "maxSide": "Maximum size (longest side)", "maxSideHint": "Smaller images are not made bigger.", "keepSize": "Keep the original size",
            "format": "Format", "fmtKeep": "Keep the format", "fmtWebp": "Convert to WebP (usually smallest)",
            "keptNote": "Files marked unchanged couldn't be made smaller, so you get your original back.",
        },
    },
    "resize-images": {
        "name": "Resize images",
        "tile": "Change the pixel size of many images at once.",
        "title": "Resize images online free, without uploading | Webspind",
        "desc": "Resize JPG, PNG and WebP images by pixels or percent in your browser. Batch with zip download. Your images are never uploaded.",
        "h1": "Resize images",
        "lead": "Change the size of one image or a whole batch, by exact pixels or by percent.",
        "button": "Resize images",
        "steps": ["Choose one or many images.", "Enter a width or height, or a percentage. Leave one side empty to keep the proportions.", "Press Resize images and download them, one at a time or as a zip."],
        "notes": [
            "Everything is done on your device, one image at a time, so a batch can take a little while but stays in your hands.",
            "Choose Crop to fill if you need an exact shape such as a square, or Stretch only if you don't mind the picture being squeezed.",
        ],
        "faq": [
            ("Are my images uploaded?", "No. They're resized in your browser, on your device."),
            ("Can I resize many images at once?", "Yes. Add as many as you like and download them as a zip."),
            ("What's the best size for the web?", "A width of 1600 pixels is a good choice for photos on most websites. For email, 1200 pixels is usually plenty."),
            ("Does it make images bigger too?", "Yes, up to 400 percent, but enlarged images look softer because detail can't be invented."),
        ],
        "tl": {
            "mode": "Resize by", "modeSize": "Width and height", "modePercent": "Percent",
            "width": "Width (pixels)", "height": "Height (pixels)", "auto": "Automatic", "percent": "Percent",
            "fit": "If you give both width and height", "fitKeep": "Fit inside (keep proportions)", "fitCrop": "Crop to fill", "fitStretch": "Stretch", "fitHint": "Only used when both sides are filled in.",
            "format": "Format", "fmtSame": "Same as the original",
        },
    },
    "rembg": {
        "name": "Remove background",
        "tile": "Cut the background out of a photo and keep the subject.",
        "title": "Remove image background free, on your device | Webspind",
        "desc": "Remove the background from a photo in your browser and download a transparent PNG. Your image is never uploaded. No sign-up, no watermark.",
        "h1": "Remove the background from an image",
        "lead": "Cut out the person or thing in a photo and save it with a transparent background.",
        "local": "Your photo stays on your device. Only the AI model is downloaded.",
        "button": "Remove background",
        "steps": ["Choose a photo.", "Keep the background transparent, or choose white.", "Press Remove background, check the result and download the PNG."],
        "notes": [
            "The work is done on your device by an AI model called U-2-Net. The first time you use it, your browser downloads the model, not your files, about 175 MB. After that it starts from your browser's cache.",
            "On a normal computer one photo takes around ten seconds once the model is downloaded. Phones may run out of memory, so a computer is the better choice for this one.",
            "It works best with a clear subject against a calmer background: a person, a product, a pet. Fine hair, glass and busy backgrounds may need a touch-up, because the model looks at the picture in a reduced size.",
        ],
        "faq": [
            ("Is my photo uploaded?", "No. The photo stays in your browser on your device. Only the AI model is downloaded, the first time."),
            ("Can I use the result commercially?", "Yes. The result is yours, and the model is released under the Apache 2.0 licence, which allows commercial use."),
            ("Is there a watermark or a limit?", "No watermark, no sign-up and no limit on the number of photos."),
            ("Why is the first run slow?", "It has to download the model first, about 175 MB. Later runs start much faster."),
        ],
        "tl": {
            "background": "Background", "bgTransparent": "Transparent", "bgWhite": "White",
            "preparing": "Getting the model ready…", "downloadingModel": "Downloading the model (only the first time):", "cutting": "Finding the subject and cutting it out…",
            "previewAlt": "Your image with the background removed",
            "phoneWarn": "This needs a lot of memory, and a phone may stop partway through. A computer will handle it better. You can still try.",
        },
    },
}
