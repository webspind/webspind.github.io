#!/usr/bin/env python3
"""Generates every page under /tools/ from the tables below. Run: python3 tools/build.py
Plain HTML comes out; nothing is needed at serve time. Copy lives in copy_en.py and copy_da.py."""
import html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.dont_write_bytecode = True
import copy_en, copy_da  # noqa: E402

BASE = "https://webspind.com"
LOCK = '<svg class="lock" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.6" fill="currentColor"/><path d="M5.2 7V5.2a2.8 2.8 0 0 1 5.6 0V7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
S = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'

# The header and footer are the site's own, taken from the pages build-pages.py writes, so they never drift.
# DA/EN links get data-keep: lang-keep.js keeps the visitor's place, using the section ids in <main>.
def site_chrome(lang):
    src = open(os.path.join(HERE, "..", "en" if lang == "en" else "", "index.html"), encoding="utf-8").read()
    head = src[src.index('<header class="site-header">'):src.index("</header>", src.index('<header class="site-header">')) + 9]
    foot = src[src.index('<footer class="site-footer">'):src.index("</footer>") + 9]
    return head, foot


CHROME = {"en": site_chrome("en"), "da": site_chrome("da")}

TOOLS = [
    dict(id="transcribe", en="transcribe-audio-to-text", da="transskriber-lyd-til-tekst", c="#6a3cf0",
         icon=f'<path {S} d="M4 11v2M8 7v10M12 4v16M16 8v8M20 11v2"/>'),
    dict(id="compress-video", en="compress-video", da="komprimer-video", c="#1f3fd6",
         icon=f'<rect x="3" y="5" width="18" height="14" rx="2" {S}/><path {S} d="M12 8v3M10 9.5l2 2 2-2M12 16v-3M10 14.5l2-2 2 2"/>'),
    dict(id="video-to-mp3", en="video-to-mp3", da="video-til-mp3", c="#b03a8c",
         icon=f'<path {S} d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5" {S}/><circle cx="16.5" cy="16" r="2.5" {S}/>'),
    dict(id="video-to-gif", en="video-to-gif", da="video-til-gif", c="#c4421f",
         icon=f'<rect x="3" y="5" width="18" height="14" rx="2" {S}/><path {S} d="M10 9l5 3-5 3z"/>'),
    dict(id="heic", en="heic-to-jpg", da="heic-til-jpg", c="#2b7334",
         icon=f'<rect x="3" y="5" width="18" height="14" rx="2" {S}/><circle cx="8.5" cy="10" r="1.6" fill="currentColor"/><path {S} d="M5 17l5-5 3 3 2-2 4 4"/>'),
    dict(id="compress-images", en="compress-images", da="komprimer-billeder", c="#0062c4",
         icon=f'<path {S} d="M12 3v6M9 6l3 3 3-3M12 21v-6M9 18l3-3 3 3M4 12h16"/>'),
    dict(id="resize-images", en="resize-images", da="skift-stoerrelse-paa-billeder", c="#7d4300",
         icon=f'<rect x="3" y="9" width="12" height="12" rx="1.5" {S}/><path {S} d="M13 3h8v8M21 3l-8 8"/>'),
    dict(id="rembg", en="remove-image-background", da="fjern-baggrund-fra-billede", c="#8a1f3a",
         icon=f'<path {S} d="M4 20l6-8 4 4 6-8"/><path {S} stroke-dasharray="2 3" d="M3 4h18v16H3z"/>'),
]
LANGS = {"en": copy_en, "da": copy_da}


def path(lang, tool=None):
    root = "/tools/" if lang == "en" else "/tools/da/"
    if tool is None:
        return root
    return f"{root}{tool[lang]}/"


def privacy_path(lang):
    return "/tools/privacy/" if lang == "en" else "/tools/da/privacy/"


def e(s):
    return html.escape(s, quote=True)


