# -*- coding: utf-8 -*-
"""Generates the static pages so the shared header/footer/scripts stay
identical. Output is plain HTML — nothing is needed at serve time.

Two trees come out of one string table: Danish at "/" and English at
"/en/". Everything a visitor reads lives in LANG below — the builders take
that dict and only lay it out — so a copy change is a one-line edit in one
place. Which tree a visitor lands in is decided by site.js from
navigator.language, with the DA/EN switch in the header overriding it.

Design: "Showcase" (concept C, Oct 2026) — Inter, Apple-like light page,
real app screens in phone frames on tiles tinted with each app's colour.
See styles.css for the whole visual system.

Hand-written pages (the per-app policies and support pages under privacy/,
support/, en/, no/ and de/) keep their own <main>; reshell() at the bottom
re-wraps them in the current header and footer, so they never drift."""
import io, os, re, glob, json
from html import escape as esc

LOGO = "/favicon.svg"
# Webspind PDF lives in its own tree (/pdf/, built from ~/Projects/halfmil/products/pdfsite).
# English is /pdf/ and Danish is /pdf/da/, so its links do not go through P().
def pdf_href(lang):
    return "/pdf/da/" if lang == "da" else "/pdf/"
LINKEDIN = "https://dk.linkedin.com/in/jakobmunchbrandt"

def articles_href(lang):
    return "/artikler/" if lang == "da" else "/en/articles/"

FONT_LINKS = '''<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap" rel="stylesheet">'''

# Section tints are inline so they stay next to the section they belong to.
# Kept as constants because the % signs would otherwise need escaping in
# every format string that carries them.
TINT_MID = 'style="background:linear-gradient(180deg, transparent, color-mix(in srgb, var(--card) 60%, transparent) 45%, transparent)"'
TINT_TOP = 'style="background:linear-gradient(180deg, color-mix(in srgb, var(--card) 55%, transparent), transparent 65%)"'


# ---------------------------------------------------------------- strings

