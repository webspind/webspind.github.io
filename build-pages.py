# -*- coding: utf-8 -*-
"""Generates the static pages so the shared header/footer/scripts stay
identical. Output is plain HTML — nothing is needed at serve time.

Design: "Webspind v2" (claude.ai/design project), centred on Jagtprøven —
Bricolage Grotesque + Instrument Sans + Newsreader, warm paper palette,
copy in Danish. See styles.css for the whole visual system."""
import io, os

LOGO = "/favicon.svg"

NAV = [("/", "Appen", "home"), ("/support.html", "Support", "support"),
       ("/privacy/", "Privatliv", "privacy")]

FONT_LINKS = '''<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap" rel="stylesheet">'''


def header(current=None):
    links = "".join(
        '\n        <a href="%s"%s>%s</a>' % (h, ' aria-current="page"' if k == current else "", t)
        for h, t, k in NAV)
    return '''<header class="site-header">
    <div class="wrap">
      <a class="brand" href="/">
        <img src="%s" alt="" width="28" height="28">
        <span>Webspind</span>
      </a>
      <nav class="nav" aria-label="Main">%s
        <a class="contact" href="mailto:hej@webspind.com">Skriv til mig</a>
      </nav>
    </div>
    <div class="progress-track"><div class="progress-bar" data-progress="1"></div></div>
  </header>''' % (LOGO, links)


FOOTER = '''<footer class="site-footer">
    <div class="wrap">
      <div class="footer-top">
        <span class="footer-brand"><img src="%s" alt="">© 2026 Webspind · Danmark</span>
        <span class="footer-links">
          <a href="/">Appen</a>
          <a href="/privacy/">Privatliv</a>
          <a href="mailto:hej@webspind.com">E-mail</a>
        </span>
      </div>
      <p class="footer-credit">Midlertidige fotos: <a href="https://commons.wikimedia.org/wiki/File:Metskits_-_Roe_deer_-_Capreolus_capreolus_(4).jpg">rådyr</a>, <a href="https://commons.wikimedia.org/wiki/File:Anas_platyrhynchos_male_female.jpg">gråand</a>, <a href="https://commons.wikimedia.org/wiki/File:Pheasant.jpg">fasan</a>, <a href="https://commons.wikimedia.org/wiki/File:Common_Wood_Pigeon_(Columba_palumbus).JPG">ringdue</a>, <a href="https://commons.wikimedia.org/wiki/File:Grauwe_gans_-_greylag_goose_-_Anser_anser.jpg">grågås</a> — Wikimedia Commons, CC BY / CC BY-SA. Husk at kreditere fotograferne korrekt, eller udskift dem med dine egne billeder inden lancering.</p>
    </div>
  </footer>''' % LOGO


def page(path, title, desc, body, current=None, canonical=None):
    html = '''<!doctype html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>%s</title>
  <meta name="description" content="%s">
  %s
  <link rel="stylesheet" href="/styles.css">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/favicon.svg">
  <meta name="theme-color" content="#f1eee4">
  <link rel="canonical" href="https://webspind.com%s">
  <meta property="og:title" content="%s">
  <meta property="og:description" content="%s">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://webspind.com%s">
</head>
<body>
  <div class="ambience" aria-hidden="true"></div>
  <div class="ambience-grid" aria-hidden="true"></div>

  %s

  <main>
%s
  </main>

  %s

  <script src="/site.js"></script>
</body>
</html>
''' % (title, desc, FONT_LINKS, canonical or path, title, desc, canonical or path,
       header(current), body, FOOTER)
    full = os.path.join(os.getcwd(), path.lstrip("/"))
    if path.endswith("/"):
        full = os.path.join(full, "index.html")
    os.makedirs(os.path.dirname(full), exist_ok=True)
    io.open(full, "w", encoding="utf-8").write(html)
    print("  wrote %-28s %6d bytes" % (path, len(html.encode("utf-8"))))


def commons(name, width=800):
    from urllib.parse import quote
    return "https://commons.wikimedia.org/wiki/Special:FilePath/%s?width=%d" % (quote(name), width)


# ---------------------------------------------------------------- data

