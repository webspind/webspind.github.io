# UX-noter — webspind.com

Din arbejdsfil. Gennemgå siden når du har lyst, skriv hvad der irriterer dig,
og giv mig så filen — jeg læser den og laver ændringerne.

**Sådan bruger du den:** skriv i fri tekst under den relevante overskrift. Du
behøver ikke vide hvad tingene hedder i koden, "knappen i toppen sidder for
tæt på kanten" er rigeligt. Sæt `[ ]` foran hvis det er noget der skal laves,
og lad det stå — jeg krydser af når det er gjort.

Skriv gerne **hvorfor** noget føles forkert, ikke kun hvad. "Det ser rodet ud"
fortæller mig mere end "flyt den 4 px", fordi løsningen ofte er en anden end
den man selv gætter på.

---

## Åbne punkter

Ting jeg allerede ved mangler en beslutning fra dig:

- [x] **Sprog.** Siden er tosproget fra 1. sep. 2026: dansk på `/`, engelsk
      på `/en/`. Browserens sprog afgør, hvor du lander første gang, og
      DA | EN-skifteren i headeren husker dit valg. Se "Sprog" under
      Gennemgående, hvis noget i oversættelserne skurrer.
- [ ] **Jagtprøven-status.** Forsiden viser nu "App Store-link følger" som
      pladsholder overalt i stedet for et "In Development"-badge. Skal
      skiftes til det rigtige link, når appen er godkendt.
- [x] **Games-sektionen.** Tilbage på forsiden som en tom tilstand
      ("Intet udgivet endnu"). Når det første spil er klar, fyldes
      `GAMES`-listen i `build-pages.py`, og den tomme tilstand bliver
      automatisk til kort ligesom Apps-sektionen.
- [ ] **Dark mode.** Fjernet 1. september på din anmodning — siden er hvid
      uanset systemindstilling. Paletten ligger i git-historikken og kan
      hentes tilbage, evt. med en manuel til/fra-knap i stedet for at følge
      systemet.

---

## Forsiden

### Hero (øverste sektion)

_Eyebrow, overskrift, den ene linje brødtekst, de to knapper. Ingen
foto og ingen parallax længere — heroen er ren tekst._

-

### Apps-sektionen

_Jagtprøven-kortet: ikonet, navnet, platformlinjen, pitchen, badget
"App Store-link følger" og "Læs mere"-linket._

-

### Games-sektionen

_Den tomme tilstand: ikonet, "Intet udgivet endnu" og linjen under._

-

### Kontakt-striben

_Den nederste stribe med support- og privatlivsknapperne._

-

---

## App-siden (`/jagtproven/`)

_Hele Jagtprøven-pitchen ligger her nu, ikke på forsiden. Hero med
app-ikon, de to skærmbilleder og taltavlen, derefter forbeholdet,
de tre highlight-kort, "Hvad du får", de syv emner, jagttiderne,
gratis-afsnittet, om-afsnittet og den afsluttende CTA._

_Fugle-rækken og gåse-billedet er væk — det var de sidste
Wikimedia-fotos. Fuglekending er stadig dækket af highlight-kortet og
skærmbilledet._

-

---

## Privacy-siderne

_Oversigten på `/privacy/` og selve politikken._

-

---

## Support-siden

-

---

## Gennemgående

### Header og navigation

-

### Footer

-

### Sprog

_Dansk på `/`, engelsk på `/en/`. Første besøg uden gemt valg: en
eksplicit `/en/`-adresse respekteres altid, og kun besøgende der lander
på den danske forside med en browser der ikke er sat til dansk, sendes
videre til `/en/`. Trykker du DA eller EN i headeren, gemmes valget i
`localStorage`, og fra da af slår det gemte valg browsersproget fra i
begge retninger. Privatlivspolitikken
for Jagtprøven findes kun på dansk — appen er dansk — og 404-siden er
tosproget på én side; begge dele springer omdirigeringen over._

