# -*- coding: utf-8 -*-
"""Generates the static pages so the shared header/footer/scripts stay
identical. Output is plain HTML — nothing is needed at serve time.

Two trees come out of one string table: Danish at "/" and English at
"/en/". Everything a visitor reads lives in LANG below — the builders take
that dict and only lay it out — so a copy change is a one-line edit in one
place. Which tree a visitor lands in is decided by site.js from
navigator.language, with the DA/EN switch in the header overriding it.

Design: "Webspind v2" (claude.ai/design project) — Bricolage Grotesque +
Instrument Sans + Newsreader, warm paper palette. See styles.css for the
whole visual system."""
import io, os

LOGO = "/favicon.svg"

# Nav is (path, key); the label comes from LANG[lang]["nav"][key]. The paths
# are Danish-tree paths — P() prefixes them with /en for the English tree.
NAV = [("/#apps", "apps"), ("/#games", "games"),
       ("/support.html", "support"), ("/privacy/", "privacy")]

FONT_LINKS = '''<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap" rel="stylesheet">'''

# Section tints are inline so they stay next to the section they belong to.
# Kept as constants because the % signs would otherwise need escaping in
# every format string that carries them.
TINT_MID = 'style="background:linear-gradient(180deg, transparent, color-mix(in srgb, var(--card) 60%, transparent) 45%, transparent)"'
TINT_TOP = 'style="background:linear-gradient(180deg, color-mix(in srgb, var(--card) 55%, transparent), transparent 65%)"'


# ---------------------------------------------------------------- strings