FEATURES = [
    ("280 spørgsmål med forklaring", "Hvert eneste spørgsmål fortæller, hvorfor svaret er rigtigt. Du forstår reglen bag i stedet for at lære facit udenad."),
    ("Våbenprøven som egen test", "En selvstændig test du kan køre igen og igen, indtil kaliberkrav og våbenregler sidder fast."),
    ("Ser dine svage emner", "Appen følger din statistik pr. emne og peger på, hvor du taber point — så du øver det rigtige."),
    ("Øv hvor som helst", "Appen virker helt uden netforbindelse, så du kan tage en runde i bilen, i skjulet eller i pausen på arbejde."),
]

TOPICS = [
    ("Sikkerhed på jagt", "gratis"),
    ("Våben og ammunition", "+ våbenprøve"),
    ("Jagtret og lovgivning", ""),
    ("Vildtpleje og naturforvaltning", ""),
    ("Pattedyr", ""),
    ("Fugle", "+ fuglekending"),
    ("Jagtformer", ""),
]

BIRDS = [
    ("Gråand", "Anas platyrhynchos male female.jpg", "spidsand og krikand", "Jagtbar"),
    ("Fasan", "Pheasant.jpg", "agerhøne på afstand", "Jagtbar"),
    ("Ringdue", "Common Wood Pigeon (Columba palumbus).JPG", "tyrkerdue", "Jagtbar"),
    ("Grågås", "Grauwe gans - greylag goose - Anser anser.jpg", "blisgås og sædgås", "Jagtbar"),
]

SEASONS = [
    ("Gråand", "1. sep – 31. dec", True),
    ("Fasan", "1. okt – 31. jan", False),
    ("Ringdue", "1. sep – 31. jan", True),
    ("Grågås", "1. sep – 31. dec", True),
    ("Rådyr, buk", "16. maj – 15. jul", False),
]

FREE_ITEMS = [
    ("Sikkerhed på jagt", "hele emnet gratis"),
    ("4 fuglearter", "med kendetegn og quiz"),
    ("4 jagttider", "til at prøve visningen"),
]

FACTS = [
    ("Studie", "Webspind, Danmark"),
    ("Folk", "Én"),
    ("Udgivet", "Jagtprøven, første app"),
    ("Support", "Mig, inden for 2 hverdage"),
]

STATS = [
    ("280", "spørgsmål med forklaring"),
    ("35", "fuglearter med kendetegn"),
    ("31", "arters jagttider"),
    ("7", "emner + våbenprøven"),
]

FAQS = [
    ("Er det prøvens rigtige spørgsmål?", "Nej. Spørgsmålene er skrevet til appen ud fra det offentlige pensum til jagttegnsprøven. Appen er en uafhængig træningsapp og er ikke tilknyttet Naturstyrelsen eller Miljøministeriet."),
    ("Kan jeg bruge jagttiderne, når jeg er på jagt?", "Brug dem til at øve. Jagttiderne i appen er vejledende og er ikke et juridisk opslagsværk — slå altid op i den gældende bekendtgørelse, før du går ud. Flere arter har desuden lokale og regionale jagttider, som appen kun noterer."),
    ("Hvad kan jeg prøve gratis?", "Hele emnet “Sikkerhed på jagt”, fire fuglearter og fire jagttider. Resten låses op med ét engangskøb, ikke et abonnement."),
    ("Hvordan får jeg mit køb tilbage på en ny telefon?", "Åbn appen, gå til Indstillinger og tryk Gendan køb. Købet hænger på din Apple-konto, så det er nok at være logget ind med den samme. Sker der intet, så skriv til mig med købsdatoen, så ordner jeg det."),
    ("Gemmer appen mine besvarelser et sted?", "Kun på din egen telefon. Der er ingen brugerkonto og ingen server hos mig, så din statistik og dine favoritfugle forlader ikke enheden."),
    ("Jeg mener, et svar er forkert", "Skriv hvilket spørgsmål det er, og hvad du mener er galt, gerne med henvisning. Pensum ændrer sig, og jeg retter hurtigt — det er mig selv, der læser mailen."),
]