def shell(lang, title, desc, current_en, current_da, body, *, canonical, h_nav_current=True, ld=(), strings=None, extra_js=""):
    C = LANGS[lang]
    other = "da" if lang == "en" else "en"
    other_url = current_da if lang == "en" else current_en
    this_url = current_en if lang == "en" else current_da
    ld_html = "".join(f'  <script type="application/ld+json">{json.dumps(x, ensure_ascii=False, separators=(",", ":"))}</script>\n' for x in ld)
    head_html, foot_html = CHROME[lang]
    switch = (f'<span class="lang-switch"><a href="{current_da}" data-lang="da" hreflang="da"{" aria-current=\"true\"" if lang == "da" else ""} data-keep>DA</a>'
              f'<a href="{current_en}" data-lang="en" hreflang="en"{" aria-current=\"true\"" if lang == "en" else ""} data-keep>EN</a></span>')
    head_html = re.sub(r'<span class="lang-switch">.*?</span>', lambda m: switch, head_html, count=1, flags=re.S)
    # This folder's own privacy page and third-party licences stay one tap from every tool.
    extra = f'<a href="{privacy_path(lang)}">{e(C.PRIVACY_TITLE)}</a><a href="/tools/LICENSES.md">{e(C.LICENCES)}</a>'
    foot_html = foot_html.replace("<h2>", "<h2 data-x>", 1).replace('</h2>\n          <p>', '</h2>\n          <p>' + extra, 1).replace("<h2 data-x>", "<h2>", 1)
    strings_html = f'  <script type="application/json" id="strings">{json.dumps(strings, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")}</script>\n  <script type="module" src="/tools/assets/app.js"></script>\n' if strings else ""
    return f'''<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(title)}</title>
  <meta name="description" content="{e(desc)}">
  <link rel="stylesheet" href="/tools/assets/fonts/inter.css">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/tools/assets/tools.css">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#f5f5f7">
  <link rel="canonical" href="{BASE}{canonical}">
  <link rel="alternate" hreflang="en" href="{BASE}{current_en}">
  <link rel="alternate" hreflang="da" href="{BASE}{current_da}">
  <link rel="alternate" hreflang="x-default" href="{BASE}{current_en}">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="{lang}">
  <meta property="og:url" content="{BASE}{canonical}">
{ld_html}</head>
<body>
  <a class="skip" href="#main">{e(C.UI["skip"])}</a>
  {head_html}
  <main id="main" class="pdf">
{body}
  </main>
  {foot_html}

{strings_html}  <script src="/lang-keep.js"></script>
  <script src="/nav.js"></script>
</body>
</html>
'''


def tile(lang, t):
    C = LANGS[lang].TOOLS[t["id"]]
    return f'<a class="ttile" href="{path(lang, t)}" style="--c:{t["c"]}"><span class="tt-ic"><svg viewBox="0 0 24 24" aria-hidden="true">{t["icon"]}</svg></span><span class="tt-name">{e(C["name"])}</span><span class="tt-desc">{e(C["tile"])}</span></a>'


def faq_html(items):
    return '<div class="faq">' + "".join(f"<details><summary>{e(q)}</summary><div class=\"answer\"><p>{e(a)}</p></div></details>" for q, a in items) + "</div>"


def faq_ld(items):
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in items]}