LANG = {

"da": {
  "locale": "da_DK",

  "nav": {"apps": "Apps", "tools": "Værktøjer", "articles": "Artikler", "about": "Om mig", "support": "Support", "privacy": "Privatliv", "pdf": "PDF-værktøjer",
          "files": "Filer på din enhed", "calc": "Beregnere", "tests": "Prøver", "quiz": "Jagtprøve-quiz", "seasons": "Jagttider i dag", "part107": "Part 107-prøvetest", "menu": "Menu"},
  "foot_help": "Hjælp",
  "foot_privacy_all": "Alle privatlivspolitikker",
  "foot_apps": "Privatliv og support pr. app",
  "foot_other_lang": ("/en/", "en", "English"),
  "legal": "© 2026 Jakob Munch-Brandt. Webspind er navnet, jeg udgiver under. Lavet i Danmark.",
  "lbl_privacy": "Privatliv",
  "lbl_support": "Support",
  "lbl_about_app": "Om appen",
  "lbl_store": "App Store",

  # ---- home
  "home_title": "Webspind — apps af Jakob Munch-Brandt",
  "home_desc": "Små iPhone-apps, lavet med omhu af Jakob Munch-Brandt i Danmark: vækkeuret Wakebird og Jagtprøven til jagttegnet. Næste app er DroneCamp.",
  "home_eyebrow": "Jakob Munch-Brandt · Danmark",
  "home_h1": "Små apps.<br><span>Lavet med omhu.</span>",
  "home_lede": "iPhone-apps med hvert sit udseende, alle designet og bygget af én person.",
  "home_btn_apps": "Se apps",
  "home_btn_mail": "Skriv til mig ›",
  "skip": "Spring til apps",
  "shelf_label": "Apps",
  "status": {"live": "I App Store", "review": "Til godkendelse", "soon": "Kommer snart"},
  "group_live": ("I App Store.", "Ude nu, til iPhone og iPad."),
  "group_review": ("På vej ud.", "Sendt til Apple. Ude, så snart den er godkendt."),
  "group_soon": ("Den næste.", "Den app, jeg gør færdig lige nu. Den er ikke ude endnu."),
  "screen_alt": "%s skærmbillede",
  "icon_alt": "%s app-ikon",
  "jakob_eyebrow": "Personen bag Webspind",
  "jakob_h": "Hej, jeg er Jakob <span>Munch&#8209;Brandt.</span>",
  "jakob_p": "Jeg laver hver eneste app her selv, fra første skitse til svaret på din supportmail. Intet team og intet bureau, så hver app får den tid, den skal bruge, og sit helt eget design.",
  "jakob_hi": "Hej fra Danmark.",
  "jakob_photo_alt": "Jakob Munch-Brandt",

  # ---- app page
  "app_title": "Jagtprøven — hele teorien, uden gætteri | Webspind",
  "app_desc": "Jagtprøven: hele teorien, fuglekending og jagttider i én app, med en forklaring på hvert svar. Uafhængig træningsapp til iPhone og iPad.",
  "breadcrumb": "← Alle apps",
  "app_platform": "Jagttegn · iPhone og iPad",
  "app_price": "Ét engangskøb — ikke abonnement",
  "app_store": "Hent i App Store",
  "app_h1": 'Gå til jagtprøven, når du er <span class="accent">helt sikker</span> i det.',
  "app_lede": 'Hele teorien, fuglekendingen og jagttiderne i én app — med en forklaring på hvert svar, så du forstår reglen i stedet for at gætte. <span class="muted">Øv i bussen, i skoven, uden dækning.</span>',
  "app_btn_features": "Se hvad appen kan",
  "app_shot_quiz": "Skærmbillede af et quizspørgsmål i Jagtprøven",
  "app_shot_birds": "Skærmbillede af fuglekending-listen i Jagtprøven",
  "app_icon_alt": "Jagtprøven app-ikon",

  "stats": [
    ("522", "spørgsmål med forklaring"),
    ("100", "vildtarter med foto"),
    ("41", "arters jagttider"),
    ("40", "spørgsmål i et prøvesæt på tid"),
  ],

  "disclaimer_head": "Uafhængig træningsapp",
  "disclaimer_body": "Jagtprøven er ikke tilknyttet Naturstyrelsen eller Miljøministeriet. Spørgsmålene er skrevet til appen ud fra det offentlige pensum — det er ikke prøvens egne spørgsmål.",

  "highlights": [
    ("Hele teorien, ikke en stikprøve.", "522 spørgsmål fordelt på alle otte emner og prøvens seks sektioner, og et prøvesæt på 40 spørgsmål og 30 minutter, som på dagen."),
    ("Arterne, som prøven spørger til dem.", "100 vildtarter med foto, kendetegn og de arter, de forveksles med — og en fotoquiz med tre arter fra samme gruppe."),
    ("Du får at vide, hvor du er svag.", "Appen følger din statistik emne for emne og peger på det, du taber point på — så du øver det rigtige inden prøven."),
  ],

  "features_head": "Hvad du får",
  "features_sub": "Du lærer ikke facit udenad. Hvert spørgsmål fortæller hvorfor svaret er rigtigt, så reglen bag sidder fast, når prøven stiller den på en ny måde.",
  "features": [
    ("522 spørgsmål med forklaring", "Hvert eneste spørgsmål fortæller, hvorfor svaret er rigtigt. Du forstår reglen bag i stedet for at lære facit udenad."),
    ("Prøvesæt under tid", "40 spørgsmål på 30 minutter, bestået ved 36 rigtige — nøjagtig som på dagen, med sektion for sektion bagefter."),
    ("Ser dine svage emner", "Appen følger din statistik pr. emne og peger på, hvor du taber point — så du øver det rigtige."),
    ("Øv hvor som helst", "Appen virker helt uden netforbindelse, så du kan tage en runde i bilen, i skjulet eller i pausen på arbejde."),
  ],

  "topics_head": "De otte emner",
  "topics_sub": "Appen holder øje med, hvilke emner du er svagest i, så du kan sætte ind præcis dér. Ét emne efter eget valg er gratis.",
  "topics": [
    ("Artsbestemmelse og vildtbiologi", "+ fotoquiz"),
    ("Vildtforvaltning", ""),
    ("Jagtvåben og ammunition", ""),
    ("Anden jagtlovgivning", ""),
    ("Håndtering af nedlagt vildt", ""),
    ("Jagtetik og etikette", ""),
    ("Jagtteknik og ledelse", ""),
    ("Sikkerhed og skudafgivelse", ""),
  ],

  "seasons_head": "Jagttider, filtreret efter i dag",
  "seasons_sub": "41 arter, som du kan filtrere efter, hvad der har åben jagttid lige nu, med noter om de lokale og regionale jagttider, der gælder for flere arter.",
  "seasons_note": "Jagttiderne i appen er vejledende og kan ikke bruges som juridisk opslagsværk. Slå altid op i den gældende bekendtgørelse, før du går på jagt.",
  "seasons_pills": ("Åben nu", "Alle arter", "Lokale tider"),
  "seasons": [
    ("Gråand", "1. sep – 31. dec", True),
    ("Fasan", "1. okt – 31. jan", False),
    ("Ringdue", "1. sep – 31. jan", True),
    ("Grågås", "1. sep – 31. dec", True),
    ("Rådyr, buk", "16. maj – 15. jul", False),
  ],
  "seasons_foot": "Eksempel på visningen. Appen dækker 41 arter.",

  "tools_head": "Prøv uden at hente noget",
  "tools_sub": "To gratis værktøjer her på siden, direkte i browseren.",
  "tools_items": [("Jagtprøve-quiz", "Øvespørgsmål med forklaring på hvert svar.", "/jagtproeve-quiz/"),
                  ("Hvad må jeg jage i dag?", "Se hvilke arter der har jagttid på en dato, også lokalt.", "/jagttider-i-dag/")],

  "free_head": "Prøv det gratis først",
  "free_sub": "Ét emne efter eget valg, ét fuldt prøvesæt, én dagens runde og otte vildtarter er gratis. Kan du bruge appen, koster resten ét engangskøb — ikke et abonnement.",
  "free_items": [
    ("Ét emne", "efter eget valg, så tit du vil"),
    ("Ét prøvesæt", "40 spørgsmål på 30 minutter"),
    ("8 vildtarter", "med foto og kendetegn"),
  ],

  "about_head": "Hej — Webspind er mig alene.",
  "about_p1": "Jagtprøven er min første app. Jeg har bygget den, fordi pensum til jagttegnsprøven ligger spredt ud over hæfter, hjemmesider og bekendtgørelser — og fordi fuglekending er nærmest umulig at øve på papir.",
  "about_p2": "Jeg skriver spørgsmålene, tegner interfacet, retter fejlene og læser supportmailen. Derfor er support en rigtig side her og ikke en formular, der ender ingen steder — skriver du, får du mig.",
  "facts": [
    ("Studie", "Webspind, Danmark"),
    ("Folk", "Én"),
    ("Udgivet", "Jagtprøven og Wakebird"),
    ("Support", "Mig, inden for 2 hverdage"),
  ],

  "cta_head": "Prøv et helt prøvesæt gratis.",
  "cta_body": "Et fuldt prøvesæt og ét emne efter eget valg er gratis i appen — tag dem, og se om formen passer dig, før du køber resten.",
  "cta_btn": "Har du et spørgsmål?",

  # ---- support
  "support_title": "Support — Webspind",
  "support_desc": "Support til Webspinds apps. Skriv direkte til mig, jeg svarer inden for to hverdage.",
  "support_head": "Support",
  "support_lede": "Skriv direkte til mig. Jeg læser alle beskeder og svarer inden for to hverdage, på dansk eller engelsk. Skriv hvilken iPhone og iOS-version du har, og hvad der skete — det sparer os begge en runde.",
  "support_cards": [("E-mail", "webspind@gmail.com"), ("Svartid", "Inden for 2 hverdage"), ("Refusion", "Håndteres af Apple")],
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
  "faq_head": "Jagtprøven: ofte stillede spørgsmål",
  "sup_apps_head": "Support pr. app",
  "sup_other": "%s — andet",
  "faqs": [
    ("Er det prøvens rigtige spørgsmål?", "Nej. Spørgsmålene er skrevet til appen ud fra det offentlige pensum til jagttegnsprøven. Appen er en uafhængig træningsapp og er ikke tilknyttet Naturstyrelsen eller Miljøministeriet."),
    ("Kan jeg bruge jagttiderne, når jeg er på jagt?", "Brug dem til at øve. Jagttiderne i appen er vejledende og er ikke et juridisk opslagsværk — slå altid op i den gældende bekendtgørelse, før du går ud. Flere arter har desuden lokale og regionale jagttider, som appen kun noterer."),
    ("Hvad kan jeg prøve gratis?", "Ét emne efter eget valg, ét fuldt prøvesæt, én dagens runde og otte vildtarter. Resten låses op med ét engangskøb, ikke et abonnement."),
    ("Hvordan får jeg mit køb tilbage på en ny telefon?", "Åbn appen, gå til Indstillinger og tryk Gendan køb. Købet hænger på din Apple-konto, så det er nok at være logget ind med den samme. Sker der intet, så skriv til mig med købsdatoen, så ordner jeg det."),
    ("Gemmer appen mine besvarelser et sted?", "På din telefon og i din egen private iCloud, så de følger med til en ny iPhone. Der er ingen brugerkonto og ingen server hos mig, og jeg kan ikke se dine svar."),
    ("Jeg mener, et svar er forkert", "Skriv hvilket spørgsmål det er, og hvad du mener er galt, gerne med henvisning. Pensum ændrer sig, og jeg retter hurtigt — det er mig selv, der læser mailen."),
  ],
  "urgent_head": "Noget der ikke kan vente?",
  "urgent_body": "Skal du til prøve i morgen, eller mistede appen dine data? Skriv “hastende” i emnefeltet. Dem svarer jeg på samme dag, når jeg ikke er på farten.",

  # ---- privacy index
  "priv_title": "Privatliv — Webspind",
  "priv_desc": "Privatlivspolitikker for Webspinds apps.",
  "priv_head": "Privatliv",
  "priv_lede": "Én politik pr. app, som Apple kræver det. Fælles for dem alle: ingen reklamer, ingen analyse og ingen server hos mig.",
  "priv_card_go": "Læs politikken →",

  # ---- 404
  "nf_body": "Den sti fører ikke nogen steder hen.",
  "nf_btn": "Tilbage til Webspind",
},

"en": {
  "locale": "en",

  "nav": {"apps": "Apps", "tools": "Tools", "articles": "Articles", "about": "About", "support": "Support", "privacy": "Privacy", "pdf": "PDF tools",
          "files": "Files on your device", "calc": "Calculators", "tests": "Practice tests", "quiz": "Jagtprøve-quiz", "seasons": "Jagttider i dag", "part107": "Part 107 practice test", "menu": "Menu"},
  "foot_help": "Help",
  "foot_privacy_all": "All privacy policies",
  "foot_apps": "Privacy and support per app",
  "foot_other_lang": ("/", "da", "Dansk"),
  "legal": "© 2026 Jakob Munch-Brandt. Webspind is the name I publish under. Made in Denmark.",
  "lbl_privacy": "Privacy",
  "lbl_support": "Support",
  "lbl_about_app": "About the app",
  "lbl_store": "App Store",

  # ---- home
  "home_title": "Webspind — apps by Jakob Munch-Brandt",
  "home_desc": "Small iPhone apps, made with care by Jakob Munch-Brandt in Denmark: the Wakebird alarm clock and Jagtprøven for the Danish hunting exam. DroneCamp is next.",
  "home_eyebrow": "Jakob Munch-Brandt · Denmark",
  "home_h1": "Small apps.<br><span>Made with care.</span>",
  "home_lede": "iPhone apps, each with its own look, all designed and built by one person.",
  "home_btn_apps": "See the apps",
  "home_btn_mail": "Write to me ›",
  "skip": "Skip to the apps",
  "shelf_label": "Apps",
  "status": {"live": "On the App Store", "review": "In review", "soon": "Coming soon"},
  "group_live": ("On the App Store.", "Out now, on iPhone and iPad."),
  "group_review": ("In review.", "Submitted to Apple. Out as soon as it's approved."),
  "group_soon": ("Up next.", "The app I'm finishing right now. It isn't out yet."),
  "screen_alt": "%s screen",
  "icon_alt": "%s app icon",
  "jakob_eyebrow": "The person behind Webspind",
  "jakob_h": "Hi, I'm Jakob <span>Munch&#8209;Brandt.</span>",
  "jakob_p": "I make every app here on my own, from the first sketch to the support reply. No team and no agency, so each one gets the time it needs, and each one gets a design of its own.",
  "jakob_hi": '<span lang="da">Hej fra Danmark.</span>',
  "jakob_photo_alt": "Jakob Munch-Brandt",

  # ---- app page
  "app_title": "Jagtprøven — the whole syllabus, no guesswork | Webspind",
  "app_desc": "Jagtprøven: the whole syllabus, bird identification and hunting seasons in one app, with an explanation behind every answer. An independent practice app for the Danish hunting licence exam, for iPhone and iPad.",
  "breadcrumb": "← All apps",
  "app_platform": "Hunting licence · iPhone and iPad",
  "app_price": "One-time purchase, not a subscription",
  "app_store": "Download on the App Store",
  "app_h1": 'Walk into the exam <span class="accent">completely sure</span> of it.',
  "app_lede": 'The whole syllabus, the bird identification and the hunting seasons in one app — with an explanation behind every answer, so you understand the rule instead of guessing. <span class="muted">Practise on the bus, in the woods, with no signal.</span>',
  "app_btn_features": "See what the app does",
  "app_shot_quiz": "Screenshot of a quiz question in Jagtprøven",
  "app_shot_birds": "Screenshot of the bird identification list in Jagtprøven",
  "app_icon_alt": "Jagtprøven app icon",

  "stats": [
    ("522", "questions, each explained"),
    ("100", "species with photos"),
    ("41", "species' hunting seasons"),
    ("40", "questions in a timed mock exam"),
  ],

  "disclaimer_head": "Independent practice app",
  "disclaimer_body": "Jagtprøven is not affiliated with the Danish Nature Agency or the Ministry of the Environment. The questions were written for the app from the public syllabus — they are not the exam's own questions.",

  "highlights": [
    ("The whole syllabus, not a sample.", "522 questions across all eight topics and the exam's six sections, plus a 40-question, 30-minute mock exam like the real day."),
    ("The species, the way the exam asks about them.", "100 species with photos, field marks and the species they get confused with — plus a photo quiz with three species from the same group."),
    ("You find out where you are weak.", "The app tracks your stats topic by topic and points at what is costing you points — so you practise the right thing before the exam."),
  ],

  "features_head": "What you get",
  "features_sub": "You don't memorise the answer key. Every question tells you why the answer is right, so the rule behind it sticks when the exam asks it a different way.",
  "features": [
    ("522 questions, each explained", "Every single question tells you why the answer is right. You understand the rule behind it instead of memorising the answer key."),
    ("Timed mock exam", "40 questions in 30 minutes, 36 to pass — exactly like the day, with a section-by-section breakdown afterwards."),
    ("Spots your weak topics", "The app tracks your stats per topic and points at where you are losing points — so you practise the right thing."),
    ("Practise anywhere", "The app works with no connection at all, so you can take a round in the car, in the hide or on your break at work."),
  ],

  "topics_head": "The eight topics",
  "topics_sub": "The app keeps track of which topics you are weakest in, so you can put the work exactly there. One topic of your choice is free.",
  "topics": [
    ("Species identification and wildlife biology", "+ photo quiz"),
    ("Game management", ""),
    ("Firearms and ammunition", ""),
    ("Other hunting legislation", ""),
    ("Handling shot game", ""),
    ("Hunting ethics and etiquette", ""),
    ("Hunting technique and leadership", ""),
    ("Safety and shooting", ""),
  ],

  "seasons_head": "Hunting seasons, filtered by today",
  "seasons_sub": "41 species you can filter by what is open right now, with notes on the local and regional seasons that apply to several of them.",
  "seasons_note": "The seasons in the app are for guidance and cannot be used as a legal reference. Always check the current statutory order before you go hunting.",
  "seasons_pills": ("Open now", "All species", "Local seasons"),
  "seasons": [
    ("Mallard", "1 Sep – 31 Dec", True),
    ("Pheasant", "1 Oct – 31 Jan", False),
    ("Wood pigeon", "1 Sep – 31 Jan", True),
    ("Greylag goose", "1 Sep – 31 Dec", True),
    ("Roe deer, buck", "16 May – 15 Jul", False),
  ],
  "seasons_foot": "An example of the view. The app covers 41 species.",

  "tools_head": "Try it without installing anything",
  "tools_sub": "Two free tools on this site, right in your browser. Both are in Danish, like the app.",
  "tools_items": [("Jagtprøve-quiz", "Practice questions, with every answer explained.", "/jagtproeve-quiz/"),
                  ("Hvad må jeg jage i dag?", "See which species are in season on a date.", "/jagttider-i-dag/")],

  "free_head": "Try it free first",
  "free_sub": "One topic of your choice, one full mock exam, one daily round and eight species are free. If the app works for you, the rest is one purchase — not a subscription.",
  "free_items": [
    ("One topic", "of your choice, as often as you like"),
    ("One mock exam", "40 questions in 30 minutes"),
    ("8 species", "with photos and field marks"),
  ],

  "about_head": "Hi — Webspind is just me.",
  "about_p1": "Jagtprøven is my first app. I built it because the syllabus for the Danish hunting licence exam is scattered across booklets, websites and statutory orders — and because bird identification is next to impossible to practise on paper.",
  "about_p2": "I write the questions, draw the interface, fix the bugs and read the support mail. That is why support here is a real page and not a form that goes nowhere — write, and you get me.",
  "facts": [
    ("Studio", "Webspind, Denmark"),
    ("People", "One"),
    ("Shipped", "Jagtprøven and Wakebird"),
    ("Support", "Me, within 2 working days"),
  ],

  "cta_head": "Try a whole mock exam for free.",
  "cta_body": "A full mock exam and one topic of your choice are free in the app — take them and see whether the format suits you before you buy the rest.",
  "cta_btn": "Got a question?",

  # ---- support
  "support_title": "Support — Webspind",
  "support_desc": "Support for Webspind's apps. Write straight to me, I answer within two working days.",
  "support_head": "Support",
  "support_lede": "Write straight to me. I read every message and answer within two working days, in English or Danish. Tell me which iPhone and iOS version you have and what happened — it saves us both a round trip.",
  "support_cards": [("Email", "webspind@gmail.com"), ("Response time", "Within 2 working days"), ("Refunds", "Handled by Apple")],
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
  "faq_head": "Jagtprøven: frequently asked questions",
  "sup_apps_head": "Support per app",
  "sup_other": "%s — something else",
  "faqs": [
    ("Are these the real exam questions?", "No. The questions were written for the app from the public syllabus for the Danish hunting licence exam. The app is an independent practice app and is not affiliated with the Danish Nature Agency or the Ministry of the Environment."),
    ("Can I use the hunting seasons while I am out hunting?", "Use them to practise. The seasons in the app are for guidance and are not a legal reference — always check the current statutory order before you head out. Several species also have local and regional seasons, which the app only notes."),
    ("What can I try for free?", "One topic of your choice, one full mock exam, one daily round and eight species. The rest unlocks with a single one-time purchase, not a subscription."),
    ("How do I get my purchase back on a new phone?", "Open the app, go to Settings and tap Restore purchases. The purchase is tied to your Apple account, so being signed in with the same one is enough. If nothing happens, write to me with the purchase date and I will sort it out."),
    ("Does the app store my answers anywhere?", "On your phone and in your own private iCloud, so they follow you to a new iPhone. There is no user account and no server at my end, and I cannot see your answers."),
    ("I think an answer is wrong", "Tell me which question it is and what you think is off, ideally with a reference. The syllabus changes and I fix things quickly — I am the one reading the mail."),
  ],
  "urgent_head": "Something that cannot wait?",
  "urgent_body": "Exam tomorrow, or the app lost your data? Put “urgent” in the subject field. I answer those the same day, when I am not on the road.",

  # ---- privacy index
  "priv_title": "Privacy — Webspind",
  "priv_desc": "Privacy policies for Webspind's apps.",
  "priv_head": "Privacy",
  "priv_lede": "One policy per app, the way Apple requires it. Common to all of them: no ads, no analytics and no server of mine.",
  "priv_card_go": "Read the policy →",

  # ---- 404
  "nf_body": "That path does not lead anywhere.",
  "nf_btn": "Back to Webspind",
},

}