POLICY_SECTIONS = [
    ("Hvad indsamles", "Ingenting. Der er ingen brugerkonto, intet reklame-id, ingen fingerprinting og ingen tredjeparts analyseværktøjer i appen. Jeg ved ikke, hvem du er, eller at du har åbnet den."),
    ("Hvor dine data ligger", "Din statistik, dine favoritfugle og dine besvarelser gemmes på din egen enhed. Webspind driver ingen server, og der findes ingen kopi hos mig. Tager du en backup via iCloud, ligger den i din egen konto, som kun du har adgang til."),
    ("Nedbrudsrapporter", "Har du slået deling med udviklere til i enhedens indstillinger, kan Apple sende mig samlede nedbrudsrapporter med enhedsmodel, iOS-version og et stakspor. De indeholder hverken navn, e-mail, indhold eller et blivende id, og jeg kan ikke bruge dem til at kontakte dig."),
    ("Køb", "Køb håndteres af Apple. Jeg får salgstal og opgørelser på landeniveau — aldrig dine kortoplysninger, din adresse eller din e-mail."),
    ("Børn", "Appen er henvendt til voksne, der skal tage jagttegn, og den indsamler ingen personoplysninger fra nogen — heller ikke fra en yngre bruger."),
    ("Dine rettigheder", "Da jeg ikke har personoplysninger om dig, er der normalt intet at udlevere eller slette. Har du skrevet til mig, ligger korrespondancen i min mailboks — sig til, og jeg sletter tråden. Du kan også klage til Datatilsynet."),
    ("Ændringer", "Ændrer politikken sig på en måde, der betyder noget, ændres datoen øverst, og den tidligere ordlyd kan fås ved henvendelse. Væsentlige ændringer nævnes også i appens udgivelsesnoter."),
]


# ---------------------------------------------------------------- home

hero = '''    <section class="hero">
      <div class="hero-media" data-parallax="1">
        <img class="moody" src="%s" alt="Rådyr på mark i morgenlys">
      </div>
      <div class="hero-fade-top"></div>
      <div class="hero-fade-side"></div>
      <div class="hero-inner">
        <h1>Gå til jagtprøven, når du er <span class="accent">helt sikker</span> i det.</h1>
        <div class="hero-cols">
          <p class="hero-lede">Hele teorien, fuglekendingen og jagttiderne i én app — med en forklaring på hvert svar, så du forstår reglen i stedet for at gætte. <span class="muted">Øv i bussen, i skoven, uden dækning.</span></p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#app">Se hvad appen kan</a>
            <a class="btn btn-secondary" href="/support.html">Support</a>
          </div>
        </div>
        <div class="stats">
%s
        </div>
      </div>
    </section>''' % (commons("Metskits - Roe deer - Capreolus capreolus (4).jpg", 1800),
                      "\n".join('          <div><span class="v">%s</span><span class="k">%s</span></div>' % s for s in STATS))

disclaimer = '''    <section class="section">
      <div class="disclaimer rv">
        <strong>Uafhængig træningsapp</strong>
        <span>Jagtprøven er ikke tilknyttet Naturstyrelsen eller Miljøministeriet. Spørgsmålene er skrevet til appen ud fra det offentlige pensum — det er ikke prøvens egne spørgsmål.</span>
      </div>
    </section>'''

highlights = '''    <section class="section">
      <div class="highlights rv">
        <div class="highlight-card">
          <span class="headline">Hele teorien, ikke en stikprøve.</span>
          <span class="body">280 spørgsmål fordelt på alle syv emner, og våbenprøven som sin egen test, du kan tage igen og igen.</span>
        </div>
        <div class="highlight-card tint">
          <span class="headline">Fuglene, som prøven spørger til dem.</span>
          <span class="body">35 arter med kendetegn, kald og de arter de forveksles med — jagtbare og fredede side om side.</span>
        </div>
        <div class="highlight-card">
          <span class="headline">Du får at vide, hvor du er svag.</span>
          <span class="body">Appen følger din statistik emne for emne og peger på det, du taber point på — så du øver det rigtige inden prøven.</span>
        </div>
      </div>
    </section>'''