LANG = {

"da": {
  "locale": "da_DK",

  "nav": {"apps": "Apps", "games": "Spil", "support": "Support", "privacy": "Privatliv"},
  "nav_contact": "Skriv til mig",
  "footer_meta": "© 2026 Webspind · Danmark",
  "footer_home": "Forsiden",
  "footer_privacy": "Privatliv",
  "footer_email": "E-mail",

  # ---- home
  "home_title": "Webspind — apps og spil fra Danmark",
  "home_desc": "Webspind er et uafhængigt studie i Danmark. Apps og spil der virker offline, ikke kræver en konto og ikke sporer dig. Første app: Jagtprøven til iPhone og iPad.",
  "home_eyebrow": "Uafhængigt studie · Danmark",
  "home_h1": 'Apps og spil fra <span class="accent">Webspind</span>.',
  "home_lede": "Jeg bygger apps og spil, der virker offline, ikke kræver en konto og ikke sporer dig — lavet af én person i Danmark.",
  "home_btn_apps": "Se apps",
  "home_btn_mail": "Skriv til mig",

  "apps_head": "Apps",
  "apps_sub": "Til iPhone og iPad. Offline-first, ingen konti, ingen sporing.",
  "games_head": "Spil",
  "games_sub": "Unity- og Roblox-projekter er undervejs.",
  "empty_head": "Intet udgivet endnu",
  "empty_body": "Projekterne er i gang. De dukker op her i samme øjeblik det første er klar.",

  "contact_head": "Support og privatliv, ét sted.",
  "contact_body": "Alt hvad jeg udgiver, har en rigtig supportside og en privatlivspolitik her — skrevet af mig, ikke en formular der ender ingen steder.",
  "contact_btn_support": "Support",
  "contact_btn_privacy": "Privatliv",

  # ---- app page
  "app_title": "Jagtprøven — hele teorien, uden gætteri | Webspind",
  "app_desc": "Jagtprøven: hele teorien, fuglekending og jagttider i én app, med en forklaring på hvert svar. Uafhængig træningsapp til iPhone og iPad.",
  "breadcrumb": "← Alle apps",
  "app_platform": "Jagttegn · iPhone og iPad",
  "app_price": "Ét engangskøb — ikke abonnement",
  "app_soon": "App Store-link følger",
  "app_h1": 'Gå til jagtprøven, når du er <span class="accent">helt sikker</span> i det.',
  "app_lede": 'Hele teorien, fuglekendingen og jagttiderne i én app — med en forklaring på hvert svar, så du forstår reglen i stedet for at gætte. <span class="muted">Øv i bussen, i skoven, uden dækning.</span>',
  "app_btn_features": "Se hvad appen kan",
  "app_shot_quiz": "Skærmbillede af et quizspørgsmål i Jagtprøven",
  "app_shot_birds": "Skærmbillede af fuglekending-listen i Jagtprøven",
  "app_icon_alt": "Jagtprøven app-ikon",

  "stats": [
    ("280", "spørgsmål med forklaring"),
    ("35", "fuglearter med kendetegn"),
    ("31", "arters jagttider"),
    ("7", "emner + våbenprøven"),
  ],

  "disclaimer_head": "Uafhængig træningsapp",
  "disclaimer_body": "Jagtprøven er ikke tilknyttet Naturstyrelsen eller Miljøministeriet. Spørgsmålene er skrevet til appen ud fra det offentlige pensum — det er ikke prøvens egne spørgsmål.",

  "highlights": [
    ("Hele teorien, ikke en stikprøve.", "280 spørgsmål fordelt på alle syv emner, og våbenprøven som sin egen test, du kan tage igen og igen."),
    ("Fuglene, som prøven spørger til dem.", "35 arter med kendetegn, kald og de arter de forveksles med — jagtbare og fredede side om side."),
    ("Du får at vide, hvor du er svag.", "Appen følger din statistik emne for emne og peger på det, du taber point på — så du øver det rigtige inden prøven."),
  ],

  "features_head": "Hvad du får",
  "features_sub": "Du lærer ikke facit udenad. Hvert spørgsmål fortæller hvorfor svaret er rigtigt, så reglen bag sidder fast, når prøven stiller den på en ny måde.",
  "features": [
    ("280 spørgsmål med forklaring", "Hvert eneste spørgsmål fortæller, hvorfor svaret er rigtigt. Du forstår reglen bag i stedet for at lære facit udenad."),
    ("Våbenprøven som egen test", "En selvstændig test du kan køre igen og igen, indtil kaliberkrav og våbenregler sidder fast."),
    ("Ser dine svage emner", "Appen følger din statistik pr. emne og peger på, hvor du taber point — så du øver det rigtige."),
    ("Øv hvor som helst", "Appen virker helt uden netforbindelse, så du kan tage en runde i bilen, i skjulet eller i pausen på arbejde."),
  ],

  "topics_head": "De syv emner",
  "topics_sub": "Appen holder øje med, hvilke emner du er svagest i, så du kan sætte ind præcis dér. Våbenprøven ligger derudover som en selvstændig test, du kan køre igen og igen.",
  "topics": [
    ("Sikkerhed på jagt", "gratis"),
    ("Våben og ammunition", "+ våbenprøve"),
    ("Jagtret og lovgivning", ""),
    ("Vildtpleje og naturforvaltning", ""),
    ("Pattedyr", ""),
    ("Fugle", "+ fuglekending"),
    ("Jagtformer", ""),
  ],

  "seasons_head": "Jagttider, filtreret efter i dag",
  "seasons_sub": "31 arter, som du kan filtrere efter, hvad der har åben jagttid lige nu, med noter om de lokale og regionale jagttider, der gælder for flere arter.",
  "seasons_note": "Jagttiderne i appen er vejledende og kan ikke bruges som juridisk opslagsværk. Slå altid op i den gældende bekendtgørelse, før du går på jagt.",
  "seasons_pills": ("Åben nu", "Alle arter", "Lokale tider"),
  "seasons": [
    ("Gråand", "1. sep – 31. dec", True),
    ("Fasan", "1. okt – 31. jan", False),
    ("Ringdue", "1. sep – 31. jan", True),
    ("Grågås", "1. sep – 31. dec", True),
    ("Rådyr, buk", "16. maj – 15. jul", False),
  ],
  "seasons_foot": "Eksempel på visningen. Appen dækker 31 arter.",

  "free_head": "Prøv det gratis først",
  "free_sub": "Hele emnet “Sikkerhed på jagt” er frit tilgængeligt, sammen med fire fuglearter og fire jagttider. Kan du bruge appen, koster resten ét engangskøb — ikke et abonnement.",
  "free_items": [
    ("Sikkerhed på jagt", "hele emnet gratis"),
    ("4 fuglearter", "med kendetegn og quiz"),
    ("4 jagttider", "til at prøve visningen"),
  ],

  "about_photo": "dit eget billede her — skrivebord, terræn eller dig selv",
  "about_head": "Hej — Webspind er mig alene.",
  "about_p1": "Jagtprøven er min første app. Jeg har bygget den, fordi pensum til jagttegnsprøven ligger spredt ud over hæfter, hjemmesider og bekendtgørelser — og fordi fuglekending er nærmest umulig at øve på papir.",
  "about_p2": "Jeg skriver spørgsmålene, tegner interfacet, retter fejlene og læser supportmailen. Derfor er support en rigtig side her og ikke en formular, der ender ingen steder — skriver du, får du mig.",
  "facts": [
    ("Studie", "Webspind, Danmark"),
    ("Folk", "Én"),
    ("Udgivet", "Jagtprøven, første app"),
    ("Support", "Mig, inden for 2 hverdage"),
  ],

  "cta_head": "Start med at bestå sikkerhedsdelen.",
  "cta_body": "Emnet “Sikkerhed på jagt” er gratis i appen — tag det, og se om formen passer dig, før du køber resten.",
  "cta_btn": "Har du et spørgsmål?",

  # ---- support
  "support_title": "Support — Webspind",
  "support_desc": "Support til Jagtprøven. Skriv direkte til mig, jeg svarer inden for to hverdage.",
  "support_head": "Support",
  "support_lede": "Skriv direkte til mig. Jeg læser alle beskeder og svarer inden for to hverdage, på dansk eller engelsk. Skriv hvilken iPhone og iOS-version du har, og hvad der skete — det sparer os begge en runde.",
  "support_cards": [("E-mail", "support@webspind.com"), ("Svartid", "Inden for 2 hverdage"), ("Refusion", "Håndteres af Apple")],
  "form_head": "Send en besked",
  "form_subject_label": "Hvad handler det om",
  "form_subject_placeholder": "Vælg…",
  "form_subject_options": ["Jagtprøven — fejl i appen", "Jagtprøven — køb eller gendannelse",
                            "Jagtprøven — fejl i et spørgsmål", "Forslag til appen", "Andet"],
  "form_email_label": "Din e-mail",
  "form_email_ph": "dig@eksempel.dk",
  "form_body_label": "Hvad skete der",
  "form_body_ph": "Model og iOS-version, hvad du gjorde, og hvad du forventede.",
  "form_send": "Åbn i dit mailprogram",
  "form_note": "Intet gemmes her — den skriver bare mailen for dig.",
  "faq_head": "Ofte stillede spørgsmål",
  "faqs": [
    ("Er det prøvens rigtige spørgsmål?", "Nej. Spørgsmålene er skrevet til appen ud fra det offentlige pensum til jagttegnsprøven. Appen er en uafhængig træningsapp og er ikke tilknyttet Naturstyrelsen eller Miljøministeriet."),
    ("Kan jeg bruge jagttiderne, når jeg er på jagt?", "Brug dem til at øve. Jagttiderne i appen er vejledende og er ikke et juridisk opslagsværk — slå altid op i den gældende bekendtgørelse, før du går ud. Flere arter har desuden lokale og regionale jagttider, som appen kun noterer."),
    ("Hvad kan jeg prøve gratis?", "Hele emnet “Sikkerhed på jagt”, fire fuglearter og fire jagttider. Resten låses op med ét engangskøb, ikke et abonnement."),
    ("Hvordan får jeg mit køb tilbage på en ny telefon?", "Åbn appen, gå til Indstillinger og tryk Gendan køb. Købet hænger på din Apple-konto, så det er nok at være logget ind med den samme. Sker der intet, så skriv til mig med købsdatoen, så ordner jeg det."),
    ("Gemmer appen mine besvarelser et sted?", "Kun på din egen telefon. Der er ingen brugerkonto og ingen server hos mig, så din statistik og dine favoritfugle forlader ikke enheden."),
    ("Jeg mener, et svar er forkert", "Skriv hvilket spørgsmål det er, og hvad du mener er galt, gerne med henvisning. Pensum ændrer sig, og jeg retter hurtigt — det er mig selv, der læser mailen."),
  ],
  "urgent_head": "Noget der ikke kan vente?",
  "urgent_body": "Skal du til prøve i morgen, eller mistede appen dine data? Skriv “hastende” i emnefeltet. Dem svarer jeg på samme dag, når jeg ikke er på farten.",

  # ---- privacy index
  "priv_title": "Privatliv — Webspind",
  "priv_desc": "Privatlivspolitikker for Webspinds apps.",
  "priv_head": "Privatliv",
  "priv_lede": "Én politik pr. app, som Apple kræver det. Den korte version er den samme for dem alle: der indsamles ingenting.",
  "priv_card_desc": "Ingen data indsamles. Ingen konti, ingen analyse, ingen netværkskald. Alt bliver på din enhed.",
  "priv_card_go": "Læs politikken →",
  "priv_card_note": "",

  # ---- 404
  "nf_body": "Den sti fører ikke nogen steder hen.",
  "nf_btn": "Tilbage til Webspind",
},

"en": {
  "locale": "en",

  "nav": {"apps": "Apps", "games": "Games", "support": "Support", "privacy": "Privacy"},
  "nav_contact": "Get in touch",
  "footer_meta": "© 2026 Webspind · Denmark",
  "footer_home": "Home",
  "footer_privacy": "Privacy",
  "footer_email": "Email",

  # ---- home
  "home_title": "Webspind — apps and games from Denmark",
  "home_desc": "Webspind is an independent studio in Denmark. Apps and games that work offline, need no account and track nothing. First app: Jagtprøven for iPhone and iPad.",
  "home_eyebrow": "Independent studio · Denmark",
  "home_h1": 'Apps and games from <span class="accent">Webspind</span>.',
  "home_lede": "I build apps and games that work offline, need no account and track nothing — made by one person in Denmark.",
  "home_btn_apps": "See the apps",
  "home_btn_mail": "Get in touch",

  "apps_head": "Apps",
  "apps_sub": "For iPhone and iPad. Offline first, no accounts, no tracking.",
  "games_head": "Games",
  "games_sub": "Unity and Roblox projects are in the works.",
  "empty_head": "Nothing published yet",
  "empty_body": "Projects are in progress. They'll appear here the moment the first one ships.",

  "contact_head": "Support and privacy, in one place.",
  "contact_body": "Everything I ship has a real support page and a privacy policy right here — written by me, not a form that goes nowhere.",
  "contact_btn_support": "Support",
  "contact_btn_privacy": "Privacy",

  # ---- app page
  "app_title": "Jagtprøven — the whole syllabus, no guesswork | Webspind",
  "app_desc": "Jagtprøven: the whole syllabus, bird identification and hunting seasons in one app, with an explanation behind every answer. An independent practice app for the Danish hunting licence exam, for iPhone and iPad.",
  "breadcrumb": "← All apps",
  "app_platform": "Hunting licence · iPhone and iPad",
  "app_price": "One-time purchase, not a subscription",
  "app_soon": "Coming to the App Store",
  "app_h1": 'Walk into the exam <span class="accent">completely sure</span> of it.',
  "app_lede": 'The whole syllabus, the bird identification and the hunting seasons in one app — with an explanation behind every answer, so you understand the rule instead of guessing. <span class="muted">Practise on the bus, in the woods, with no signal.</span>',
  "app_btn_features": "See what the app does",
  "app_shot_quiz": "Screenshot of a quiz question in Jagtprøven",
  "app_shot_birds": "Screenshot of the bird identification list in Jagtprøven",
  "app_icon_alt": "Jagtprøven app icon",

  "stats": [
    ("280", "questions, each explained"),
    ("35", "bird species with field marks"),
    ("31", "species' hunting seasons"),
    ("7", "topics + the firearms test"),
  ],

  "disclaimer_head": "Independent practice app",
  "disclaimer_body": "Jagtprøven is not affiliated with the Danish Nature Agency or the Ministry of the Environment. The questions were written for the app from the public syllabus — they are not the exam's own questions.",

  "highlights": [
    ("The whole syllabus, not a sample.", "280 questions across all seven topics, plus the firearms test as a test of its own that you can retake as often as you like."),
    ("The birds, the way the exam asks about them.", "35 species with field marks, calls and the species they get confused with — game and protected side by side."),
    ("You find out where you are weak.", "The app tracks your stats topic by topic and points at what is costing you points — so you practise the right thing before the exam."),
  ],

  "features_head": "What you get",
  "features_sub": "You don't memorise the answer key. Every question tells you why the answer is right, so the rule behind it sticks when the exam asks it a different way.",
  "features": [
    ("280 questions, each explained", "Every single question tells you why the answer is right. You understand the rule behind it instead of memorising the answer key."),
    ("The firearms test on its own", "A standalone test you can run again and again until calibre requirements and firearms rules stick."),
    ("Spots your weak topics", "The app tracks your stats per topic and points at where you are losing points — so you practise the right thing."),
    ("Practise anywhere", "The app works with no connection at all, so you can take a round in the car, in the hide or on your break at work."),
  ],

  "topics_head": "The seven topics",
  "topics_sub": "The app keeps track of which topics you are weakest in, so you can put the work exactly there. The firearms test sits alongside them as a standalone test you can run again and again.",
  "topics": [
    ("Hunting safety", "free"),
    ("Firearms and ammunition", "+ firearms test"),
    ("Hunting rights and legislation", ""),
    ("Game management and conservation", ""),
    ("Mammals", ""),
    ("Birds", "+ bird ID"),
    ("Hunting methods", ""),
  ],

  "seasons_head": "Hunting seasons, filtered by today",
  "seasons_sub": "31 species you can filter by what is open right now, with notes on the local and regional seasons that apply to several of them.",
  "seasons_note": "The seasons in the app are for guidance and cannot be used as a legal reference. Always check the current statutory order before you go hunting.",
  "seasons_pills": ("Open now", "All species", "Local seasons"),
  "seasons": [
    ("Mallard", "1 Sep – 31 Dec", True),
    ("Pheasant", "1 Oct – 31 Jan", False),
    ("Wood pigeon", "1 Sep – 31 Jan", True),
    ("Greylag goose", "1 Sep – 31 Dec", True),
    ("Roe deer, buck", "16 May – 15 Jul", False),
  ],
  "seasons_foot": "An example of the view. The app covers 31 species.",

  "free_head": "Try it free first",
  "free_sub": "The whole “Hunting safety” topic is free, along with four bird species and four hunting seasons. If the app works for you, the rest is one purchase — not a subscription.",
  "free_items": [
    ("Hunting safety", "the whole topic, free"),
    ("4 bird species", "with field marks and quiz"),
    ("4 hunting seasons", "to try the view"),
  ],

  "about_photo": "your own photo here — desk, terrain or you",
  "about_head": "Hi — Webspind is just me.",
  "about_p1": "Jagtprøven is my first app. I built it because the syllabus for the Danish hunting licence exam is scattered across booklets, websites and statutory orders — and because bird identification is next to impossible to practise on paper.",
  "about_p2": "I write the questions, draw the interface, fix the bugs and read the support mail. That is why support here is a real page and not a form that goes nowhere — write, and you get me.",
  "facts": [
    ("Studio", "Webspind, Denmark"),
    ("People", "One"),
    ("Shipped", "Jagtprøven, the first app"),
    ("Support", "Me, within 2 working days"),
  ],

  "cta_head": "Start by passing the safety part.",
  "cta_body": "The “Hunting safety” topic is free in the app — take it and see whether the format suits you before you buy the rest.",
  "cta_btn": "Got a question?",

  # ---- support
  "support_title": "Support — Webspind",
  "support_desc": "Support for Jagtprøven. Write straight to me, I answer within two working days.",
  "support_head": "Support",
  "support_lede": "Write straight to me. I read every message and answer within two working days, in English or Danish. Tell me which iPhone and iOS version you have and what happened — it saves us both a round trip.",
  "support_cards": [("Email", "support@webspind.com"), ("Response time", "Within 2 working days"), ("Refunds", "Handled by Apple")],
  "form_head": "Send a message",
  "form_subject_label": "What is it about",
  "form_subject_placeholder": "Choose…",
  "form_subject_options": ["Jagtprøven — a bug in the app", "Jagtprøven — purchase or restore",
                            "Jagtprøven — a mistake in a question", "A suggestion for the app", "Something else"],
  "form_email_label": "Your email",
  "form_email_ph": "you@example.com",
  "form_body_label": "What happened",
  "form_body_ph": "Your model and iOS version, what you did, and what you expected.",
  "form_send": "Open in your mail app",
  "form_note": "Nothing is stored here — it just writes the email for you.",
  "faq_head": "Frequently asked questions",
  "faqs": [
    ("Are these the real exam questions?", "No. The questions were written for the app from the public syllabus for the Danish hunting licence exam. The app is an independent practice app and is not affiliated with the Danish Nature Agency or the Ministry of the Environment."),
    ("Can I use the hunting seasons while I am out hunting?", "Use them to practise. The seasons in the app are for guidance and are not a legal reference — always check the current statutory order before you head out. Several species also have local and regional seasons, which the app only notes."),
    ("What can I try for free?", "The whole “Hunting safety” topic, four bird species and four hunting seasons. The rest unlocks with a single one-time purchase, not a subscription."),
    ("How do I get my purchase back on a new phone?", "Open the app, go to Settings and tap Restore purchases. The purchase is tied to your Apple account, so being signed in with the same one is enough. If nothing happens, write to me with the purchase date and I will sort it out."),
    ("Does the app store my answers anywhere?", "Only on your own phone. There is no user account and no server at my end, so your stats and your favourite birds never leave the device."),
    ("I think an answer is wrong", "Tell me which question it is and what you think is off, ideally with a reference. The syllabus changes and I fix things quickly — I am the one reading the mail."),
  ],
  "urgent_head": "Something that cannot wait?",
  "urgent_body": "Exam tomorrow, or the app lost your data? Put “urgent” in the subject field. I answer those the same day, when I am not on the road.",

  # ---- privacy index
  "priv_title": "Privacy — Webspind",
  "priv_desc": "Privacy policies for Webspind's apps.",
  "priv_head": "Privacy",
  "priv_lede": "One policy per app, the way Apple requires it. The short version is the same for all of them: nothing is collected.",
  "priv_card_desc": "No data is collected. No accounts, no analytics, no network calls. Everything stays on your device.",
  "priv_card_go": "Read the policy →",
  "priv_card_note": "The policy itself is in Danish — Jagtprøven is a Danish-only app. Write to me if you need it in English.",

  # ---- 404
  "nf_body": "That path does not lead anywhere.",
  "nf_btn": "Back to Webspind",
},

}