# Every app, in the order the homepage shows them. The homepage tiles, the
# icon shelf, the footer, the privacy index and the support page are all built
# from this list. To add an app: a dict here, its icon + two screens in
# assets/apps/, its policy page — then re-run the script.
#   status   live | review | soon (decides which homepage group it lands in)
#   home     True = shown on the homepage and in the footer. Only released apps and the
#            single next one. False keeps the app's privacy and support pages (and the
#            privacy and support indexes), which App Store Connect links to.
#   tools    optional (label, url) per language for the app's free web tools
#   c        the app's own colour, tints its tile
#   priv/sup per-tree URL of its policy / support page (None = none yet).
#            These are the URLs App Store Connect points at — never move them.
#   pdesc    one line for the privacy index card
STORE_JAGTPROVEN = "https://apps.apple.com/dk/app/id6811615877"
STORE_WAKEBIRD = "https://apps.apple.com/dk/app/id6820910324"

APPS = [
    dict(id="wakebird", name="Wakebird", full="Wakebird: Birdsong Alarm Clock", status="live", c="#c4421f", store=STORE_WAKEBIRD, home=True,
         kind={"da": "Vækkeur med fuglesang", "en": "Birdsong alarm clock"},
         line={"da": "Vågn til ægte fuglesang.", "en": "Wake to real birdsong."},
         desc={"da": "Elleve morgenkor fra rigtige vilde fugle. Én fugl begynder blidt, de andre stemmer i, og bagefter ser du, hvem der vækkede dig. Kan også ringe ved solopgang, og den ringer, selv når telefonen er på lydløs.",
               "en": "Eleven dawn choruses from real wild birds. One bird starts softly, the others join in, and afterwards you see who woke you. It can ring at sunrise too, and it rings even on silent."},
         priv={"da": "/privacy/wakebird.html", "en": "/en/privacy/wakebird.html"}, sup=None,
         pdesc={"da": "Dine alarmer og din fuglebog ligger kun på din iPhone. Solopgangsalarmen bruger dit omtrentlige sted, kun på telefonen. Ingen konto, ingen analyse. Købet bekræftes via RevenueCat.",
                "en": "Your alarms and bird book stay on your iPhone. The sunrise alarm uses your approximate location, on the phone only. No account, no analytics. The purchase is verified via RevenueCat."}),
    dict(id="friendloop", name="Friendloop", full="Friendloop: Stay in Touch", status="soon", c="#6a3cf0", home=False,
         kind={"da": "Hold kontakten", "en": "Stay in touch"},
         line={"da": "Se mere til de venner, der betyder noget.", "en": "See more of the friends who matter."},
         desc={"da": "En god idé til hver ven, med beskeden allerede skrevet. Privat, på din iPhone, uden konto.",
               "en": "A good idea for every friend, with the message already written. Private, on your iPhone, no account."},
         priv={"da": "/privacy/friendloop.html", "en": "/en/privacy/friendloop.html"}, sup=None,
         pdesc={"da": "Dine venner, noter og påmindelser bliver på din iPhone. Ingen konto, ingen analyse. Køb bekræftes via RevenueCat.",
                "en": "Your friends, notes and reminders stay on your iPhone. No account, no analytics. Purchases are verified via RevenueCat."}),
    dict(id="supersub", name="Supersub", full="Supersub: Offline Football", status="soon", c="#1f3fd6", home=False,
         kind={"da": "Offline fodboldspil", "en": "Offline football game"},
         line={"da": "Tag skuddet.", "en": "Take the shot."},
         desc={"da": "Arkadefodbold i 3D, bygget fra bunden igen. Korte kampe, store mål, og den virker uden net.",
               "en": "Arcade football in 3D, rebuilt from the ground up. Short matches, big goals, and it works without a connection."},
         priv={"da": "/en/privacy/supersub.html", "en": "/en/privacy/supersub.html"}, sup=None,
         pdesc={"da": "Din klub bor på din iPhone. Ingen konto, ingen reklamer, ingen analyse. Køb bekræftes via RevenueCat. (Politikken er på engelsk.)",
                "en": "Your club lives on your iPhone. No account, no ads, no analytics. Purchases are verified via RevenueCat."}),
    dict(id="longwalk", name="Longwalk", full="Longwalk: Walk the Camino", status="soon", c="#c2402b", home=False,
         kind={"da": "Gå berømte ruter", "en": "Walk famous trails"},
         line={"da": "Gå Caminoen hjemmefra.", "en": "Walk the Camino from home."},
         desc={"da": "Dine daglige skridt fører dig ad ti berømte ruter, med et postkort ved hvert stop. Betal én gang, intet abonnement.",
               "en": "Your everyday steps carry you along ten famous trails, with a postcard at every stop. Pay once, no subscription."},
         priv={"da": "/privacy/longwalk.html", "en": "/en/privacy/longwalk.html"}, sup=None,
         pdesc={"da": "Dine gåture bliver på din iPhone, og sundhedsdata forlader den aldrig. Kortfliser kommer fra OpenFreeMap; køb bekræftes via RevenueCat.",
                "en": "Your walks stay on your iPhone. Health data never leaves it. Map tiles come from OpenFreeMap; purchases are verified via RevenueCat."}),
    dict(id="jagtproven", name="Jagtprøven", full="Jagtprøven – Jagttegn & Teori", status="live", c="#2b7334", home=True,
         tools={"da": [("Gratis quiz", "/jagtproeve-quiz/"), ("Hvad må jeg jage i dag?", "/jagttider-i-dag/")], "en": [("Free quiz (in Danish)", "/jagtproeve-quiz/"), ("Seasons today (in Danish)", "/jagttider-i-dag/")]},
         kind={"da": "Jagttegnsprøven", "en": "Danish hunting exam · In Danish"},
         line={"da": "Bestå jagtprøven første gang.", "en": "Pass the hunting exam the first time."},
         desc={"da": "522 spørgsmål med en kilde bag hvert svar, alle 100 vildtarter med foto og de jagttider, der gælder lige nu. iPhone og iPad.",
               "en": "522 questions with a source behind every answer, all 100 species with photos, and the seasons that apply right now. iPhone and iPad."},
         store=STORE_JAGTPROVEN, page="/jagtproven/",
         priv={"da": "/privacy/jagtproven.html", "en": "/privacy/jagtproven.html"},
         sup={"da": "/support.html", "en": "/en/support.html"},
         pdesc={"da": "Dine svar ligger på din enhed og i din egen iCloud. Ingen konto, ingen analyse. Køb bekræftes via RevenueCat.",
                "en": "Your answers stay on your device and in your own iCloud. No account, no analytics. Purchases are verified via RevenueCat. The policy is in Danish, like the app; write to me if you need it in English."}),
    dict(id="dronecamp", name="DroneCamp", full="DroneCamp: Part 107 Drone Test", status="soon", c="#1254E8", home=True,
         tools={"da": [("Gratis prøvetest", "/part-107-practice-test/")], "en": [("Free practice test", "/part-107-practice-test/")]},
         kind={"da": "FAA Part 107-droneprøven · På engelsk", "en": "FAA Part 107 drone test"},
         line={"da": "Bliv klar til Part 107-prøven.", "en": "Get ready for the FAA Part 107 test."},
         desc={"da": "558 spørgsmål med forklaring på hvert svar, 34 øvelser på rigtige FAA-luftfartskort og prøver på tid som den rigtige.",
               "en": "558 questions with every answer explained, 34 drills on real FAA charts and mock tests on the clock."},
         priv={"da": "/privacy/dronecamp.html", "en": "/privacy/dronecamp.html"},
         sup={"da": "/support/dronecamp.html", "en": "/support/dronecamp.html"},
         pdesc={"da": "Dine svar ligger på din iPhone. Ingen konto, ingen analyse. Køb bekræftes via RevenueCat. (Engelsk)",
                "en": "Your answers stay on your iPhone. No account, no analytics. Purchases are verified via RevenueCat."}),
    dict(id="fortoy", name="Fortøy", full="Fortøy: Båtførerbevis", status="soon", c="#0b4db0", home=False,
         kind={"da": "Norsk båtførerbevis · På norsk", "en": "Norwegian boat licence · In Norwegian"},
         line={"da": "Båtførerprøven uden abonnement.", "en": "Båtførerprøven, without a subscription."},
         desc={"da": "390 spørgsmål, hver med forklaring og kilde, og en prøve med 50 spørgsmål som den rigtige.",
               "en": "390 questions, each with an explanation and its source, and a 50-question mock exam like the real one."},
         priv={"da": "/no/privacy/fortoy.html", "en": "/no/privacy/fortoy.html"},
         sup={"da": "/no/support/fortoy.html", "en": "/no/support/fortoy.html"},
         pdesc={"da": "Svarene dine ligger på iPhonen og i din egen iCloud. Ingen konto, ingen analyse. Kjøp bekreftes via RevenueCat. (Norsk)",
                "en": "Your answers stay on your iPhone and in your own iCloud. No account, no analytics. Purchases confirmed via RevenueCat. (Norwegian)"}),
    dict(id="wendemarke", name="Wendemarke", full="Wendemarke: Bootsprüfung A+D", status="soon", c="#d9061a", home=False,
         kind={"da": "Schweizisk bådførerbevis · På tysk", "en": "Swiss boat licence · In German"},
         line={"da": "Hvert spørgsmål forklaret.", "en": "Every question explained."},
         desc={"da": "354 øvespørgsmål i prøvens rigtigt/forkert-format, 284 af dem med BSV-artiklen bag svaret.",
               "en": "354 practice questions in the exam's true-or-false format, 284 of them with the BSV article behind the answer."},
         priv={"da": "/de/privacy/wendemarke.html", "en": "/de/privacy/wendemarke.html"},
         sup={"da": "/de/support/wendemarke.html", "en": "/de/support/wendemarke.html"},
         pdesc={"da": "Antworten bleiben auf dem iPhone und in deiner eigenen iCloud. Kein Konto, keine Analyse. Käufe via RevenueCat. (Tysk)",
                "en": "Antworten bleiben auf dem iPhone und in deiner eigenen iCloud. Kein Konto, keine Analyse. Käufe via RevenueCat. (German)"}),
    dict(id="cookside", name="Cookside", full="Cookside: Recipe Cook Mode", status="soon", c="#f4b120", home=False,
         kind={"da": "Opskrifter, ét trin ad gangen", "en": "Recipes, one step at a time"},
         line={"da": "Lav mad ét trin ad gangen.", "en": "Cook one step at a time."},
         desc={"da": "Store trin, du kan læse fra komfuret, og timere der ringer, når de er færdige. Gem opskrifter fra et link, ved at indsætte dem eller ved at scanne en side.",
               "en": "Big steps you can read from the stove and timers that ring when they're done. Save recipes from a link, by pasting, or by scanning a page."},
         priv={"da": "/privacy/cookside.html", "en": "/en/privacy/cookside.html"},
         sup={"da": "/support/cookside.html", "en": "/en/support/cookside.html"},
         pdesc={"da": "Dine opskrifter ligger på din iPhone og i din egen iCloud. Ingen konto, ingen analyse. Køb bekræftes via RevenueCat.",
                "en": "Your recipes stay on your iPhone and in your own iCloud. No account, no analytics. Purchases confirmed via RevenueCat."}),
    dict(id="handhold", name="Handhold", full="Handhold: Daily Habit Coach", status="soon", c="#ab4a2b", home=False,
         kind={"da": "Daglig vanecoach · På engelsk", "en": "Daily habit coach"},
         line={"da": "Til de vaner, du bliver ved med at droppe.", "en": "For habits you keep dropping."},
         desc={"da": "Start med to sider. Springer du en dag over, nulstilles intet; trinnet bliver bare mindre. Betal én gang, intet abonnement.",
               "en": "Start with two pages. Miss a day and nothing resets; the step just gets smaller. Pay once, no subscription."},
         priv={"da": "/en/privacy/handhold.html", "en": "/en/privacy/handhold.html"},
         sup={"da": "/en/support/handhold.html", "en": "/en/support/handhold.html"},
         pdesc={"da": "Dine vaner ligger på din iPhone og i din egen iCloud. Ingen konto, ingen analyse. Køb bekræftes via RevenueCat. (Engelsk)",
                "en": "Your habits stay on your iPhone and in your own iCloud. No account, no analytics. Purchases confirmed via RevenueCat."}),
]
BY_ID = {a["id"]: a for a in APPS}
HOME_APPS = [a for a in APPS if a["home"]]