app_section = '''    <section class="section rule-top" id="app">
      <div class="section-inner rv" style="display:flex;flex-direction:column;gap:clamp(26px,5vh,54px)">
        <div class="app-top">
          <div class="app-copy-col" style="display:flex;flex-direction:column;gap:20px">
            <div class="app-meta">
              <img class="app-icon" src="/assets/app-icon.png" alt="Jagtprøven app-ikon" width="76" height="76">
              <div class="app-meta-text">
                <span class="platform">Jagttegn · iPhone og iPad</span>
                <span class="price">Ét engangskøb — ikke abonnement</span>
              </div>
            </div>
            <h2 class="app-title">Jagtprøven</h2>
            <p class="app-lede">280 spørgsmål, 35 fuglearter og 31 jagttider i én app — og en forklaring på hvert eneste svar.</p>
            <p class="app-copy">Du lærer ikke facit udenad. Hvert spørgsmål fortæller hvorfor svaret er rigtigt, så reglen bag sidder fast, når prøven stiller den på en ny måde.</p>
            <div class="app-actions">
              <span class="btn-placeholder">App Store-link følger</span>
              <a class="btn btn-outline" href="/privacy/">Privatliv</a>
              <a class="btn btn-outline" href="/support.html">Support</a>
            </div>
          </div>
          <div class="app-shots">
            <img class="app-shot" src="/assets/screenshot-quiz.png" alt="Skærmbillede af et quizspørgsmål i Jagtprøven" loading="lazy">
            <img class="app-shot offset" src="/assets/screenshot-fuglekending.png" alt="Skærmbillede af fuglekending-listen i Jagtprøven" loading="lazy">
          </div>
        </div>
        <div class="feature-grid">
%s
        </div>
      </div>
    </section>''' % "\n".join('          <div><h3>%s</h3><p>%s</p></div>' % f for f in FEATURES)

topics_section = '''    <section class="section" style="background:linear-gradient(180deg, transparent, color-mix(in srgb, var(--card) 60%%, transparent) 45%%, transparent)">
      <div class="section-inner rv">
        <div class="topics-head">
          <h2>De syv emner</h2>
          <p>Appen holder øje med, hvilke emner du er svagest i, så du kan sætte ind præcis dér. Våbenprøven ligger derudover som en selvstændig test, du kan køre igen og igen.</p>
        </div>
        <div class="topics">
%s
        </div>
      </div>
    </section>''' % "\n".join('          <div class="topic"><span class="name">%s</span><span class="note">%s</span></div>' % t for t in TOPICS)

bird_cards = "\n".join(
    '            <div class="bird-card"><img src="%s" alt="%s" loading="lazy"><div class="info"><span class="name">%s</span><span class="confuse">Forveksles med %s</span><span class="status">%s</span></div></div>'
    % (commons(file), name, name, confuse, status) for name, file, confuse, status in BIRDS
)

birds_section = '''    <section class="section rule-top" style="margin-top:clamp(28px,5vh,60px);padding-top:clamp(40px,7vh,90px)">
      <div class="section-inner">
        <div class="split rv">
          <div class="split-copy">
            <span class="eyebrow">Den del, folk oftest dumper på</span>
            <h2>Fuglekending, art for art</h2>
            <p>35 arter med kendetegn, størrelse, levested og kald — og vigtigst: hvilke arter de forveksles med. Både de jagtbare og de fredede, for det er netop forskellen, prøven spørger til. Quizzen vender den om: du får kendetegnene og skal artsbestemme.</p>
          </div>
          <img src="%s" alt="Gråand, han og hun" loading="lazy">
        </div>
      </div>
      <div class="bird-rail rv">
%s
            <div class="bird-more">+ 31 arter mere i appen, jagtbare og fredede</div>
      </div>
    </section>''' % (commons("Anas platyrhynchos male female.jpg", 1200), bird_cards)

season_rows = "\n".join(
    '            <div class="season-row"><span class="name">%s</span><span class="meta"><span class="period">%s</span><span class="dot" style="background:%s"></span></span></div>'
    % (name, period, "var(--ok)" if open_ else "var(--muted)") for name, period, open_ in SEASONS
)

seasons_section = '''    <section class="section">
      <div class="section-inner split rv">
        <div class="split-copy">
          <h2>Jagttider, filtreret efter i dag</h2>
          <p>31 arter, som du kan filtrere efter, hvad der har åben jagttid lige nu, med noter om de lokale og regionale jagttider, der gælder for flere arter.</p>
          <div class="season-note">Jagttiderne i appen er vejledende og kan ikke bruges som juridisk opslagsværk. Slå altid op i den gældende bekendtgørelse, før du går på jagt.</div>
        </div>
        <div class="season-card">
          <div class="season-filters">
            <span class="pill on">Åben nu</span>
            <span class="pill off">Alle arter</span>
            <span class="pill off">Lokale tider</span>
          </div>
%s
          <div class="season-foot">Eksempel på visningen. Appen dækker 31 arter.</div>
        </div>
      </div>
    </section>''' % season_rows