# One entry per app. A second app is a dict here plus a policy page — the
# Apps section on the homepage is built from this list, not hand-written.
APPS = [
    {
        "href": "/jagtproven/",
        "icon": "/assets/app-icon.png",
        "name": "Jagtprøven",
        "meta": {"da": "Jagttegn · iPhone og iPad", "en": "Hunting licence · iPhone and iPad"},
        "pitch": {
            "da": "280 spørgsmål, 35 fuglearter og 31 jagttider i én app — med en forklaring på hvert eneste svar.",
            "en": "280 questions, 35 bird species and 31 hunting seasons in one app — with an explanation behind every single answer.",
        },
        "badge": {"da": "App Store-link følger", "en": "Coming to the App Store"},
        "more": {"da": "Læs mere →", "en": "Read more →"},
    },
]

# No games published yet — an empty list renders the .empty state below.
GAMES = []

# The Jagtprøven policy is Danish only: the app ships in Danish, and this is
# the legal text Apple links to. The English privacy index points at it with
# a note (priv_card_note).
POLICY_SECTIONS = [
    ("Hvad indsamles", "Ingenting. Der er ingen brugerkonto, intet reklame-id, ingen fingerprinting og ingen tredjeparts analyseværktøjer i appen. Jeg ved ikke, hvem du er, eller at du har åbnet den."),
    ("Hvor dine data ligger", "Din statistik, dine favoritfugle og dine besvarelser gemmes på din egen enhed. Webspind driver ingen server, og der findes ingen kopi hos mig. Tager du en backup via iCloud, ligger den i din egen konto, som kun du har adgang til."),
    ("Nedbrudsrapporter", "Har du slået deling med udviklere til i enhedens indstillinger, kan Apple sende mig samlede nedbrudsrapporter med enhedsmodel, iOS-version og et stakspor. De indeholder hverken navn, e-mail, indhold eller et blivende id, og jeg kan ikke bruge dem til at kontakte dig."),
    ("Køb", "Køb håndteres af Apple. Jeg får salgstal og opgørelser på landeniveau — aldrig dine kortoplysninger, din adresse eller din e-mail."),
    ("Børn", "Appen er henvendt til voksne, der skal tage jagttegn, og den indsamler ingen personoplysninger fra nogen — heller ikke fra en yngre bruger."),
    ("Dine rettigheder", "Da jeg ikke har personoplysninger om dig, er der normalt intet at udlevere eller slette. Har du skrevet til mig, ligger korrespondancen i min mailboks — sig til, og jeg sletter tråden. Du kan også klage til Datatilsynet."),
    ("Ændringer", "Ændrer politikken sig på en måde, der betyder noget, ændres datoen øverst, og den tidligere ordlyd kan fås ved henvendelse. Væsentlige ændringer nævnes også i appens udgivelsesnoter."),
]