def tool_page(lang, t):
    C = LANGS[lang]
    T = C.TOOLS[t["id"]]
    url = path(lang, t)
    others = "".join(tile(lang, o) for o in TOOLS if o["id"] != t["id"])
    steps = "".join(f"<li>{e(s)}</li>" for s in T["steps"])
    notes = "".join(f"<p>{e(p)}</p>" for p in T["notes"])
    body = f'''    <section class="tool-hero" id="sec-top" data-sec style="--c:{t["c"]}">
      <span class="th-ic"><svg viewBox="0 0 24 24" aria-hidden="true">{t["icon"]}</svg></span>
      <h1>{e(T["h1"])}</h1>
      <p class="lead">{e(T["lead"])}</p>
      <p class="local">{LOCK}{e(T.get("local", C.UI["local"]))}</p>
    </section>
    <section class="bench" id="bench" data-sec data-tool="{t["id"]}"><noscript>{e(C.UI["noscript"])}</noscript></section>
    <section class="how wrap-narrow" id="sec-how" data-sec>
      <h2>{e(C.HOW_TITLE)}</h2>
      <ol>{steps}</ol>
    </section>
    <section class="how wrap-narrow" id="sec-notes" data-sec>
      <h2>{e(C.GOOD_TITLE)}</h2>
      <div class="notes">{notes}</div>
    </section>
    <section class="faqsec wrap-narrow" id="sec-faq" data-sec>
      <h2>{e(C.FAQ_TITLE)}</h2>
      {faq_html(T["faq"])}
    </section>
    <section class="pdf-more" id="sec-more" data-sec>
      <h2>{e(C.MORE_TITLE)}</h2>
      <div class="tgrid">{others}<a class="ttile" href="{"/pdf/" if lang == "en" else "/pdf/da/"}" style="--c:#335c67"><span class="tt-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path {S} d="M6 3h9l3 3v15H6z"/><path {S} d="M9 12h6M9 16h6"/></svg></span><span class="tt-name">{e(C.PDF_TILE_NAME)}</span><span class="tt-desc">{e(C.PDF_TILE_DESC)}</span></a></div>
    </section>'''
    ld = [
        {"@context": "https://schema.org", "@type": "WebApplication", "name": f'{T["name"]} · Webspind', "url": f"{BASE}{url}", "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any (web browser)", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR"}, "inLanguage": lang},
        faq_ld(T["faq"]),
    ]
    strings = {"ui": C.UI, "tool": {**T.get("tl", {}), "button": T["button"]}, "id": t["id"], "lang": lang}
    return shell(lang, T["title"], T["desc"], path("en", t), path("da", t), body, canonical=url, ld=ld, strings=strings)


def hub_page(lang):
    C = LANGS[lang]
    H = C.HUB
    tiles = "".join(tile(lang, t) for t in TOOLS)
    why = "".join(f"<div><h2>{e(a)}</h2><p>{e(b)}</p></div>" for a, b in H["why"])
    body = f'''    <section class="hero pdf-hero" id="sec-top" data-sec>
      <p class="eyebrow">{LOCK}{e(H["eyebrow"])}</p>
      <h1 class="hero-h">{e(H["h1"])}</h1>
      <p class="hero-p">{e(H["p"])}</p>
    </section>
    <section class="pdf-more home-tools" id="sec-tools" data-sec><div class="tgrid">{tiles}</div></section>
    <section class="why" id="sec-why" data-sec>{why}</section>
    <section class="faqsec wrap-narrow" id="sec-faq" data-sec>
      <h2>{e(C.FAQ_TITLE)}</h2>
      {faq_html(H["faq"])}
    </section>'''
    ld = [
        {"@context": "https://schema.org", "@type": "WebSite", "name": "Webspind tools", "url": f"{BASE}{path(lang)}", "inLanguage": lang},
        faq_ld(H["faq"]),
    ]
    return shell(lang, H["title"], H["desc"], path("en"), path("da"), body, canonical=path(lang), ld=ld)


def privacy_page(lang):
    C = LANGS[lang]
    P = C.PRIVACY
    body = '    <section class="wrap-narrow prose" id="sec-top" data-sec>' + f'<h1>{e(C.PRIVACY_TITLE)}</h1>' + P + "</section>"
    return shell(lang, f"{C.PRIVACY_TITLE} | Webspind", C.PRIVACY_DESC, privacy_path("en"), privacy_path("da"), body, canonical=privacy_path(lang))


def write(rel, content):
    full = os.path.join(HERE, "..", rel.lstrip("/"), "index.html")
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    urls = []
    for lang in LANGS:
        write(path(lang), hub_page(lang)); urls.append(path(lang))
        for t in TOOLS:
            write(path(lang, t), tool_page(lang, t)); urls.append(path(lang, t))
        write(privacy_path(lang), privacy_page(lang)); urls.append(privacy_path(lang))
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sm += "".join(f"  <url><loc>{BASE}{u}</loc></url>\n" for u in urls)
    sm += "</urlset>\n"
    with open(os.path.join(HERE, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(sm)
    print(f"{len(urls)} pages written")


if __name__ == "__main__":
    main()