_Skriv her, hvis en engelsk formulering lyder forkert, eller hvis der
er dansk tekst tilbage i den engelske version._

-

### Farver

Nuværende palet (fra `Jagtproven/Design/Theme.swift`):

| Rolle | Værdi | Hvor det bruges |
|---|---|---|
| Papir | `#faf8f3` | Sidens baggrund |
| Kort | `#fffefb` | Kort og felter |
| Skov | `#213d2e` | Links, accenter, primærknap |
| Rav | `#cc7524` | Fremhævning, prikken i logoet |
| Blød rav | `#f5deb8` | Badges, callouts, sekundærknap |
| Blæk | `#1a1f1a` | Overskrifter |
| Blødt blæk | `#61665c` | Brødtekst |
| Hårstreg | `#d9d1bd` | Kanter og linjer |

-

### Typografi

SF Pro Rounded til overskrifter, SF Pro Text til brødtekst. Brødtekst 17 px.

-

### Afstande

8 pt-grid: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48. Kortenes radius er 24
(koncentrisk: ikon-flise 8 + padding 16).

-

### Mobil

_Kig på den på telefonen. Alt under 640 px har egne regler._

-

---

## Idéer til senere

Ting der ikke haster, men som du ikke vil glemme:

-

---

## Ændret

Log over hvad der er lavet, så vi kan se hvad der virkede.

- **1. sep. 2026** — Redesign efter `UXDesignGuide2026.md` og `Theme.swift`:
  app-paletten, 8 pt-grid, koncentriske radier, Title Case-overskrifter,
  spring-animationer, tomme tilstande med symbol og én linje.
- **1. sep. 2026** — Dark mode fjernet, siden er hvid uanset systemtema.
- **1. sep. 2026** — Implementeret "Webspind v2" (Claude Design-projekt):
  ny forside ensidigt bygget om Jagtprøven, dansk tekst gennemgående, ny
  palet og typografi (Bricolage Grotesque / Instrument Sans / Newsreader),
  scroll-reveal og parallax i hero, FAQ med `<details>`, og en support-
  formular der bygger en mailto-besked lokalt (intet sendes til en server).
  Apps/Games-portefølje-sektionerne er væk fra forsiden — se åbent punkt
  om Games ovenfor.
- **1. sep. 2026** — Siden bygget om til et studie-showcase: forsiden er
  nu kort (hero, Apps, Games, kontakt-stribe), og hele Jagtprøven-pitchen
  er flyttet til sin egen side på `/jagtproven/`. Apps-sektionen bygges
  fra en liste, så app nummer to er én linje data og ikke ny markup.
  Games er tilbage som tom tilstand.
- **1. sep. 2026** — Siden er blevet tosproget: dansk på `/`, engelsk på
  `/en/`, begge genereret fra én strengtabel i `build-pages.py`. DA |
  EN-skifter i headeren, `hreflang`-alternativer på alle tosprogede
  sider, og førstegangsbesøg sendes til det rigtige træ ud fra browserens
  sprog.
- **1. sep. 2026** — De sidste Wikimedia-fotos er væk (fugle-rækken,
  gåse-billedet og rådyret i heroen), og dermed også kreditlinjen i
  footeren. Alle billeder på siden er nu vores egne fra `assets/`.
- **1. sep. 2026** — App-sektionens pladsholdere erstattet med rigtigt
  indhold: bygget Jagtprøven i iOS Simulator og hentet et quiz- og et
  fuglekendings-skærmbillede derfra, plus det faktiske app-ikon fra
  `Assets.xcassets`. Ligger i `assets/` i dette repo.

---

## Ting jeg holder øje med selv

Så du ikke behøver tjekke dem:

- Kontrast mindst 4.5:1 på al brødtekst
- Tap-targets mindst 44 px
- `prefers-reduced-motion` respekteret
- Ingen døde links, HTML'en parser rent