# ---------------------------------------------------------------- shell

def P(lang, path):
    """Danish-tree path -> the same path in the tree for `lang`."""
    return path if lang == "da" else "/en" + path


def header(lang, current=None, switch=None):
    L = LANG[lang]
    links = "".join(
        '\n        <a href="%s"%s>%s</a>' % (P(lang, h), ' aria-current="page"' if k == current else "", L["nav"][k])
        for h, k in NAV)
    da_href, en_href = switch or ("/", "/en/")
    switch = ('\n        <span class="lang-switch">'
              '<a href="%s" data-lang="da"%s>DA</a>'
              '<span aria-hidden="true">|</span>'
              '<a href="%s" data-lang="en"%s>EN</a>'
              '</span>') % (da_href, ' aria-current="true"' if lang == "da" else "",
                            en_href, ' aria-current="true"' if lang == "en" else "")
    return '''<header class="site-header">
    <div class="wrap">
      <a class="brand" href="%s">
        <img src="%s" alt="" width="28" height="28">
        <span>Webspind</span>
      </a>
      <nav class="nav" aria-label="Main">%s%s
        <a class="contact" href="mailto:hej@webspind.com">%s</a>
      </nav>
    </div>
    <div class="progress-track"><div class="progress-bar" data-progress="1"></div></div>
  </header>''' % (P(lang, "/"), LOGO, links, switch, L["nav_contact"])


