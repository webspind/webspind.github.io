# webspind.com

Static site. Plain HTML + one CSS file + one small JS file. No build step,
no dependencies, no framework. Hosted on **GitHub Pages** — pushing to
`main` publishes the site. The site is bilingual: Danish at `/`, English
under `/en/`.

## Files

```
index.html              Home (Danish): hero, Apps, Games, contact strip
jagtproven/index.html   The Jagtprøven pitch (Danish)
support.html            Support / contact page (use as App Store "Support URL")
privacy/index.html      Index of all privacy policies
privacy/jagtproven.html Jagtprøven policy — Danish only (App Store "Privacy Policy URL")
en/                     The same tree in English: en/index.html,
                        en/jagtproven/index.html, en/support.html,
                        en/privacy/index.html
404.html                Not-found page — bilingual, both languages on one page
styles.css              The whole design
site.js                 Language redirect + DA/EN preference, scroll reveal,
                        progress bar, mailto-builder for the support form
build-pages.py          Generates every page above from one string table
favicon.svg             Web icon, also used as the header/footer logo mark
assets/                 Real app icon + simulator screenshots from the Jagtprøven Xcode project
CNAME                   Tells GitHub Pages the custom domain is webspind.com — do not delete
.nojekyll               Stops GitHub from running Jekyll over the files
robots.txt, sitemap.xml SEO basics — add new pages to the sitemap
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

The homepage Apps section is data-driven, so a second app is an entry in a
list, not new markup:

1. Add a dict to `APPS` in `build-pages.py` — `href`, `icon`, `name`, and
   `meta` / `pitch` / `badge` / `more` with a `da` and an `en` string each.
2. Add its copy to both language dicts in `LANG` if it gets its own page,
   and build that page in the `for lang in ("da", "en"):` loop at the bottom.
3. Copy the policy: duplicate the `page("/privacy/<app>.html", …)` call and
   write the sections, then add a card to `priv_index_body`.
4. Add every new URL to `sitemap.xml`.
5. Re-run `python3 build-pages.py`.

Games work the same way: fill the `GAMES` list and the empty state on the
homepage is replaced by cards.

## UX-noter

`UX-NOTER.md` is the working file for design feedback — walk the site,
write what bothers you under the relevant heading, hand it over, and the
changes get made from it.

## Design

As of 1 September 2026 the site follows the **"Webspind v2"** Claude Design
project (claude.ai/design), implemented from `Webspind v2.dc.html`:

- **Palette** — warm paper `#f1eee4`, card `#fbfaf5`, forest `#1f5a35`,
  rust `#8f4712`, ink `#15211a`. Light only, held regardless of the
  visitor's system theme. The previous palette (from `Theme.swift`) and the
  dark palette are both in git history if wanted back.
- **Spacing** — the 8 pt grid (`--s1`…`--s12`), concentric card radii.
- **Type** — Bricolage Grotesque for display, Instrument Sans for UI text,
  Newsreader (serif) for long-form prose (the about section, policy body).
  Loaded from Google Fonts.
- **Motion** — scroll-reveal (`.rv`, driven by `site.js`) and a
  scroll-progress bar under the header, both behind
  `prefers-reduced-motion`.

Contrast is 4.5:1 or better on every text pairing. Every image on the site
is now a real asset from `assets/` — the temporary Wikimedia Commons
hotlinks and their footer credit line are gone (they are in git history if
the bird rail is ever wanted back).

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
