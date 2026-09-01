# -*- coding: utf-8 -*-
"""Generates the static pages so the shared header/footer stay identical.
Output is plain HTML — nothing is needed at serve time."""
import io, os

HERO_WEB = open("/tmp/heroweb.svg").read().rstrip()

BRAND_MARK = '''<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true">
        <g class="web-ring">
          <line x1="12" y1="12" x2="12" y2="2.4"/><line x1="12" y1="12" x2="20.3" y2="7.2"/>
          <line x1="12" y1="12" x2="20.3" y2="16.8"/><line x1="12" y1="12" x2="12" y2="21.6"/>
          <line x1="12" y1="12" x2="3.7" y2="16.8"/><line x1="12" y1="12" x2="3.7" y2="7.2"/>
          <path d="M12 6.6 Q15.4 7.7 16.8 9.85 Q18.1 12 16.8 14.15 Q15.4 16.3 12 17.4 Q8.6 16.3 7.2 14.15 Q5.9 12 7.2 9.85 Q8.6 7.7 12 6.6"/>
          <path d="M12 2.9 Q17.8 4.6 19.9 7.5 Q21.9 12 19.9 16.5 Q17.8 19.4 12 21.1 Q6.2 19.4 4.1 16.5 Q2.1 12 4.1 7.5 Q6.2 4.6 12 2.9"/>
        </g>
      </svg>'''

ARROW = '<svg class="arrow" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>'

NAV = [("/#apps", "Apps", "apps"), ("/#games", "Games", "games"),
       ("/privacy/", "Privacy", "privacy"), ("/support.html", "Support", "support")]


def header(current=None):
    links = "".join(
        '\n        <a href="%s"%s>%s</a>' % (h, ' aria-current="page"' if k == current else "", t)
        for h, t, k in NAV)
    return '''<header class="site-header">
    <div class="wrap">
      <a class="brand" href="/">
        %s
        Webspind
      </a>
      <nav class="nav" aria-label="Main">%s
      </nav>
    </div>
  </header>''' % (BRAND_MARK, links)


FOOTER = '''<footer class="site-footer">
    <div class="wrap">
      <span>© 2026 Webspind</span>
      <span class="footer-links">
        <a href="/">Home</a>
        <a href="/privacy/">Privacy</a>
        <a href="/support.html">Support</a>
      </span>
    </div>
  </footer>'''


def page(path, title, desc, body, current=None, canonical=None):
    html = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>%s</title>
  <meta name="description" content="%s">
  <link rel="stylesheet" href="/styles.css">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/favicon.svg">
  <meta name="theme-color" content="#faf8f3">
  <link rel="canonical" href="https://webspind.com%s">
  <meta property="og:title" content="%s">
  <meta property="og:description" content="%s">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://webspind.com%s">
</head>
<body>

  %s

%s

  %s

</body>
</html>
''' % (title, desc, canonical or path, title, desc, canonical or path,
       header(current), body, FOOTER)
    full = os.path.join(os.getcwd(), path.lstrip("/"))
    if path.endswith("/"):
        full = os.path.join(full, "index.html")
    os.makedirs(os.path.dirname(full), exist_ok=True)
    io.open(full, "w", encoding="utf-8").write(html)
    print("  wrote %-28s %6d bytes" % (path, len(html.encode("utf-8"))))


# ---------------------------------------------------------------- home

TILE_APP = '''<span class="tile" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.6 5.4h2.8"/></svg></span>'''
TILE_SHIELD = '''<span class="tile" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.8l7 2.9v5.6c0 4.4-2.9 8.3-7 9.9-4.1-1.6-7-5.5-7-9.9V5.7z"/><path d="M9.2 12.1l2 2 3.6-3.9"/></svg></span>'''
TILE_MAIL = '''<span class="tile" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.8" y="5" width="18.4" height="14" rx="3"/><path d="M4 7.5l8 5.2 8-5.2"/></svg></span>'''