def footer(lang):
    L = LANG[lang]
    return '''<footer class="site-footer">
    <div class="wrap">
      <div class="footer-top">
        <span class="footer-brand"><img src="%s" alt="">%s</span>
        <span class="footer-links">
          <a href="%s">%s</a>
          <a href="%s">%s</a>
          <a href="mailto:hej@webspind.com">%s</a>
        </span>
      </div>
    </div>
  </footer>''' % (LOGO, L["footer_meta"], P(lang, "/"), L["footer_home"],
                  P(lang, "/privacy/"), L["footer_privacy"], L["footer_email"])


def page(path, title, desc, body, lang="da", current=None, twin=None,
         switch=None, redirect=True):
    """Write one page. `twin` is the (danish, english) URL pair for the
    hreflang alternates; pages with no twin (the Danish-only policy, the
    bilingual 404) pass redirect=False so site.js leaves them alone.
    `switch` overrides where the DA | EN header links point when a page has
    no real translation — the Danish policy sends EN readers to the English
    privacy index, which is not the same thing as an hreflang alternate."""
    alts = ""
    if twin:
        alts = ('\n  <link rel="alternate" hreflang="da" href="https://webspind.com%s">'
                '\n  <link rel="alternate" hreflang="en" href="https://webspind.com%s">'
                '\n  <link rel="alternate" hreflang="x-default" href="https://webspind.com%s">'
                ) % (twin[0], twin[1], twin[0])
    html = '''<!doctype html>
<html lang="%s"%s>
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
  <link rel="canonical" href="https://webspind.com%s">%s
  <meta property="og:title" content="%s">
  <meta property="og:description" content="%s">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="%s">
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
''' % (lang, "" if redirect else " data-nolang", title, desc, FONT_LINKS, path, alts,
       title, desc, LANG[lang]["locale"], path,
       header(lang, current, switch or twin), body, footer(lang))
    full = os.path.join(os.getcwd(), path.lstrip("/"))
    if path.endswith("/"):
        full = os.path.join(full, "index.html")
    os.makedirs(os.path.dirname(full), exist_ok=True)
    io.open(full, "w", encoding="utf-8").write(html)
    print("  wrote %-28s %6d bytes" % (path, len(html.encode("utf-8"))))