bleed_geese = '''    <section class="bleed rule-top">
      <img class="moody" src="%s" alt="Grågæs i flugt over åbent land" loading="lazy">
      <div class="bleed-fade-top"></div>
      <div class="bleed-fade-side"></div>
      <div class="bleed-copy rv">
        <h2>Kend forskellen, før du løfter geværet.</h2>
        <p>Grågås, blisgås eller sædgås? Appen træner dig på kendetegnene, indtil du ser forskellen på afstand.</p>
      </div>
    </section>''' % commons("Grauwe gans - greylag goose - Anser anser.jpg", 1800)

free_trial = '''    <section class="section rule-top" style="background:linear-gradient(180deg, color-mix(in srgb, var(--card) 55%%, transparent), transparent 65%%)">
      <div class="section-inner split rv">
        <div class="split-copy">
          <h2 style="font-size:clamp(28px,4.4vw,60px)">Prøv det gratis først</h2>
          <p>Hele emnet “Sikkerhed på jagt” er frit tilgængeligt, sammen med fire fuglearter og fire jagttider. Kan du bruge appen, koster resten ét engangskøb — ikke et abonnement.</p>
        </div>
        <div class="free-grid">
%s
        </div>
      </div>
    </section>''' % "\n".join('          <div><span class="v">%s</span><span class="k">%s</span></div>' % f for f in FREE_ITEMS)

about_section = '''    <section class="section rule-top">
      <div class="section-inner split rv" style="align-items:start">
        <div class="about-photo">dit eget billede her — skrivebord, terræn eller dig selv</div>
        <div class="about-copy" style="display:flex;flex-direction:column;gap:16px">
          <h2>Hej — Webspind er mig alene.</h2>
          <p class="serif">Jagtprøven er min første app. Jeg har bygget den, fordi pensum til jagttegnsprøven ligger spredt ud over hæfter, hjemmesider og bekendtgørelser — og fordi fuglekending er nærmest umulig at øve på papir.</p>
          <p class="serif" style="color:var(--muted)">Jeg skriver spørgsmålene, tegner interfacet, retter fejlene og læser supportmailen. Derfor er support en rigtig side her og ikke en formular, der ender ingen steder — skriver du, får du mig.</p>
          <div class="facts">
%s
            <a href="mailto:hej@webspind.com">hej@webspind.com</a>
          </div>
        </div>
      </div>
    </section>''' % "\n".join('            <div class="row"><span>%s</span><span>%s</span></div>' % f for f in FACTS)

final_cta = '''    <section class="cta-final rule-top">
      <div class="cta-final-inner rv">
        <h2>Start med at bestå sikkerhedsdelen.</h2>
        <p>Emnet “Sikkerhed på jagt” er gratis i appen — tag det, og se om formen passer dig, før du køber resten.</p>
        <div class="hero-actions">
          <span class="btn-placeholder">App Store-link følger</span>
          <a class="btn btn-outline" href="/support.html">Har du et spørgsmål?</a>
        </div>
      </div>
    </section>'''

home = "\n\n".join([hero, disclaimer, highlights, app_section, topics_section, birds_section,
                     seasons_section, bleed_geese, free_trial, about_section, final_cta])

page("/", "Webspind — Jagtprøven, uden gætteri",
     "Jagtprøven: hele teorien, fuglekending og jagttider i én app, med en forklaring på hvert svar. Uafhængig træningsapp til iPhone og iPad.",
     home)

# ---------------------------------------------------------------- support

contact_cards = '''      <div class="contact-grid rv">
        <a class="contact-card" href="mailto:support@webspind.com">
          <span class="label">E-mail</span>
          <span class="value link">support@webspind.com</span>
        </a>
        <div class="contact-card">
          <span class="label">Svartid</span>
          <span class="value">Inden for 2 hverdage</span>
        </div>
        <div class="contact-card">
          <span class="label">Refusion</span>
          <span class="value">Håndteres af Apple</span>
        </div>
      </div>'''

support_form = '''      <div class="support-form rv">
        <h2>Send en besked</h2>
        <div class="form-grid">
          <label class="field">Hvad handler det om
            <select data-field-subject>
              <option>Vælg…</option>
              <option>Jagtprøven — fejl i appen</option>
              <option>Jagtprøven — køb eller gendannelse</option>
              <option>Jagtprøven — fejl i et spørgsmål</option>
              <option>Forslag til appen</option>
              <option>Andet</option>
            </select>
          </label>
          <label class="field">Din e-mail
            <input type="email" placeholder="dig@eksempel.dk" data-field-email>
          </label>
        </div>
        <label class="field">Hvad skete der
          <textarea rows="5" placeholder="Model og iOS-version, hvad du gjorde, og hvad du forventede." data-field-body></textarea>
        </label>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" data-send-mail>Åbn i dit mailprogram</button>
          <span class="note">Intet gemmes her — den skriver bare mailen for dig.</span>
        </div>
      </div>'''

