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

- [ ] **Sprog.** Siden er på engelsk, men Jagtprøven er en dansk app til dansk
      App Store. Skal siden være dansk? Eller begge dele?
- [ ] **Jagtprøven-status.** Står som "In Development". Når den er udgivet:
      skal badget skiftes og et App Store-link ind?
- [ ] **Games-sektionen.** Står tom med vilje. Hvilke spil skal på, og med
      hvilke navne?
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

---

## Ting jeg holder øje med selv

Så du ikke behøver tjekke dem:

- Kontrast mindst 4.5:1 på al brødtekst
- Tap-targets mindst 44 px
- `prefers-reduced-motion` respekteret
- Ingen døde links, HTML'en parser rent