# ---------------------------------------------------------------- home

def hero_home(L, lang):
    return '''    <section class="hero hero-plain">
      <div class="hero-inner">
        <span class="eyebrow">%s</span>
        <h1>%s</h1>
        <div class="hero-cols">
          <p class="hero-lede">%s</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#apps">%s</a>
            <a class="btn btn-secondary" href="mailto:hej@webspind.com">%s</a>
          </div>
        </div>
      </div>
    </section>''' % (L["home_eyebrow"], L["home_h1"], L["home_lede"],
                     L["home_btn_apps"], L["home_btn_mail"])


def apps_section(L, lang):
    cards = "\n".join('''          <a class="app-card" href="%s">
            <span class="app-card-top">
              <img class="tile" src="%s" alt="" width="60" height="60">
              <span class="app-card-id">
                <span class="name">%s</span>
                <span class="meta">%s</span>
              </span>
            </span>
            <span class="pitch">%s</span>
            <span class="badge">%s</span>
            <span class="foot">%s</span>
          </a>''' % (P(lang, a["href"]), a["icon"], a["name"], a["meta"][lang],
                     a["pitch"][lang], a["badge"][lang], a["more"][lang]) for a in APPS)
    return '''    <section class="section rule-top" id="apps">
      <div class="section-inner rv">
        <div class="section-head">
          <h2>%s</h2>
          <p>%s</p>
        </div>
        <div class="card-grid">
%s
        </div>
      </div>
    </section>''' % (L["apps_head"], L["apps_sub"], cards)


def games_section(L, lang):
    # No games yet: the empty state below is the v1 markup (git ded7cbc),
    # retokenised for v2. When GAMES fills up it renders cards instead.
    if GAMES:
        body = '<div class="card-grid">\n%s\n        </div>' % ""
    else:
        body = '''<div class="empty">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2.4" y="7" width="19.2" height="11" rx="4.6"/>
            <path d="M7.6 11.2v3.6M5.8 13h3.6M15.6 12.1h.01M18 14.4h.01"/>
          </svg>
          <h3>%s</h3>
          <p>%s</p>
        </div>''' % (L["empty_head"], L["empty_body"])
    return '''    <section class="section" id="games">
      <div class="section-inner rv">
        <div class="section-head">
          <h2>%s</h2>
          <p>%s</p>
        </div>
        %s
      </div>
    </section>''' % (L["games_head"], L["games_sub"], body)


def contact_strip(L, lang):
    return '''    <section class="cta-final rule-top">
      <div class="cta-final-inner rv">
        <h2>%s</h2>
        <p>%s</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="%s">%s</a>
          <a class="btn btn-outline" href="%s">%s</a>
        </div>
      </div>
    </section>''' % (L["contact_head"], L["contact_body"],
                     P(lang, "/support.html"), L["contact_btn_support"],
                     P(lang, "/privacy/"), L["contact_btn_privacy"])


# ---------------------------------------------------------------- app page

