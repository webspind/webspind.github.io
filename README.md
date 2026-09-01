# webspind.com

Static site. Plain HTML + one CSS file. No build step, no dependencies, no framework.
Hosted on **GitHub Pages** — pushing to `main` publishes the site.

## Files

```
index.html              Home: apps + games
support.html            Support / contact page (use as App Store "Support URL")
privacy/index.html      Index of all privacy policies
privacy/jagtproven.html Jagtprøven policy (use as App Store "Privacy Policy URL")
404.html                Not-found page
styles.css              The whole design
favicon.svg             Web icon
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

## Add a new app

1. Copy `privacy/jagtproven.html` to `privacy/<appname>.html`, edit the text.
2. Add a card to the grid in `index.html` (`<section id="apps">`) and in `privacy/index.html`.
3. Add both URLs to `sitemap.xml`.
4. Commit and push.

## Add a game

Replace the `<div class="empty">…</div>` inside `<section id="games">` in `index.html`
with a `.grid` of `.card` links, same shape as the apps section.