home = '''  <div class="hero">
%s
    <div class="wrap">
      <p class="hero-eyebrow"><span class="dot"></span> Independent studio · Denmark</p>
      <h1>Small apps, made&nbsp;with <span class="accent">care</span>.</h1>
      <p class="hero-lede">Webspind builds focused iOS apps and games — the kind that do one thing well, work without a signal, and never ask for your data. Support and privacy policies for everything I ship live here.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#apps">See the apps %s</a>
        <a class="btn btn-secondary" href="/support.html">Get in touch</a>
      </div>
    </div>
  </div>

  <hr class="rule">

  <section class="band" id="apps">
    <div class="wrap">
      <div class="section-head">
        <h2>iOS Apps</h2>
        <p>Built in SwiftUI for iOS 26 and up. Offline first, no accounts, no tracking.</p>
      </div>
      <div class="grid">

        <a class="card" href="/privacy/jagtproven.html">
          <div class="card-top">
            %s
            <h3>Jagtprøven <span class="badge">In Development</span></h3>
          </div>
          <p>Practice for the Danish hunting licence exam. The full question bank, your progress tracked on device, and nothing sent anywhere.</p>
          <span class="card-foot">Privacy policy %s</span>
        </a>

      </div>
    </div>
  </section>

  <section class="band" id="games">
    <div class="wrap">
      <div class="section-head">
        <h2>Games</h2>
        <p>Roblox and Unity projects.</p>
      </div>
      <div class="empty">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="2.4" y="7" width="19.2" height="11" rx="4.6"/>
          <path d="M7.6 11.2v3.6M5.8 13h3.6M15.6 12.1h.01M18 14.4h.01"/>
        </svg>
        <h3>Nothing published yet</h3>
        <p>Projects are in progress. They'll appear here the moment the first one ships.</p>
      </div>
    </div>
  </section>

  <hr class="rule">

  <section class="band">
    <div class="wrap">
      <div class="section-head">
        <h2>Get in Touch</h2>
      </div>
      <div class="grid">
        <a class="card" href="/support.html">
          <div class="card-top">
            %s
            <h3>Support</h3>
          </div>
          <p>A bug, a feature request, or a question about one of the apps — write and I'll answer.</p>
          <span class="card-foot">Contact %s</span>
        </a>
        <a class="card" href="/privacy/">
          <div class="card-top">
            %s
            <h3>Privacy</h3>
          </div>
          <p>One policy per app, exactly as linked from each App Store listing.</p>
          <span class="card-foot">Read the policies %s</span>
        </a>
      </div>
    </div>
  </section>''' % (HERO_WEB, ARROW, TILE_APP, ARROW, TILE_MAIL, ARROW, TILE_SHIELD, ARROW)

page("/", "Webspind — Small apps, made with care",
     "Webspind builds focused iOS apps and games. Support and privacy policies for every app.",
     home)

# ---------------------------------------------------------------- privacy index

priv = '''  <section class="band">
    <div class="wrap">
      <div class="section-head">
        <h2>Privacy Policies</h2>
        <p>One per app, as required by the App Store. The short version is the same for all of them: nothing is collected.</p>
      </div>
      <div class="grid">
        <a class="card" href="/privacy/jagtproven.html">
          <div class="card-top">
            %s
            <h3>Jagtprøven</h3>
          </div>
          <p>No data collected. No accounts, no analytics, no network calls. Everything stays on your device.</p>
          <span class="card-foot">Read the policy %s</span>
        </a>
      </div>
    </div>
  </section>''' % (TILE_SHIELD, ARROW)

page("/privacy/", "Privacy Policies — Webspind",
     "Privacy policies for every Webspind app.", priv, current="privacy")

# ---------------------------------------------------------------- jagtproven policy