def hero_app(L, lang):
    stats = "\n".join('          <div><span class="v">%s</span><span class="k">%s</span></div>' % s
                      for s in L["stats"])
    return '''    <section class="hero hero-plain">
      <div class="hero-inner">
        <div class="app-top">
          <div class="app-copy-col">
            <a class="breadcrumb" href="%s">%s</a>
            <div class="app-meta">
              <img class="app-icon" src="/assets/app-icon.png" alt="%s" width="76" height="76">
              <div class="app-meta-text">
                <span class="platform">%s</span>
                <span class="price">%s</span>
              </div>
            </div>
            <h1>%s</h1>
            <p class="hero-lede">%s</p>
            <div class="hero-actions">
              <span class="btn-placeholder">%s</span>
              <a class="btn btn-secondary" href="#app">%s</a>
            </div>
          </div>
          <div class="app-shots">
            <img class="app-shot" src="/assets/screenshot-quiz.png" alt="%s">
            <img class="app-shot offset" src="/assets/screenshot-fuglekending.png" alt="%s">
          </div>
        </div>
        <div class="stats">
%s
        </div>
      </div>
    </section>''' % (P(lang, "/#apps"), L["breadcrumb"], L["app_icon_alt"],
                     L["app_platform"], L["app_price"], L["app_h1"], L["app_lede"],
                     L["app_soon"], L["app_btn_features"],
                     L["app_shot_quiz"], L["app_shot_birds"], stats)


def disclaimer(L, lang):
    return '''    <section class="section">
      <div class="disclaimer rv">
        <strong>%s</strong>
        <span>%s</span>
      </div>
    </section>''' % (L["disclaimer_head"], L["disclaimer_body"])


def highlights(L, lang):
    cards = []
    for i, (headline, body) in enumerate(L["highlights"]):
        cls = "highlight-card tint" if i == 1 else "highlight-card"
        cards.append('        <div class="%s">\n          <span class="headline">%s</span>\n'
                     '          <span class="body">%s</span>\n        </div>' % (cls, headline, body))
    return '''    <section class="section">
      <div class="highlights rv">
%s
      </div>
    </section>''' % "\n".join(cards)


def app_section(L, lang):
    # The icon + screenshots that used to sit here now open the page, so this
    # section is the feature grid and its heading only.
    return '''    <section class="section rule-top" id="app">
      <div class="section-inner rv">
        <div class="section-head">
          <h2>%s</h2>
          <p>%s</p>
        </div>
        <div class="feature-grid">
%s
        </div>
      </div>
    </section>''' % (L["features_head"], L["features_sub"],
                     "\n".join('          <div><h3>%s</h3><p>%s</p></div>' % f for f in L["features"]))


def topics_section(L, lang):
    return '''    <section class="section" %s>
      <div class="section-inner rv">
        <div class="topics-head">
          <h2>%s</h2>
          <p>%s</p>
        </div>
        <div class="topics">
%s
        </div>
      </div>
    </section>''' % (TINT_MID, L["topics_head"], L["topics_sub"],
                     "\n".join('          <div class="topic"><span class="name">%s</span><span class="note">%s</span></div>' % t
                               for t in L["topics"]))


def seasons_section(L, lang):
    rows = "\n".join(
        '            <div class="season-row"><span class="name">%s</span><span class="meta"><span class="period">%s</span><span class="dot" style="background:%s"></span></span></div>'
        % (name, period, "var(--ok)" if open_ else "var(--muted)") for name, period, open_ in L["seasons"])
    p1, p2, p3 = L["seasons_pills"]
    return '''    <section class="section">
      <div class="section-inner split rv">
        <div class="split-copy">
          <h2>%s</h2>
          <p>%s</p>
          <div class="season-note">%s</div>
        </div>
        <div class="season-card">
          <div class="season-filters">
            <span class="pill on">%s</span>
            <span class="pill off">%s</span>
            <span class="pill off">%s</span>
          </div>
%s
          <div class="season-foot">%s</div>
        </div>
      </div>
    </section>''' % (L["seasons_head"], L["seasons_sub"], L["seasons_note"],
                     p1, p2, p3, rows, L["seasons_foot"])


def free_trial(L, lang):
    return '''    <section class="section rule-top" %s>
      <div class="section-inner split rv">
        <div class="split-copy">
          <h2 style="font-size:clamp(28px,4.4vw,60px)">%s</h2>
          <p>%s</p>
        </div>
        <div class="free-grid">
%s
        </div>
      </div>
    </section>''' % (TINT_TOP, L["free_head"], L["free_sub"],
                     "\n".join('          <div><span class="v">%s</span><span class="k">%s</span></div>' % f
                               for f in L["free_items"]))


def about_section(L, lang):
    return '''    <section class="section rule-top">
      <div class="section-inner split rv" style="align-items:start">
        <div class="about-photo">%s</div>
        <div class="about-copy" style="display:flex;flex-direction:column;gap:16px">
          <h2>%s</h2>
          <p class="serif">%s</p>
          <p class="serif" style="color:var(--muted)">%s</p>
          <div class="facts">
%s
            <a href="mailto:hej@webspind.com">hej@webspind.com</a>
          </div>
        </div>
      </div>
    </section>''' % (L["about_photo"], L["about_head"], L["about_p1"], L["about_p2"],
                     "\n".join('            <div class="row"><span>%s</span><span>%s</span></div>' % f
                               for f in L["facts"]))


def final_cta(L, lang):
    return '''    <section class="cta-final rule-top">
      <div class="cta-final-inner rv">
        <h2>%s</h2>
        <p>%s</p>
        <div class="hero-actions">
          <span class="btn-placeholder">%s</span>
          <a class="btn btn-outline" href="%s">%s</a>
        </div>
      </div>
    </section>''' % (L["cta_head"], L["cta_body"], L["app_soon"],
                     P(lang, "/support.html"), L["cta_btn"])


# ---------------------------------------------------------------- support