# The Jagtprøven policy is Danish only: the app ships in Danish, and this is
# the legal text Apple links to. The English privacy index points at it with
# a note in its card (pdesc).
POLICY_SECTIONS = [
    ("Hvad appen gemmer", "Dine besvarelser, prøvesæt, udmærkelser, streak og de vildtarter, du har gemt som favoritter. Hvis du selv oplyser det, også dit fornavn, din prøvedato, dit prøvested og det emne, du vil starte med. Der er ingen brugerkonto, intet login, intet reklame-id, ingen fingerprinting og ingen analyseværktøjer i appen."),
    ("Hvor dine data ligger", "På din enhed og, hvis du bruger iCloud, i din egen private iCloud-database og iCloud-lager hos Apple, så de følger med til en ny iPhone. Kun du har adgang til dem. Webspind har ingen kopi og kan ikke læse dem."),
    ("Hvor længe", "Dine data ligger, indtil du selv sletter dem i appen eller sletter appen og dens iCloud-data. Webspind opbevarer intet. RevenueCat opbevarer købsoplysningerne efter sin egen privatlivspolitik, så længe købet skal kunne gendannes."),
    ("Køb", 'Køb håndteres af Apple. Til at bekræfte og gendanne dit køb bruger appen tjenesten <a href="https://www.revenuecat.com/privacy">RevenueCat</a>, som modtager et anonymt app-bruger-id, oplysninger om dine køb (produkt, pris, tidspunkt og kvittering fra App Store) og tekniske oplysninger som app-version og land. RevenueCat får ikke dit navn, din e-mail eller dine svar. Fra Apple får jeg salgstal og opgørelser på landeniveau — aldrig dine kortoplysninger, din adresse eller din e-mail.'),
    ("Påmindelser", "Slår du den daglige påmindelse til, planlægges den lokalt på din iPhone. Der sendes intet til en server."),
    ("Nedbrudsrapporter", "Har du slået deling med udviklere til i enhedens indstillinger, kan Apple sende mig samlede nedbrudsrapporter med enhedsmodel, iOS-version og et stakspor. De indeholder hverken navn, e-mail, indhold eller et blivende id, og jeg kan ikke bruge dem til at kontakte dig."),
    ("Børn", "Appen er henvendt til dem, der skal tage jagttegn, og er ikke rettet mod børn."),
    ("Slet dine data", "I appen: Profil → tandhjulet → Slet alle data. Det sletter alt, appen har gemt, både på enheden og i din iCloud. Dit køb hører til dit Apple-ID og bevares. Vil du have dine købsoplysninger slettet hos RevenueCat, eller har du skrevet til mig og vil have tråden slettet, så sig til. Du kan også klage til Datatilsynet."),
    ("Ændringer", "Ændrer politikken sig på en måde, der betyder noget, ændres datoen øverst, og den tidligere ordlyd kan fås ved henvendelse. Væsentlige ændringer nævnes også i appens udgivelsesnoter."),
]


# ---------------------------------------------------------------- shell

def P(lang, path):
    """Danish-tree path -> the same path in the tree for `lang`."""
    return path if lang == "da" else "/en" + path


def ext(href):
    return ' target="_blank" rel="noopener"' if href.startswith("http") else ""


def header(lang, current=None, switch=None, keep=False):
    L, N = LANG[lang], LANG[lang]["nav"]
    keep_attr = " data-keep" if keep else ""
    da_href, en_href = switch or ("/", "/en/")
    lang_switch = ('<span class="lang-switch">'
                   '<a href="%s" data-lang="da" hreflang="da"%s%s>DA</a>'
                   '<a href="%s" data-lang="en" hreflang="en"%s%s>EN</a>'
                   '</span>') % (da_href, ' aria-current="true"' if lang == "da" else "", keep_attr,
                                 en_href, ' aria-current="true"' if lang == "en" else "", keep_attr)

    def link(href, label):
        return '<a href="%s">%s</a>' % (href, esc(label))

    def drop(key, inner, is_current=False):
        return ('<div class="nav-dd"><button type="button" class="nav-btn%s" aria-expanded="false" aria-controls="nd-%s">%s</button>'
                '<div class="nav-drop" id="nd-%s"><div class="nav-drop-in">%s</div></div></div>'
                % (" is-current" if is_current else "", key, esc(N[key]), key, inner))

    apps = "".join(link(P(lang, a["page"]) if a.get("page") else P(lang, "/#" + a["id"]), a["name"]) for a in HOME_APPS)
    tests = [(N["quiz"], "/jagtproeve-quiz/"), (N["seasons"], "/jagttider-i-dag/")] if lang == "da" \
        else [(N["part107"], "/part-107-practice-test/")]
    tools = link(pdf_href(lang), N["pdf"]) + link("/tools/da/" if lang == "da" else "/tools/", N["files"])
    if lang == "da":
        tools += link("/beregnere/", N["calc"])
    tools += '<p class="nav-group">%s</p>' % esc(N["tests"]) + "".join(link(h, t) for t, h in tests)

    flat = "".join('<a href="%s"%s>%s</a>' % (h, ' aria-current="page"' if k == current else "", esc(N[k]))
                   for k, h in (("articles", articles_href(lang)), ("about", P(lang, "/#jakob")), ("support", P(lang, "/support.html"))))
    return '''<a class="skip" href="#main">%s</a>
  <header class="site-header">
    <div class="wrap">
      <a class="brand" href="%s">Webspind</a>
      <nav class="nav" aria-label="Main">
        <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-menu" aria-label="%s"><span></span></button>
        <div class="nav-panel" id="site-menu">%s%s%s</div>
        %s
      </nav>
    </div>
  </header>''' % (L["skip"], P(lang, "/"), esc(N["menu"]), drop("apps", apps, current == "apps"), drop("tools", tools),
                     flat, lang_switch)


def footer(lang):
    L = LANG[lang]
    rows = []
    for a in HOME_APPS:
        bits = []
        if a.get("page"):
            bits.append((L["lbl_about_app"], P(lang, a["page"])))
        bits.append((L["lbl_privacy"], a["priv"][lang]))
        if a["sup"]:
            bits.append((L["lbl_support"], a["sup"][lang]))
        rows.append('<li><span class="fl-name">%s</span>%s</li>' % (
            esc(a["name"]), "".join('<a href="%s">%s</a>' % (h, t) for t, h in bits)))
    other_href, other_code, other_name = L["foot_other_lang"]
    return '''<footer class="site-footer">
    <div class="wrap">
      <div class="foot-cols">
        <div>
          <h2>%s</h2>
          <p><a href="%s">%s</a><a href="%s">%s</a><a href="%s">%s</a><a href="mailto:webspind@gmail.com">webspind@gmail.com</a><a href="%s" rel="me noopener" target="_blank">LinkedIn</a><a href="%s" data-lang="%s" lang="%s">%s</a></p>
        </div>
        <div class="foot-apps">
          <h2>%s</h2>
          <ul>%s</ul>
        </div>
      </div>
      <p class="legal">%s</p>
    </div>
  </footer>''' % (L["foot_help"], P(lang, "/support.html"), L["lbl_support"], P(lang, "/privacy/"),
                  L["foot_privacy_all"], pdf_href(lang), L["nav"]["pdf"], LINKEDIN, other_href, other_code, other_code, other_name,
                  L["foot_apps"], "".join(rows), L["legal"])


OG_LOCALE = {"da": "da_DK", "en": "en", "nb": "nb_NO", "de-CH": "de_CH"}


def page(path, title, desc, body, lang="da", current=None, twin=None,
         switch=None, redirect=True, html_lang=None, pair=None):
    """Write one page. `twin` is the (danish, english) URL pair for the
    hreflang alternates; pages with no twin (policies, the bilingual 404)
    pass redirect=False so site.js leaves them alone.
    `switch` overrides where the DA | EN header links point when a page has
    no real translation. `html_lang` is the page's own language when it isn't
    the shell's (the Norwegian and Swiss-German policies use the English
    shell). `pair` says the DA | EN links lead to a real translation of this
    page, so lang-keep.js may keep the visitor's place on them (default: twin)."""
    html_lang = html_lang or lang
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
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#f5f5f7">
  <link rel="canonical" href="https://webspind.com%s">%s
  <meta property="og:title" content="%s">
  <meta property="og:description" content="%s">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="%s">
  <meta property="og:url" content="https://webspind.com%s">
</head>
<body>
  %s

  <main id="main">
%s
  </main>

  %s

  <script src="/lang-keep.js"></script>
  <script src="/site.js"></script>
  <script src="/nav.js"></script>