jp = '''  <article class="prose">
    <div class="wrap">
      <a class="back" href="/privacy/">&#8592; All privacy policies</a>

      <h1>Jagtprøven Privacy Policy</h1>
      <p class="updated">Last updated 1 September 2026</p>

      <div class="callout">
        <p><strong>The short version:</strong> Jagtprøven collects nothing. No accounts, no analytics, no advertising, and no network connection of its own. Everything you do in the app stays on your iPhone or iPad.</p>
      </div>

      <h2>Data We Collect</h2>
      <p>None. The app does not collect, transmit, sell, or share any personal information. There is no sign-up, no login, and no user profile.</p>

      <h2>Data Stored on Your Device</h2>
      <p>To make the app work, a small amount of information is saved locally on your device only:</p>
      <ul>
        <li><strong>Your progress</strong> — which questions you have answered, and how you did.</li>
        <li><strong>Your settings</strong> — preferences you choose inside the app.</li>
        <li><strong>Usage counters</strong> — how many times the app has been opened and how long you have had it installed. This is used only to decide when it is polite to ask you for an App Store review.</li>
      </ul>
      <p>This data never leaves your device. It is not backed up to any Webspind server, because there are no Webspind servers. Deleting the app deletes all of it.</p>

      <h2>Purchases</h2>
      <p>If the app offers a paid upgrade, the purchase is handled entirely by Apple through the App Store. Webspind never sees your name, payment details, or Apple Account — Apple tells the app only whether a purchase is active. That transaction is covered by <a href="https://www.apple.com/legal/privacy/" rel="noopener">Apple's Privacy Policy</a>.</p>

      <h2>Third Parties</h2>
      <p>The app contains no analytics SDKs, no advertising networks, no crash reporting services, and no social media integrations. No third party receives data from the app.</p>

      <h2>Children</h2>
      <p>The app is safe for all ages in the way that matters here: it collects no data from anyone, including children under 13.</p>

      <h2>Your Rights</h2>
      <p>Under the GDPR you have the right to access, correct, and delete the personal data a company holds about you. Webspind holds none, so there is nothing to request. The data on your device is entirely under your control and is removed when you delete the app.</p>

      <h2>Changes to This Policy</h2>
      <p>If a future version of the app changes what it does with data, this page will be updated before that version is released, and the date at the top will change.</p>

      <h2>Contact</h2>
      <p>Questions about this policy: <a href="mailto:webspind@gmail.com">webspind@gmail.com</a></p>
    </div>
  </article>'''

page("/privacy/jagtproven.html", "Jagtprøven Privacy Policy — Webspind",
     "Privacy policy for the Jagtprøven iOS app. No personal data is collected.",
     jp, current="privacy")

# ---------------------------------------------------------------- support

sup = '''  <article class="prose">
    <div class="wrap">
      <h1>Support</h1>
      <p class="updated">Usually answered within a few days</p>

      <div class="callout">
        <p>Found a bug, want a feature, or is something not working? Write to <a href="mailto:webspind@gmail.com">webspind@gmail.com</a> and I'll get back to you.</p>
      </div>

      <h2>What Helps Me Fix It Faster</h2>
      <ul>
        <li>Which app, and which version.</li>
        <li>Your iOS version and device model.</li>
        <li>What you did, what you expected, and what happened instead.</li>
        <li>A screenshot or screen recording, if it's something visual.</li>
      </ul>

      <h2>Purchases and Refunds</h2>
      <p>All purchases go through Apple, so refunds do too — request one at <a href="https://reportaproblem.apple.com" rel="noopener">reportaproblem.apple.com</a>. If a purchase isn't unlocking correctly inside the app, that one's on me: email me and I'll sort it out.</p>

      <h2>Privacy</h2>
      <p>Each app's privacy policy is on the <a href="/privacy/">privacy page</a>.</p>
    </div>
  </article>'''

page("/support.html", "Support — Webspind",
     "Support for Webspind apps and games.", sup, current="support")

# ---------------------------------------------------------------- 404

nf = '''  <div class="center-page">
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true" style="color:var(--forest);opacity:.5">
      <line x1="12" y1="12" x2="12" y2="2.4"/><line x1="12" y1="12" x2="20.3" y2="7.2"/>
      <line x1="12" y1="12" x2="12" y2="21.6"/><line x1="12" y1="12" x2="3.7" y2="16.8"/>
      <path d="M12 6.6 Q15.4 7.7 16.8 9.85 Q18.1 12 16.8 14.15"/>
      <path d="M12 2.9 Q17.8 4.6 19.9 7.5 Q21.9 12 19.9 16.5"/>
      <path d="M7.2 14.15 Q5.9 12 7.2 9.85 Q8.6 7.7 12 6.6"/>
    </svg>
    <h1>404</h1>
    <p>That thread of the web doesn't lead anywhere.</p>
    <p><a class="btn btn-secondary" href="/">Back to Webspind</a></p>
  </div>'''

page("/404.html", "Not Found — Webspind", "Page not found.", nf)
