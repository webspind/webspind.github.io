# webspind.com

Static site. Plain HTML + one CSS file + one small JS file. No build step,
no dependencies, no framework. Hosted on **GitHub Pages** — pushing to
`main` publishes the site. The site is bilingual: Danish at `/`, English
under `/en/`.

## Files

```
index.html              Home (Danish): hero, icon shelf, apps by status, About Jakob
jagtproven/index.html   The Jagtprøven pitch (Danish)
support.html            Support / contact page (Jagtprøven's App Store "Support URL")
privacy/index.html      Index of all privacy policies (built from APPS)
privacy/jagtproven.html Jagtprøven policy — Danish only (generated)
privacy/*, support/*    Hand-written per-app policies and support pages, also
en/, no/, de/           under en/privacy, en/support, no/… and de/… — their
                        <main> is hand-written, the shell around it is generated
en/                     The generated pages again in English
404.html                Not-found page — bilingual, both languages on one page
styles.css              The whole design
site.js                 Language redirect + DA/EN preference, scroll reveal,
                        hero parallax, mailto-builder for the support form
build-pages.py          Generates every page and sitemap.xml from one string table
favicon.svg             Tab icon
assets/apps/            App icons (256 px) and two screens per app (600 px), webp
assets/jakob.webp       Portrait for the About block
CNAME                   Tells GitHub Pages the custom domain is webspind.com — do not delete
.nojekyll               Stops GitHub from running Jekyll over the files
robots.txt, sitemap.xml SEO basics (sitemap is generated)
```

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish a change

```sh
git add -A && git commit -m "what changed" && git push
```

Live within ~1 minute.

## Language

Danish for Danish visitors, English for everyone else. The site is static,
so there is no geo-IP lookup — that would mean a third-party network call on
every visit, which contradicts the site's own "no tracking, no network
calls" stance. Browser language is the proxy instead:

- On load `site.js` reads `localStorage.webspindLang`; a stored choice
  `location.replace()`s into the matching tree either way. With nothing
  stored, only a visitor landing on the Danish tree whose
  `navigator.language` isn't Danish gets sent to `/en` — an explicit
  `/en/…` URL is never bounced back to Danish based on browser language.
- The **DA | EN** switch in the header links to the twin page and stores the
  choice on click, so it survives reloads and beats the browser language
  from then on.
- Pages with no twin — `privacy/jagtproven.html` (Danish legal text for a
  Danish-only app) and `404.html` (bilingual on one page) — carry
  `data-nolang` on `<html>`, and `site.js` skips the redirect for them.
  The 404 must be skipped: GitHub Pages serves it under the URL that was
  requested, so redirecting would just 404 again.
- Every bilingual page carries `hreflang` alternates (`da`, `en`,
  `x-default`) so search engines index both trees correctly.

## Add a new app

1. Add a dict to `APPS` in `build-pages.py` (name, status, colour, copy in
   `da` and `en`, and the URLs of its policy and support pages).
2. Put `assets/apps/icons/<id>.webp` (256 px) and
   `assets/apps/screens/<id>-a.webp` + `-b.webp` (600 px wide) in place.
3. Write its policy (and support page) as a plain HTML file under
   `privacy/` or `<lang>/privacy/` with a `<main>` — any existing one is a
   template. The build wraps it in the shared header and footer.
4. Run `python3 build-pages.py`. The homepage tile, icon shelf, footer,
   privacy index, support page and sitemap all pick it up.

When an app goes live or into review, change its `status` and rebuild.

**Never move a policy or support URL** — App Store Connect points at them.

## UX-noter

`UX-NOTER.md` is the working file for design feedback — walk the site,
write what bothers you under the relevant heading, hand it over, and the
changes get made from it.

## Design

Since 14 October 2026 the site is **"Showcase"** (concept C of three):
calm, product-first and Apple-like. Real app screens sit in phone frames on
tiles tinted with each app's own colour (`--c` per tile).

- **Palette** — background `#f5f5f7`, cards white, ink `#1d1d1f`, links
  `#0062c4`. Light only. No grey text: secondary information is ink at a
  lighter weight, or a real colour.
- **Type** — Inter from Google Fonts, 800 for headlines with tight tracking.
- **Motion** — scroll reveal (`.rv`) and a small hero parallax, both off
  under `prefers-reduced-motion`.

### Regenerating the pages

The header, footer and every string are shared, so the pages are generated
by `build-pages.py` rather than hand-edited in ten places:

```sh
python3 build-pages.py
```

It writes plain HTML — nothing is needed at serve time. All user-facing copy
lives in the `LANG` dict at the top of that script, one entry per language;
the builder functions below it only lay the strings out. Edit the content
there, re-run the script, then commit. Editing the generated `.html`
directly works too, but the next run overwrites it.