</body>
</html>
''' % (html_lang, "" if redirect else " data-nolang", title, desc, FONT_LINKS, path, alts,
       title, desc, OG_LOCALE.get(html_lang, "en"), path,
       header(lang, current, switch or twin, bool(twin) if pair is None else pair), body, footer(lang))
    full = os.path.join(os.getcwd(), path.lstrip("/"))
    if path.endswith("/"):
        full = os.path.join(full, "index.html")
    os.makedirs(os.path.dirname(full), exist_ok=True)
    io.open(full, "w", encoding="utf-8").write(html)
    print("  wrote %-34s %6d bytes" % (path, len(html.encode("utf-8"))))


# ---------------------------------------------------------------- home

def icon(a, L, cls, alt=True):
    return ('<img class="%s" src="/assets/apps/icons/%s.webp" width="256" height="256" alt="%s" decoding="async">'
            % (cls, a["id"], esc(L["icon_alt"] % a["name"]) if alt else ""))


# Apps whose screenshots exist in Danish and English: <id>-a.webp is Danish,
# <id>-a-en.webp is English. Every other app has one set, used on both trees.
LOCALISED = {"wakebird", "longwalk", "cookside"}


def phone(a, L, s, cls="phone", lazy=True):
    suffix = "-en" if a["id"] in LOCALISED and L["locale"] != "da_DK" else ""
    return ('<div class="%s"><div class="bezel"><img src="/assets/apps/screens/%s-%s%s.webp" width="600" height="1304" '
            'alt="%s" decoding="async"%s></div></div>'
            % (cls, a["id"], s, suffix, esc(L["screen_alt"] % a["name"]), ' loading="lazy"' if lazy else ""))


def app_links(a, L, lang):
    out = []
    if a.get("store"):
        out.append((L["lbl_store"], a["store"]))
    out.extend(a.get("tools", {}).get(lang, []))
    if a.get("page"):
        out.append((L["lbl_about_app"], P(lang, a["page"])))
    out.append((L["lbl_privacy"], a["priv"][lang]))
    if a["sup"]:
        out.append((L["lbl_support"], a["sup"][lang]))
    return "".join('<a class="more" href="%s"%s>%s</a>' % (h, ext(h), t) for t, h in out)


def tile(a, L, lang, size):
    devs = phone(a, L, "a") + (phone(a, L, "b", "phone ph2") if size == "wide" else "")
    return '''      <article class="tile t-%s rv" id="%s" style="--c:%s">
        <div class="t-copy">
          %s
          <p class="chip st-%s">%s</p>
          <h3 class="t-name">%s</h3>
          <p class="t-kind">%s</p>
          <p class="t-line">%s</p>
          <p class="t-desc">%s</p>
          <p class="t-links">%s</p>
        </div>
        <div class="t-dev">%s</div>
      </article>''' % (size, a["id"], a["c"], icon(a, L, "t-ic"), a["status"], L["status"][a["status"]],
                       esc(a["name"]), esc(a["kind"][lang]), esc(a["line"][lang]), esc(a["desc"][lang]),
                       app_links(a, L, lang), devs)


def group(L, lang, status, size, grid):
    apps = [a for a in HOME_APPS if a["status"] == status]
    if not apps:
        return ""
    head, sub = L["group_" + status]
    tiles = "\n".join(tile(a, L, lang, size) for a in apps)
    if grid:
        tiles = '      <div class="grid %s">\n%s\n      </div>' % (grid, tiles)
    return '''    <section class="group" id="g-%s">
      <header class="g-head rv"><h2>%s</h2><p>%s</p></header>
%s
    </section>''' % (status, head, sub, tiles)


HERO_SHOTS = [("jagtproven", "b"), ("wakebird", "a"), ("jagtproven", "a"), ("dronecamp", "a"), ("wakebird", "b")]


def home_body(L, lang):
    hero = "".join(phone(BY_ID[k], L, shot, "phone hp hp%d" % i, lazy=False) for i, (k, shot) in enumerate(HERO_SHOTS))
    shelf = "".join('<a href="#%s">%s<span>%s</span></a>' % (a["id"], icon(a, L, "sh-ic", alt=False), esc(a["name"]))
                    for a in HOME_APPS)
    return '''    <section class="hero" id="top">
      <p class="eyebrow">%s</p>
      <h1 class="hero-h">%s</h1>
      <p class="hero-p">%s</p>
      <p class="hero-cta"><a class="btn" href="#apps">%s</a><a class="txt" href="mailto:webspind@gmail.com">%s</a></p>
      <div class="hero-phones" aria-hidden="true">%s</div>
    </section>

    <section class="shelf-sec" id="apps" aria-label="%s">
      <div class="shelf">%s</div>
    </section>

%s

%s

%s

    <section class="jakob rv" id="jakob">
      <div class="jakob-in">
        <img class="jakob-photo" src="/assets/jakob.webp" width="360" height="360" alt="%s" loading="lazy" decoding="async">
        <p class="eyebrow">%s</p>
        <h2>%s</h2>
        <p>%s</p>
        <p class="jakob-cta"><a class="btn btn-light" href="mailto:webspind@gmail.com">webspind@gmail.com</a><a class="btn btn-ghost" href="%s" rel="me noopener" target="_blank">LinkedIn ↗</a></p>
        <p class="jakob-hi">%s</p>
      </div>
    </section>''' % (L["home_eyebrow"], L["home_h1"], L["home_lede"], L["home_btn_apps"], L["home_btn_mail"],
                     hero, L["shelf_label"], shelf,
                     group(L, lang, "live", "wide", ""), group(L, lang, "review", "third", "g3"),
                     group(L, lang, "soon", "wide", ""),
                     L["jakob_photo_alt"], L["jakob_eyebrow"], L["jakob_h"], L["jakob_p"], LINKEDIN, L["jakob_hi"])


# ---------------------------------------------------------------- app page

def hero_app(L, lang):
    stats = "\n".join('          <div><span class="v">%s</span><span class="k">%s</span></div>' % s
                      for s in L["stats"])
    return '''    <section class="hero hero-plain" id="top">
      <div class="hero-inner">
        <div class="app-top">
          <div class="app-copy-col">
            <a class="breadcrumb" href="%s">%s</a>
            <div class="app-meta">
              <img class="app-icon" src="/assets/apps/icons/jagtproven.webp" alt="%s" width="76" height="76">
              <div class="app-meta-text">
                <span class="platform">%s</span>
                <span class="price">%s</span>
              </div>
            </div>
            <h1>%s</h1>
            <p class="hero-lede">%s</p>
            <div class="hero-actions">
              <a class="btn" href="%s" target="_blank" rel="noopener">%s</a>
              <a class="btn btn-secondary" href="#app">%s</a>
            </div>
          </div>
          <div class="app-shots">
            <div class="phone"><div class="bezel"><img src="/assets/apps/screens/jagtproven-a.webp" width="600" height="1304" alt="%s"></div></div>
            <div class="phone offset"><div class="bezel"><img src="/assets/apps/screens/jagtproven-b.webp" width="600" height="1304" alt="%s"></div></div>
          </div>
        </div>
        <div class="stats">
%s
        </div>
      </div>
    </section>''' % (P(lang, "/#apps"), L["breadcrumb"], L["app_icon_alt"],
                     L["app_platform"], L["app_price"], L["app_h1"], L["app_lede"],
                     STORE_JAGTPROVEN, L["app_store"], L["app_btn_features"],
                     L["app_shot_quiz"], L["app_shot_birds"], stats)


def disclaimer(L, lang):
    return '''    <section class="section" id="independent">
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
    return '''    <section class="section" id="highlights">
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
    return '''    <section class="section" id="topics" %s>
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
    return '''    <section class="section" id="seasons">
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


def tools_section(L, lang):
    items = "\n".join('          <a class="priv-card" href="%s"><span class="name">%s</span><span class="desc">%s</span></a>' % (h, t, d)
                       for t, d, h in L["tools_items"])
    return '''    <section class="section" id="tools">
      <div class="section-inner rv">
        <div class="section-head">
          <h2>%s</h2>
          <p>%s</p>
        </div>
        <div class="priv-grid">
%s
        </div>
      </div>
    </section>''' % (L["tools_head"], L["tools_sub"], items)


def free_trial(L, lang):
    return '''    <section class="section rule-top" id="free" %s>
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
    return '''    <section class="section rule-top" id="about">
      <div class="section-inner split rv" style="align-items:start">
        <img class="about-photo" src="/assets/jakob.webp" width="360" height="360" alt="%s" loading="lazy">
        <div class="about-copy" style="display:flex;flex-direction:column;gap:16px">
          <h2>%s</h2>
          <p class="serif">%s</p>
          <p class="serif">%s</p>
          <div class="facts">
%s
            <a href="mailto:webspind@gmail.com">webspind@gmail.com</a>
          </div>
        </div>
      </div>
    </section>''' % (L["jakob_photo_alt"], L["about_head"], L["about_p1"], L["about_p2"],
                     "\n".join('            <div class="row"><span>%s</span><span>%s</span></div>' % f
                               for f in L["facts"]))


def final_cta(L, lang):
    return '''    <section class="cta-final rule-top" id="cta">
      <div class="cta-final-inner rv">
        <h2>%s</h2>
        <p>%s</p>
        <div class="hero-actions">
          <a class="btn" href="%s" target="_blank" rel="noopener">%s</a>
          <a class="btn btn-outline" href="%s">%s</a>
        </div>
      </div>
    </section>''' % (L["cta_head"], L["cta_body"], STORE_JAGTPROVEN, L["app_store"],
                     P(lang, "/support.html"), L["cta_btn"])


# ---------------------------------------------------------------- support

def support_body(L, lang):
    email, resp, refund = L["support_cards"]
    cards = '''      <div class="contact-grid rv" id="contact">
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
    # Jagtprøven's three specific subjects, then one per other app, then the
    # general ones (suggestion, something else).
    subjects = (L["form_subject_options"][:3] + [L["sup_other"] % a["name"] for a in APPS if a["id"] != "jagtproven"]
                + L["form_subject_options"][3:])
    options += "".join("\n              <option>%s</option>" % esc(o) for o in subjects)
    form = '''      <div class="support-form rv" id="message">
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

    faq = '''      <div id="faq" style="display:flex;flex-direction:column;gap:12px">
        <h2 style="font-size:clamp(22px,2.8vw,30px)">%s</h2>
        <div class="faq rv">
%s
        </div>
      </div>''' % (L["faq_head"],
                   "\n".join('          <details><summary>%s</summary><p class="answer">%s</p></details>' % f
                             for f in L["faqs"]))

    per_app = '''      <div class="sup-apps rv" id="per-app">
        <h2>%s</h2>
        <ul>%s</ul>
      </div>''' % (L["sup_apps_head"], "".join(
        '<li><a href="%s">%s<span>%s</span></a></li>' % (a["sup"][lang], icon(a, L, "sa-ic", alt=False), esc(a["name"]))
        for a in APPS if a["sup"] and a["id"] != "jagtproven"))

    urgent = '''      <div class="urgent rv" id="urgent">
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
%s
    </div>''' % (L["support_head"], L["support_lede"], cards, form, per_app, faq, urgent)


# ---------------------------------------------------------------- privacy

def priv_index_body(L, lang):
    cards = "\n".join('''        <a class="priv-card" id="priv-%s" href="%s">
          %s
          <span class="name">%s</span>
          <span class="desc">%s</span>
          <span class="go">%s</span>
        </a>''' % (a["id"], a["priv"][lang], icon(a, L, "pc-ic", alt=False), esc(a["full"]), esc(a["pdesc"][lang]),
                     L["priv_card_go"]) for a in APPS)
    return '''    <div class="support-page">
      <div class="page-head">
        <h1>%s</h1>
        <p>%s</p>
      </div>
      <div class="priv-grid rv">
%s
      </div>
    </div>''' % (L["priv_head"], L["priv_lede"], cards)