faq_html = '''      <div style="display:flex;flex-direction:column;gap:12px">
        <h2 style="font-size:clamp(22px,2.8vw,30px)">Ofte stillede spørgsmål</h2>
        <div class="faq rv">
%s
        </div>
      </div>''' % "\n".join(
    '          <details><summary>%s</summary><p class="answer">%s</p></details>' % f for f in FAQS
)

urgent = '''      <div class="urgent rv">
        <span class="head">Noget der ikke kan vente?</span>
        <span class="body">Skal du til prøve i morgen, eller mistede appen dine data? Skriv “hastende” i emnefeltet. Dem svarer jeg på samme dag, når jeg ikke er på farten.</span>
      </div>'''

support_body = '''    <div class="support-page">
      <div class="page-head">
        <h1>Support</h1>
        <p>Skriv direkte til mig. Jeg læser alle beskeder og svarer inden for to hverdage, på dansk eller engelsk. Skriv hvilken iPhone og iOS-version du har, og hvad der skete — det sparer os begge en runde.</p>
      </div>
%s
%s
%s
%s
    </div>''' % (contact_cards, support_form, faq_html, urgent)

page("/support.html", "Support — Webspind",
     "Support til Jagtprøven. Skriv direkte til mig, jeg svarer inden for to hverdage.",
     support_body, current="support")

# ---------------------------------------------------------------- privacy index

priv_index_body = '''    <div class="support-page">
      <div class="page-head">
        <h1>Privatliv</h1>
        <p>Én politik pr. app, som Apple kræver det. Den korte version er den samme for dem alle: der indsamles ingenting.</p>
      </div>
      <div class="contact-grid rv">
        <a class="priv-card" href="/privacy/jagtproven.html">
          <span class="name">Jagtprøven</span>
          <span class="desc">Ingen data indsamles. Ingen konti, ingen analyse, ingen netværkskald. Alt bliver på din enhed.</span>
          <span class="go">Læs politikken →</span>
        </a>
      </div>
    </div>'''

page("/privacy/", "Privatliv — Webspind",
     "Privatlivspolitikker for Webspinds apps.", priv_index_body, current="privacy")

# ---------------------------------------------------------------- jagtproven policy

policy_body = '''    <div class="policy">
      <div class="page-head" style="gap:12px">
        <h1>Privatlivspolitik — Jagtprøven</h1>
        <p class="updated">Senest opdateret 1. september 2026 · gælder Jagtprøven til iOS</p>
      </div>
      <p class="intro">Jagtprøven indsamler ingen personoplysninger. Denne side findes, så du kan efterprøve den påstand i detaljer — og fordi Apple kræver et link til en privatlivspolitik for hver app i App Store.</p>
      <div class="policy-sections">
%s
      </div>
      <div class="policy-contact">Spørgsmål til politikken, eller vil du have noget slettet? Skriv til <a href="mailto:privatliv@webspind.com">privatliv@webspind.com</a>, så svarer jeg inden for to hverdage.</div>
    </div>''' % "\n".join('        <div><h2>%s</h2><p>%s</p></div>' % s for s in POLICY_SECTIONS)

page("/privacy/jagtproven.html", "Jagtprøven Privatlivspolitik — Webspind",
     "Privatlivspolitik for Jagtprøven til iOS. Der indsamles ingen personoplysninger.",
     policy_body, current="privacy")

# ---------------------------------------------------------------- support (legacy alias kept out of nav)

# ---------------------------------------------------------------- 404

nf = '''    <div class="center-page">
      <img src="%s" alt="" width="52" height="52" style="opacity:.6">
      <h1>404</h1>
      <p>Den sti fører ikke nogen steder hen.</p>
      <p><a class="btn btn-secondary" href="/">Tilbage til Webspind</a></p>
    </div>''' % LOGO

page("/404.html", "Ikke fundet — Webspind", "Siden findes ikke.", nf)
