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

- [x] **Sprog.** Besvaret af "Webspind v2"-designet: siden er nu på dansk.
- [ ] **Jagtprøven-status.** Forsiden viser nu "App Store-link følger" som
      pladsholder overalt i stedet for et "In Development"-badge. Skal
      skiftes til det rigtige link, når appen er godkendt.
- [ ] **Games-sektionen.** Fjernet fra forsiden i v2-redesignet, som er
      bygget ensidigt om Jagtprøven. Skal spil have en plads igen — egen
      sektion, eller en separat side — når det første er klar?
- [ ] **Dark mode.** Fjernet 1. september på din anmodning — siden er hvid
      uanset systemindstilling. Paletten ligger i git-historikken og kan
      hentes tilbage, evt. med en manuel til/fra-knap i stedet for at følge
      systemet.

---

## Forsiden

### Hero (øverste sektion)

_Overskrift, brødtekst, de to knapper, spindet i baggrunden._

-

### Apps-sektionen

_Kortene, ikonerne, badget, teksten._

-

### Games-sektionen

_Den tomme tilstand._

-

### Get in Touch

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

---

## Ting jeg holder øje med selv

Så du ikke behøver tjekke dem:

- Kontrast mindst 4.5:1 på al brødtekst
- Tap-targets mindst 44 px
- `prefers-reduced-motion` respekteret
- Ingen døde links, HTML'en parser rent