policy_body = '''    <div class="policy">
      <div class="page-head" style="gap:12px">
        <h1>Privatlivspolitik — Jagtprøven</h1>
        <p class="updated">Senest opdateret 15. oktober 2026 · gælder Jagtprøven til iOS</p>
      </div>
      <p class="intro">Jagtprøven gemmer dine data på din enhed og i din egen iCloud. Webspind driver ingen server og kan ikke se dine svar, dit navn eller din prøvedato. Det eneste, der sendes videre, er oplysninger om køb. Denne side forklarer det i detaljer — og findes også, fordi Apple kræver et link til en privatlivspolitik for hver app i App Store.</p>
      <div class="policy-sections">
%s
      </div>
      <div class="policy-contact">Spørgsmål til politikken, eller vil du have noget slettet? Skriv til <a href="mailto:webspind@gmail.com">webspind@gmail.com</a>, så svarer jeg inden for to hverdage.</div>
    </div>''' % "\n".join('        <div><h2>%s</h2><p>%s</p></div>' % s for s in POLICY_SECTIONS)


# ---------------------------------------------------------------- 404

# One page for both languages: GitHub Pages only ever serves /404.html, and
# there is nothing here worth a redirect.
nf_body = '''    <div class="center-page">
      <h1>404</h1>
      <p lang="da">%s</p>
      <p lang="en">%s</p>
      <p class="hero-actions" style="justify-content:center">
        <a class="btn" href="/" lang="da">%s</a>
        <a class="btn btn-secondary" href="/en/" lang="en">%s</a>
      </p>
    </div>''' % (LANG["da"]["nf_body"], LANG["en"]["nf_body"],
                 LANG["da"]["nf_btn"], LANG["en"]["nf_btn"])


# ---------------------------------------------------------------- build

TWIN_HOME    = ("/", "/en/")
TWIN_APP     = ("/jagtproven/", "/en/jagtproven/")
TWIN_SUPPORT = ("/support.html", "/en/support.html")
TWIN_PRIVACY = ("/privacy/", "/en/privacy/")

WRITTEN = []
_page = page
def page(path, *a, **k):
    WRITTEN.append(path if not path.endswith("/") else path + "index.html")
    _page(path, *a, **k)



# ---------------------------------------------------------------- articles
# Source: Viden/site-articles/*.md in the factory repo (front matter + a small
# Markdown subset). Danish pieces go to /artikler/, English to /en/articles/.

ARTICLE_SRC = os.path.join("..", "..", "Viden", "site-articles")
ARTICLE_APPS = {
    "jagtproven": dict(lang="da", name="Jagtprøven", store=STORE_JAGTPROVEN,
                       line="Øv til jagtprøven på iPhone og iPad. Appen er ikke officiel.", btn="Hent i App Store"),
    "wakebird": dict(lang="en", name="Wakebird", store=STORE_WAKEBIRD,
                     line="An iPhone alarm clock that rings with real birdsong. One purchase, no subscription.", btn="Get it on the App Store"),
}
ARTICLE_TXT = {
    "da": dict(title="Artikler om jagtprøven — Webspind", h="Artikler",
               desc="Artikler om jagtprøven, vildtarter og jagttider af Jakob Munch-Brandt.",
               lede="Om jagtprøven, vildtarterne og jagttiderne. Mine egne vurderinger, med links til reglerne.",
               by="Af Jakob Munch-Brandt", back="Alle artikler", other="Articles in English"),
    "en": dict(title="Articles on waking up — Webspind", h="Articles",
               desc="Articles on birdsong, alarm sounds and waking up on iPhone by Jakob Munch-Brandt.",
               lede="On birdsong, alarm sounds and waking up. My own opinions, and I say where the evidence stops.",
               by="By Jakob Munch-Brandt", back="All articles", other="Artikler på dansk"),
}

# A pointer from an article to the free tool that fits it.
ARTICLE_TOOLS = {
    "jagtproven-jagttider": '<div class="art-note"><p>Slå dagens jagttider op, også for dit område: <a href="/jagttider-i-dag/">Hvad må jeg jage i dag?</a> Og øv dem i <a href="/jagtproeve-quiz/">jagtprøve-quizzen</a>.</p></div>',
    "jagtproven-saadan-foregaar-den": '<div class="art-note"><p>Vil du teste dig selv med det samme? Tag den gratis <a href="/jagtproeve-quiz/">jagtprøve-quiz</a> med forklaring på hvert svar.</p></div>',
    "jagtproven-laer-vildtarterne": '<div class="art-note"><p>Vil du øve resten af teorien også? Tag den gratis <a href="/jagtproeve-quiz/">jagtprøve-quiz</a>.</p></div>',
}

def md_inline(t):
    t = esc(t)
    t = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", lambda m: '<a href="%s"%s>%s</a>' % (
        m.group(2), ' target="_blank" rel="noopener"' if m.group(2).startswith("http") else "", m.group(1)), t)
    t = re.sub(r"(?<![\"=>])(https?://[^\s<]+)", r'<a href="\1" target="_blank" rel="noopener">\1</a>', t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    return re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"<em>\1</em>", t)

def md_block(head, rows):
    cells = [[c.strip() for c in r.split(" | ")] for r in rows]
    if head in ("answer", "note"):
        return '<div class="art-%s"><p>%s</p></div>' % (head, md_inline(" ".join(rows)))
    if head == "stats":
        return '<div class="art-stats">%s</div>' % "".join(
            '<div><b>%s</b><span>%s</span></div>' % (esc(c[0]), md_inline(c[1])) for c in cells)
    if head == "steps":
        return '<ol class="art-steps">%s</ol>' % "".join(
            '<li><strong>%s</strong><span>%s</span></li>' % (md_inline(c[0]), md_inline(c[1])) for c in cells)
    if head == "cards":
        return '<div class="art-cards">%s</div>' % "".join(
            '<div><strong>%s</strong><p>%s</p></div>' % (md_inline(c[0]), md_inline(c[1])) for c in cells)
    if head == "chips":
        return '<ul class="art-chips">%s</ul>' % "".join("<li>%s</li>" % md_inline(r) for r in rows)
    if head == "gantt":
        axis = [(p.split(":")[0].strip(), int(p.split(":")[1])) for p in rows[0].split(",")]
        total = float(sum(n for _, n in axis))
        ticks = "".join('<span style="width:%.3f%%">%s</span>' % (n / total * 100, esc(t)) for t, n in axis)
        grid = "".join('<i style="left:%.3f%%"></i>' % (sum(n for _, n in axis[:k]) / total * 100) for k in range(1, len(axis)))
        out = []
        for c in cells[1:]:
            a, b = int(c[1]), int(c[2])
            out.append('<div class="art-row"><div class="art-row-l"><strong>%s</strong><span>%s</span></div>'
                       '<div class="art-track">%s<em class="art-bar-%s" style="left:%.3f%%;width:%.3f%%"></em></div></div>'
                       % (esc(c[0]), esc(c[4]), grid, c[3], a / total * 100, (b - a) / total * 100))
        return ('<div class="art-gantt"><div class="art-row art-axis"><div class="art-row-l"></div><div class="art-ticks">%s</div></div>%s</div>'
                % (ticks, "".join(out)))
    if head.startswith("phone "):
        img, alt, link = [x.strip() for x in head[6:].split(" | ")]
        m = re.match(r"\[(.*)\]\((.*)\)", link)
        return ('<a class="art-phone" href="%s" target="_blank" rel="noopener"><span class="art-phone-in"><img src="/assets/apps/screens/%s.webp" width="600" height="1304" alt="%s" loading="lazy"></span>'
                '<span class="art-phone-link">%s</span></a>' % (m.group(2), img, esc(alt), esc(m.group(1))))
    raise ValueError(head)

def md_html(md):
    out, lines, i = [], md.split("\n"), 0
    while i < len(lines):
        ln = lines[i].rstrip()
        if not ln:
            i += 1
        elif ln.startswith(":::"):
            head = ln[3:].strip()
            i += 1
            inner = []
            while not lines[i].startswith(":::"):
                inner.append(lines[i].rstrip()); i += 1
            i += 1
            out.append(md_block(head, [x for x in inner if x]))
        elif ln.startswith("## "):
            out.append("<h2>%s</h2>" % md_inline(ln[3:])); i += 1
        elif ln.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")]); i += 1
            head = "".join("<th>%s</th>" % md_inline(c) for c in rows[0])
            body = "".join("<tr>%s</tr>" % "".join("<td>%s</td>" % md_inline(c) for c in r) for r in rows[2:])
            out.append('<div class="article-table"><table><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (head, body))
        elif re.match(r"(- |\d+\. )", ln):
            tag = "ul" if ln.startswith("- ") else "ol"
            items = []
            while i < len(lines) and re.match(r"(- |\d+\. )", lines[i]):
                items.append("<li>%s</li>" % md_inline(re.sub(r"^(- |\d+\. )", "", lines[i].rstrip()))); i += 1
            out.append("<%s>%s</%s>" % (tag, "".join(items), tag))
        else:
            para = []
            while i < len(lines) and lines[i].strip() and not re.match(r"(## |\||- |\d+\. )", lines[i]):
                para.append(lines[i].strip()); i += 1
            out.append("<p>%s</p>" % md_inline(" ".join(para)))
    return "\n        ".join(out)

def load_articles():
    arts = []
    for f in sorted(glob.glob(os.path.join(ARTICLE_SRC, "*.md"))):
        raw = io.open(f, encoding="utf-8").read()
        _, front, md = raw.split("---\n", 2)
        title = re.search(r'^title: "(.*)"$', front, re.M).group(1)
        desc = re.search(r'^(?:meta_)?description: "(.*)"$', front, re.M).group(1)
        md = re.sub(r"^# .*\n", "", md.strip() + "\n", count=1)
        stem = os.path.basename(f)[:-3]
        app = ARTICLE_APPS[stem.split("-")[0]]
        slug = stem[len("wakebird-"):] if stem.startswith("wakebird-") else stem
        parts = re.split(r"^## (?:Sources|Kilder)\s*$", md, flags=re.M)
        arts.append(dict(title=title, desc=desc, body=parts[0], sources=parts[1] if len(parts) > 1 else "",
                         app=app, lang=app["lang"], slug=slug, key=stem.split("-")[0],
                         path="%s%s/" % (articles_href(app["lang"]), slug)))
    return arts

def article_page(a):
    T, app = ARTICLE_TXT[a["lang"]], a["app"]
    cta = ('<div class="article-cta"><img src="/assets/apps/icons/%s.webp" width="64" height="64" alt="" loading="lazy">'
           '<div><strong>%s</strong><p>%s</p></div><a class="btn" href="%s" target="_blank" rel="noopener">%s</a></div>'
           % (a["key"], esc(app["name"]), esc(app["line"]), app["store"], app["btn"]))
    tool = ARTICLE_TOOLS.get(a["slug"], "")
    src = ""
    if a["sources"].strip():
        src = '<details class="article-sources"><summary>%s</summary>%s</details>' % (
            "Kilder" if a["lang"] == "da" else "Sources", md_html(a["sources"].strip()))
    ld = json.dumps({"@context": "https://schema.org", "@type": "Article", "headline": a["title"],
                     "description": a["desc"], "inLanguage": a["lang"],
                     "url": "https://webspind.com" + a["path"],
                     "author": {"@type": "Person", "name": "Jakob Munch-Brandt"}}, ensure_ascii=False)
    body = """    <article class="policy article">
      <div class="page-head" style="gap:12px">
        <a class="breadcrumb" href="%s">%s</a>
        <h1>%s</h1>
        <p class="updated">%s · %d min</p>
      </div>
      <div class="article-body">
        %s
        %s
      </div>
      %s
      %s
    </article>
    <script type="application/ld+json">%s</script>""" % (
        articles_href(a["lang"]), T["back"], esc(a["title"]), T["by"], max(2, round(len(re.findall(r"\w+", a["body"])) / 200)), md_html(a["body"]), tool, cta, src, ld)
    page(a["path"], esc(a["title"]), esc(a["desc"]), body, lang=a["lang"], redirect=False,
         switch=("/artikler/", "/en/articles/"))

def article_index(lang, arts):
    T = ARTICLE_TXT[lang]
    other = articles_href("en" if lang == "da" else "da")
    rows = "\n".join('        <a class="article-row" href="%s"><img src="/assets/apps/icons/%s.webp" width="56" height="56" alt="" loading="lazy">'
                     '<span><strong>%s</strong><span>%s</span></span></a>' % (a["path"], a["key"], esc(a["title"]), esc(a["desc"]))
                     for a in arts if a["lang"] == lang)
    body = """    <div class="policy article">
      <div class="page-head"><h1>%s</h1><p>%s</p></div>
      <div class="article-list">
%s
      </div>
      <p><a href="%s">%s</a></p>
    </div>""" % (T["h"], T["lede"], rows, other, T["other"])
    page(articles_href(lang), T["title"], T["desc"], body, lang=lang, current="articles", redirect=False,
         switch=("/artikler/", "/en/articles/"), pair=True)

_arts = load_articles()
for _a in _arts:
    article_page(_a)
for _l in ("da", "en"):
    article_index(_l, _arts)

# ---------------------------------------------------------------- free exam tools
# Three client-side tools. Their data is frozen in assets/exam/ by build-exam-data.py
# and inlined here, so a page needs no network call and paid questions never ship.
# Each page exists in one language, so it is exempt from the language redirect.

EXAM_CHECKED = "10. november 2026"
BEK470_URL = "https://www.retsinformation.dk/eli/lta/2024/470"
HEARING_URL = "https://hoeringsportalen.dk/Hearing/Details/71772"
HEARING_LETTER = "https://prodstoragehoeringspo.blob.core.windows.net/00147c2d-7c0a-4e53-81a6-30362a24fdfa/H%C3%B8ringsbrev.pdf"
FAA_MATRIX = "https://www.faa.gov/training_testing/testing/testing_matrix"
FAA_ACS = "https://www.faa.gov/training_testing/testing/acs/uas_acs.pdf"
JP_INSTRUKS = "https://sgavmst.dk/media/ttndlsbs/instruks-for-jagtproeven-2026.pdf"
JP_ARTICLE = "/artikler/jagtproven-saadan-foregaar-den/"
JP_SEASON_ARTICLE = "/artikler/jagtproven-jagttider/"


def exam_data(name):
    return json.load(io.open(os.path.join("assets", "exam", name), encoding="utf-8"))


def inline_json(id_, data):
    return '<script type="application/json" id="%s">%s</script>' % (
        id_, json.dumps(data, ensure_ascii=False).replace("</", "<\\/"))


def ld(*objs):
    return "\n    ".join('<script type="application/ld+json">%s</script>' % json.dumps(o, ensure_ascii=False) for o in objs)


def faq_ld(faq):
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"<[^>]+>", "", a)}} for q, a in faq]}