def support_body(L, lang):
    email, resp, refund = L["support_cards"]
    cards = '''      <div class="contact-grid rv">
        <a class="contact-card" href="mailto:%s">
          <span class="label">%s</span>
          <span class="value link">%s</span>
        </a>
        <div class="contact-card">
          <span class="label">%s</span>
          <span class="value">%s</span>
        </div>
        <div class="contact-card">
          <span class="label">%s</span>
          <span class="value">%s</span>
        </div>
      </div>''' % (email[1], email[0], email[1], resp[0], resp[1], refund[0], refund[1])

    # The placeholder option carries an empty value so site.js can test for
    # "nothing chosen" without knowing the language.
    options = '<option value="">%s</option>' % L["form_subject_placeholder"]
    options += "".join("\n              <option>%s</option>" % o for o in L["form_subject_options"])
    form = '''      <div class="support-form rv">
        <h2>%s</h2>
        <div class="form-grid">
          <label class="field">%s
            <select data-field-subject>
              %s
            </select>
          </label>
          <label class="field">%s
            <input type="email" placeholder="%s" data-field-email>
          </label>
        </div>
        <label class="field">%s
          <textarea rows="5" placeholder="%s" data-field-body></textarea>
        </label>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" data-send-mail>%s</button>
          <span class="note">%s</span>
        </div>
      </div>''' % (L["form_head"], L["form_subject_label"], options, L["form_email_label"],
                   L["form_email_ph"], L["form_body_label"], L["form_body_ph"],
                   L["form_send"], L["form_note"])

    faq = '''      <div style="display:flex;flex-direction:column;gap:12px">
        <h2 style="font-size:clamp(22px,2.8vw,30px)">%s</h2>
        <div class="faq rv">
%s
        </div>
      </div>''' % (L["faq_head"],
                   "\n".join('          <details><summary>%s</summary><p class="answer">%s</p></details>' % f
                             for f in L["faqs"]))

    urgent = '''      <div class="urgent rv">
        <span class="head">%s</span>
        <span class="body">%s</span>
      </div>''' % (L["urgent_head"], L["urgent_body"])

    return '''    <div class="support-page">
      <div class="page-head">
        <h1>%s</h1>
        <p>%s</p>
      </div>
%s
%s
%s
%s
    </div>''' % (L["support_head"], L["support_lede"], cards, form, faq, urgent)


# ---------------------------------------------------------------- privacy

def priv_index_body(L, lang):
    note = ('\n          <span class="desc">%s</span>' % L["priv_card_note"]) if L["priv_card_note"] else ""
    return '''    <div class="support-page">
      <div class="page-head">
        <h1>%s</h1>
        <p>%s</p>
      </div>
      <div class="contact-grid rv">
        <a class="priv-card" href="/privacy/jagtproven.html">
          <span class="name">Jagtprøven</span>
          <span class="desc">%s</span>%s
          <span class="go">%s</span>
        </a>
      </div>
    </div>''' % (L["priv_head"], L["priv_lede"], L["priv_card_desc"], note, L["priv_card_go"])


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


# ---------------------------------------------------------------- 404

# One page for both languages: GitHub Pages only ever serves /404.html, and
# there is nothing here worth a redirect.
nf_body = '''    <div class="center-page">
      <img src="%s" alt="" width="52" height="52" style="opacity:.6">
      <h1>404</h1>
      <p lang="da">%s</p>
      <p lang="en">%s</p>
      <p class="hero-actions" style="justify-content:center">
        <a class="btn btn-secondary" href="/" lang="da">%s</a>
        <a class="btn btn-secondary" href="/en/" lang="en">%s</a>
      </p>
    </div>''' % (LOGO, LANG["da"]["nf_body"], LANG["en"]["nf_body"],
                 LANG["da"]["nf_btn"], LANG["en"]["nf_btn"])


# ---------------------------------------------------------------- build

TWIN_HOME    = ("/", "/en/")
TWIN_APP     = ("/jagtproven/", "/en/jagtproven/")
TWIN_SUPPORT = ("/support.html", "/en/support.html")
TWIN_PRIVACY = ("/privacy/", "/en/privacy/")

for lang in ("da", "en"):
    L = LANG[lang]

    home = "\n\n".join([hero_home(L, lang), apps_section(L, lang),
                        games_section(L, lang), contact_strip(L, lang)])
    page(P(lang, "/"), L["home_title"], L["home_desc"], home, lang=lang, twin=TWIN_HOME)

    app = "\n\n".join([hero_app(L, lang), disclaimer(L, lang), highlights(L, lang),
                       app_section(L, lang), topics_section(L, lang), seasons_section(L, lang),
                       free_trial(L, lang), about_section(L, lang), final_cta(L, lang)])
    page(P(lang, "/jagtproven/"), L["app_title"], L["app_desc"], app,
         lang=lang, current="apps", twin=TWIN_APP)

    page(P(lang, "/support.html"), L["support_title"], L["support_desc"],
         support_body(L, lang), lang=lang, current="support", twin=TWIN_SUPPORT)

    page(P(lang, "/privacy/"), L["priv_title"], L["priv_desc"],
         priv_index_body(L, lang), lang=lang, current="privacy", twin=TWIN_PRIVACY)

# Danish only — the legal text for a Danish-only app. No twin, no redirect.
page("/privacy/jagtproven.html", "Jagtprøven Privatlivspolitik — Webspind",
     "Privatlivspolitik for Jagtprøven til iOS. Der indsamles ingen personoplysninger.",
     policy_body, lang="da", current="privacy",
     switch=("/privacy/jagtproven.html", "/en/privacy/"), redirect=False)

page("/404.html", "Ikke fundet / Not found — Webspind",
     "Siden findes ikke. / The page does not exist.", nf_body, lang="da", redirect=False)