def quiz_ld(url, name, desc, lang, about):
    return {"@context": "https://schema.org", "@type": "Quiz", "name": name, "description": desc, "url": url,
            "inLanguage": lang, "isAccessibleForFree": True, "about": {"@type": "Thing", "name": about},
            "educationalUse": "practice", "author": {"@type": "Person", "name": "Jakob Munch-Brandt"}}


def faq_html(head, faq):
    return """      <section class="xt-text">
        <h2>%s</h2>
        <div class="faq">
%s
        </div>
      </section>""" % (head, "\n".join('          <details><summary>%s</summary><p class="answer">%s</p></details>' % f for f in faq))


def tool_page(path, title, desc, lang, h1, lede, tool, sections, cta, ldjson, switch, extra_script=""):
    body = """    <div class="support-page xt-page">
      <div class="page-head">
        <h1>%s</h1>
        <p>%s</p>
      </div>
      %s
%s
%s
    </div>
    %s
    <script src="/exam-tools.js" defer></script>%s""" % (h1, lede, tool, "\n".join(sections), cta, ldjson, extra_script)
    page(path, title, desc, body, lang=lang, redirect=False, switch=switch)


def quiz_widget(config, noscript):
    return """<div class="xt-card" id="quiz" data-quiz></div>
      <noscript><p class="xt-note">%s</p></noscript>
      %s""" % (noscript, inline_json("quiz-data", config))


# ---- Part 107 (English, DroneCamp's 40 free questions)

P107_FAQ = [
    ("Are these the real FAA test questions?", "No. They were written for the DroneCamp app from the FAA's Airman Certification Standards and the regulations, and each answer cites its source. DroneCamp and Webspind are not affiliated with the FAA."),
    ("How many questions are on the real Part 107 test?", "The FAA's testing matrix lists the Unmanned Aircraft General test (UAG) at 60 questions, 2 hours and a passing score of 70."),
    ("Does a good score here mean I will pass?", "No. These 40 questions are a sample, so your score tells you what to study next, not how the real test will go."),
    ("Do you keep my answers?", "No. The test runs in your browser. Nothing is sent anywhere or saved, and the page has no tracking, cookies or ads."),
]


def part107_page():
    data = exam_data("part107-free.json")
    n = len(data["questions"])
    cfg = {"lang": "en", "lengths": [10, 20, n], "questions": data["questions"],
           "ui": dict(start="How many questions?", startSub="%d free questions from all five test areas, in a new order every time." % n,
                      go="%d questions", all="All %d", progress="Question %d of %d", check="Check answer",
                      next="Next question", finish="See my score", right="Right.", wrong="Not quite. The right answer is:",
                      source="Source", topic="Topic", score="%d of %d right", again="Take it again", change="Choose another length",
                      review="Review your answers", youSaid="You answered", noAnswer="No answer",
                      note="This is a practice score from a sample, so it can't predict the real test. On the real test the FAA's passing score is 70.",
                      keyHint="Tip: press 1, 2 or 3 to answer, and Enter to go on.")}
    url = "https://webspind.com/part-107-practice-test/"
    title = "Free FAA Part 107 Practice Test, With Every Answer Explained | Webspind"
    desc = "Take a free FAA Part 107 practice test: %d questions across all five test areas, each answer explained with its source. No sign-up, right in your browser." % n
    tool = quiz_widget(cfg, "This practice test needs JavaScript. Everything else on this page works without it.")
    sections = ["""      <section class="xt-text">
        <h2>What the real test looks like</h2>
        <p>The Part 107 knowledge test is the FAA's <strong>Unmanned Aircraft General (UAG)</strong> test: <strong>60 questions, 2 hours, and a passing score of 70</strong>, according to the <a href="%s" target="_blank" rel="noopener">FAA Airman Knowledge Testing Matrix</a> of 25 September 2026. The same document says you need an FAA Tracking Number from IACRA before you test.</p>
        <p>The questions here follow the five areas of the FAA's <a href="%s" target="_blank" rel="noopener">Airman Certification Standards for small UAS</a> (FAA-S-ACS-10B): regulations, airspace, weather, loading and performance, and operations. The regulations were last checked on 7 November 2026.</p>
      </section>""" % (FAA_MATRIX, FAA_ACS),
    """      <section class="xt-text">
        <h2>How to use it</h2>
        <p>Answer first, then read the explanation, even when you got it right. The reason behind an answer is what carries over when the real test asks the same rule a different way. Every answer names the regulation or FAA handbook it comes from, so you can look it up.</p>
        <p>Wrong on a question? Good: that is the topic to read next. Run the test again later and see whether it stuck.</p>
      </section>""",
    faq_html("Questions people ask", P107_FAQ)]
    cta = """      <div class="article-cta">
        <img src="/assets/apps/icons/dronecamp.webp" width="64" height="64" alt="" loading="lazy">
        <div><strong>DroneCamp is on its way</strong><p>This test uses the 40 free questions from DroneCamp, my iPhone app for the Part 107 test. It isn't out yet. The full app has 558 explained questions, 34 chart drills and timed mock tests.</p></div>
        <a class="btn" href="/en/#dronecamp">See DroneCamp</a>
      </div>"""
    tool_page("/part-107-practice-test/", title, desc, "en", "Free FAA Part 107 practice test",
              "Pick a length and answer. You see why each answer is right as you go, with its source. No sign-up.",
              tool, sections, cta,
              ld(quiz_ld(url, "Free FAA Part 107 practice test", desc, "en", "FAA Part 107 remote pilot knowledge test"), faq_ld(P107_FAQ)),
              ("/", "/part-107-practice-test/"))


# ---- jagtprøve-quiz (Danish, a sample from Jagtprøven)

JP_FAQ = [
    ("Er det prøvens rigtige spørgsmål?", "Nej. Spørgsmålene er skrevet til appen Jagtprøven ud fra det offentlige pensum. Quizzen er en øvelse og ikke prøvens egne spørgsmål, og den er ikke tilknyttet myndighederne."),
    ("Hvor mange spørgsmål er der til den rigtige prøve?", "Den skriftlige prøve har 40 spørgsmål. Du skal have mindst 36 rigtige, og du har 30 minutter."),
    ("Hvorfor er der ingen billeder af vildtarter?", "Prøvens afsnit om artskendskab bygger på billeder. Dem øver du i appen, så denne quiz nøjes med de øvrige afsnit."),
    ("Gemmer I mine svar?", "Nej. Quizzen kører i din browser. Intet sendes, intet gemmes, og siden har hverken cookies, reklamer eller måling."),
]


def jagtquiz_page():
    data = exam_data("jagtquiz.json")
    n = len(data["questions"])
    cfg = {"lang": "da", "lengths": [10, 20, n], "questions": data["questions"],
           "ui": dict(start="Hvor mange spørgsmål?", startSub="%d gratis spørgsmål, i en ny rækkefølge hver gang." % n,
                      go="%d spørgsmål", all="Alle %d", progress="Spørgsmål %d af %d", next="Næste spørgsmål", finish="Se mit resultat",
                      right="Rigtigt.", wrong="Ikke helt. Det rigtige svar er:", source="Kilde", topic="Emne",
                      score="%d af %d rigtige", again="Tag den igen", change="Vælg en anden længde",
                      review="Se dine svar", youSaid="Du svarede", noAnswer="Intet svar",
                      note="Det her er en øvelse med et udsnit af spørgsmålene, så det siger ikke, hvordan prøven går. Til den rigtige skriftlige prøve skal du have mindst 36 af 40 rigtige.",
                      keyHint="Tip: tryk 1, 2, 3 eller 4 for at svare og Enter for at gå videre.")}
    url = "https://webspind.com/jagtproeve-quiz/"
    title = "Jagtprøve-quiz: %d gratis spørgsmål med forklaring | Webspind" % n
    desc = "Øv til jagtprøven gratis: %d spørgsmål med forklaring og kilde på hvert svar, om lovgivning, vildt, våben, etik og sikkerhed. Uden login, direkte i browseren." % n
    tool = quiz_widget(cfg, "Quizzen kræver JavaScript. Resten af siden virker uden.")
    sections = ["""      <section class="xt-text">
        <h2>Sådan er den rigtige prøve</h2>
        <p>Den skriftlige jagtprøve har <strong>40 spørgsmål, og du skal have mindst 36 rigtige</strong>. Du har 30 minutter. Det står i <a href="%s" target="_blank" rel="noopener">Instruks for jagtprøven 2026</a> fra Styrelsen for Grøn Arealomlægning og Vandmiljø.</p>
        <p>Vil du vide, hvordan hele dagen foregår, også den praktiske del, så læs <a href="%s">sådan foregår jagtprøven</a>. Tjek altid jagttegn.dk for de aktuelle regler, før du melder dig til.</p>
      </section>""" % (JP_INSTRUKS, JP_ARTICLE),
    """      <section class="xt-text">
        <h2>Sådan får du mest ud af det</h2>
        <p>Svar først, og læs så forklaringen, også når du havde ret. Det er grunden bag svaret, du skal bruge, når prøven stiller det samme spørgsmål på en ny måde. Under hvert svar står kilden, så du kan slå reglen op.</p>
        <p>Quizzen dækker lovgivning, vildtbiologi, våben, etik og sikkerhed. Jagttiderne kan du slå op dag for dag i <a href="/jagttider-i-dag/">Hvad må jeg jage i dag?</a>.</p>
      </section>""",
    faq_html("Det spørger folk om", JP_FAQ)]
    cta = """      <div class="article-cta">
        <img src="/assets/apps/icons/jagtproven.webp" width="64" height="64" alt="" loading="lazy">
        <div><strong>Hele teorien i Jagtprøven</strong><p>Quizzen er et udsnit fra min app. Appen har 522 spørgsmål med en forklaring på hvert svar, prøvesæt på tid og alle 100 vildtarter med foto. Den er uafhængig af myndighederne.</p></div>
        <a class="btn" href="%s" target="_blank" rel="noopener">Hent i App Store</a>
      </div>""" % STORE_JAGTPROVEN
    tool_page("/jagtproeve-quiz/", title, desc, "da", "Jagtprøve-quiz: øv gratis her",
              "Vælg en længde, og svar løs. Du ser forklaringen og kilden, så snart du har svaret. Intet login.",
              tool, sections, cta,
              ld(quiz_ld(url, "Jagtprøve-quiz", desc, "da", "Den skriftlige jagtprøve i Danmark"), faq_ld(JP_FAQ)),
              ("/jagtproeve-quiz/", "/en/"))


# ---- Hvad må jeg jage i dag? (Danish, BEK 470/2024)

JT_FAQ = [
    ("Hvor kommer jagttiderne fra?", "Fra bekendtgørelse nr. 470 af 17. maj 2024 om jagttid for visse pattedyr og fugle m.v., bilag 1 til 4, som jeg har sammenholdt med den offentliggjorte tekst på Retsinformation."),
    ("Må jeg stole på listen?", "Brug den som en hjælp til at komme i gang. Du har selv ansvaret for at tjekke de lokale regler og den gældende bekendtgørelse, før du går på jagt."),
    ("Hvad med lokale jagttider?", "Vælg dit område, så lægger siden de lokale jagttider i bilag 2, 3 og 4 oven på de generelle. Områderne i bilag 3 og 4 er afgrænset af veje og vandløb, så du skal selv vælge det rigtige. Siden gætter ikke på, hvor du er."),
    ("Er nye jagttider på vej?", "Et udkast til nye jagttider er sendt i høring, med forventet ikrafttræden den 1. februar 2027. Det er ikke vedtaget. Vælger du en dato efter den dag, gør siden opmærksom på det."),
]


def jagttider_page():
    data = exam_data("jagttider.json")
    tool = """<div class="xt-card" id="seasons" data-seasons>
        <div class="xt-form">
          <label class="xt-field">Dato
            <input type="date" id="st-date" required>
          </label>
          <label class="xt-field">Område, valgfrit
            <select id="st-small"><option value="">Hele landet (kun de generelle jagttider)</option></select>
          </label>
          <details class="xt-more">
            <summary>Kronvildt og dåvildt: vælg område</summary>
            <p>Bilag 3 og 4 har egne områder, der følger veje og vandløb. Vælg dem, der passer på din jagt. Kortene er bilag 5 til 28 i bekendtgørelsen.</p>
            <label class="xt-field">Kronvildt<select id="st-kron"><option value="">Ikke valgt</option></select></label>
            <p class="xt-detail" id="st-kron-detail"></p>
            <label class="xt-field">Dåvildt<select id="st-daa"><option value="">Ikke valgt</option></select></label>
            <p class="xt-detail" id="st-daa-detail"></p>
          </details>
        </div>
        <div id="st-banner"></div>
        <h2 class="xt-summary" id="st-summary" aria-live="polite"></h2>
        <div id="st-results"></div>
        <p class="xt-source"><strong>Kilde:</strong> <a href="%s" target="_blank" rel="noopener">bekendtgørelse nr. 470 af 17. maj 2024</a>, bilag 1 til 4. <strong>Sidst tjekket:</strong> %s. Tjek altid de lokale regler og den gældende bekendtgørelse, før du går på jagt.</p>
      </div>
      <noscript><p class="xt-note">Opslaget kræver JavaScript. Du finder de samme jagttider i <a href="%s">bekendtgørelsen på Retsinformation</a>.</p></noscript>
      %s""" % (BEK470_URL, EXAM_CHECKED, BEK470_URL, inline_json("season-data", data))
    desc = "Se hvilke arter der har jagttid i dag eller på en anden dato, med de lokale jagttider for dit område. Efter bekendtgørelse nr. 470 af 2024."
    title = "Hvad må jeg jage i dag? Jagttider dato for dato | Webspind"
    url = "https://webspind.com/jagttider-i-dag/"
    sections = ["""      <section class="xt-text">
        <h2>Hvornår på døgnet må du jage?</h2>
        <p>Dagens liste siger, hvilke arter der har jagttid på datoen. Tidspunktet på dagen har sine egne regler i bekendtgørelsens § 3:</p>
        <ul>
          <li>Som hovedregel må du jage fra solopgang til solnedgang.</li>
          <li>Ænder og gæs må jages fra 1½ time før solopgang til 1½ time efter solnedgang.</li>
          <li>Husskade, gråkrage og sortkrage må jages fra 1 time før solopgang til solnedgang.</li>
          <li>For kronvildt gælder andre tider nogle steder, efter bilag 3. Vælger du et område ovenfor, står det ved arten.</li>
        </ul>
      </section>""",
    """      <section class="xt-text">
        <h2>Nye jagttider er sendt i høring</h2>
        <p>Styrelsen for Grøn Arealomlægning og Vandmiljø sendte <a href="%s" target="_blank" rel="noopener">et udkast til ny jagttidsbekendtgørelse i høring</a> den 5. november 2026, med høringsfrist den 3. december og forventet ikrafttræden den 1. februar 2027. Det er ikke vedtaget, så siden viser de regler, der gælder nu.</p>
        <p>Ifølge <a href="%s" target="_blank" rel="noopener">høringsbrevet</a> foreslås det blandt andet, at jagttiden på hare slutter 15. januar i hele landet, at canadagås også får jagttid i februar, at ringdue får jagttid fra 1. oktober med krav om jagt på flokke i oktober og november, og at jagttiden på edderfugl indstilles. Lokale jagttider for hjortevildt ændres også.</p>
        <p>Vil du lære mønsteret bag datoerne, så læs <a href="%s">jagttider til jagtprøven</a>, og øv dig i <a href="/jagtproeve-quiz/">jagtprøve-quizzen</a>.</p>
      </section>""" % (HEARING_URL, HEARING_LETTER, JP_SEASON_ARTICLE),
    faq_html("Det spørger folk om", JT_FAQ)]
    cta = """      <div class="article-cta">
        <img src="/assets/apps/icons/jagtproven.webp" width="64" height="64" alt="" loading="lazy">
        <div><strong>Jagttiderne på telefonen</strong><p>Jagtprøven er min app til jagttegnet. Den har alle arters jagttider med noter om de lokale regler og 522 spørgsmål med forklaring. Den er uafhængig af myndighederne.</p></div>
        <a class="btn" href="%s" target="_blank" rel="noopener">Hent i App Store</a>
      </div>""" % STORE_JAGTPROVEN
    webapp = {"@context": "https://schema.org", "@type": "WebApplication", "name": "Hvad må jeg jage i dag?", "url": url,
              "description": desc, "inLanguage": "da", "applicationCategory": "ReferenceApplication",
              "operatingSystem": "Alle med en browser", "isAccessibleForFree": True,
              "offers": {"@type": "Offer", "price": "0", "priceCurrency": "DKK"},
              "author": {"@type": "Person", "name": "Jakob Munch-Brandt"}}
    tool_page("/jagttider-i-dag/", title, desc, "da", "Hvad må jeg jage i dag?",
              "Vælg en dato og eventuelt dit område, så ser du, hvilke arter der har jagttid.",
              tool, sections, cta, ld(webapp, faq_ld(JT_FAQ)), ("/jagttider-i-dag/", "/en/"))


part107_page()
jagtquiz_page()
jagttider_page()



for lang in ("da", "en"):
    L = LANG[lang]

    page(P(lang, "/"), L["home_title"], L["home_desc"], home_body(L, lang), lang=lang, twin=TWIN_HOME)

    app = "\n\n".join([hero_app(L, lang), disclaimer(L, lang), highlights(L, lang),
                       app_section(L, lang), topics_section(L, lang), seasons_section(L, lang), tools_section(L, lang),
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


# ---------------------------------------------------------------- hand-written pages

def reshell(rel):
    """Re-wrap a hand-written page in the current shell. Its URL, <title>,
    description, language and <main> stay exactly as they are — App Store
    Connect links to these, so the path must never change."""
    src = io.open(rel, encoding="utf-8").read()
    path = "/" + rel
    html_lang = re.search(r'<html lang="([^"]+)"', src).group(1)
    title = re.search(r"<title>(.*?)</title>", src, re.S).group(1)
    desc = re.search(r'<meta name="description" content="([^"]*)"', src).group(1)
    main = re.search(r"<main[^>]*>\n?(.*?)\n?\s*</main>", src, re.S).group(1)
    shell = "da" if html_lang == "da" else "en"
    section = "privacy" if "/privacy/" in path else "support"
    index = {"privacy": "/privacy/", "support": "/support.html"}[section]
    def exists(u):
        return os.path.isfile(u.lstrip("/"))
    pair = False
    if html_lang == "da":
        twin_en = "/en" + path
        pair = exists(twin_en)
        switch = (path, twin_en if pair else "/en" + index)
    elif html_lang == "en":
        twin_da = path[3:]
        pair = exists(twin_da)
        switch = (twin_da if pair else index, path)
    else:
        switch = (index, "/en" + index)
    _page(path, title, desc, main, lang=shell, current=section, switch=switch,
          redirect=False, html_lang=html_lang, pair=pair)


# Folders with their own generator are never rewritten or listed here.
OWN_BUILD = ("tools/", "beregnere/")

for rel in sorted(glob.glob("privacy/*.html") + glob.glob("support/*.html") + glob.glob("*/privacy/*.html")
                  + glob.glob("*/support/*.html")):
    if rel.startswith(OWN_BUILD):
        continue
    # privacy/jakob-channels.html is a standalone policy for a private API tool
    # (Google's review reads it as is), so it keeps its own page.
    if "/" + rel not in WRITTEN and not rel.startswith("concepts/") and rel != "privacy/jakob-channels.html":
        reshell(rel)


# ---------------------------------------------------------------- sitemap

def loc(p):
    return p[:-len("index.html")] if p.endswith("index.html") else p

urls = sorted({loc(p) for p in WRITTEN if p != "/404.html"} |
              {"/" + r for r in glob.glob("privacy/*.html") + glob.glob("support/*.html")
               + glob.glob("*/privacy/*.html") + glob.glob("*/support/*.html")
               if not r.startswith("concepts/") and not r.startswith(OWN_BUILD)})
io.open("sitemap.xml", "w", encoding="utf-8").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join("  <url><loc>https://webspind.com%s</loc></url>\n" % u for u in urls) + "</urlset>\n")
print("  wrote sitemap.xml (%d urls)" % len(urls))
