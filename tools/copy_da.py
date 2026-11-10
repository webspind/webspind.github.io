# Dansk tekst til /tools/. Varm, klar og sand: her må ikke stå noget, koden ikke gør.
NAV_LABEL = "Hovedmenu"
NAV_TOOLS = "Værktøjer"
NAV_PDF = "PDF-værktøjer"
LANGUAGE = "Sprog"
FOOT_TOOLS = "Webspind-værktøjer"
LICENCES = "Licenser"
BYLINE = "Lavet af Webspind, et enkeltmandsstudie i Danmark. © 2026"
HOW_TITLE = "Sådan gør du"
GOOD_TITLE = "Godt at vide"
FAQ_TITLE = "Spørgsmål"
MORE_TITLE = "Flere værktøjer"
PDF_TILE_NAME = "PDF-værktøjer"
PDF_TILE_DESC = "Flet, opdel, komprimer og underskriv PDF'er på samme måde: på din enhed."
PRIVACY_TITLE = "Privatliv"
PRIVACY_DESC = "Sådan behandler Webspinds værktøjer dine filer: de bliver på din enhed. Hvad der hentes, hvad der gemmes, og hvad der ikke indsamles."

UI = {
    "skip": "Spring til værktøjet", "noscript": "Værktøjet kræver JavaScript.",
    "local": "Behandles på din enhed. Intet bliver uploadet.",
    "drop": "Træk filer herhen eller", "choose": "vælg filer", "dropOne": "Træk en fil herhen eller", "chooseOne": "vælg en fil",
    "run": "Start", "working": "Arbejder…", "done": "Færdig", "download": "Hent", "downloadAll": "Hent alle (zip)", "zipping": "Laver zip-filen…",
    "again": "Start forfra", "remove": "Fjern", "cancel": "Stop", "stopping": "Stopper…", "stopped": "Stoppet. Der blev ikke gemt noget.",
    "tryAnyway": "Prøv alligevel", "loadingEngine": "Gør videomotoren klar…", "processing": "Arbejder på det:", "size": "Størrelse", "before": "før", "after": "efter", "of": "af",
    "warnPhone": "Det her er meget for en telefon ({size}). Det kan tage lang tid eller stoppe, fordi telefonen løber tør for hukommelse. En computer klarer det bedre. Du kan stadig prøve.",
    "err": {
        "wrongType": "Værktøjet kan ikke åbne den type fil. Tjek filen, og prøv igen.",
        "someSkipped": "Nogle filer blev sprunget over, fordi værktøjet ikke kan åbne den type.",
        "skippedN": "{n} fil(er) kunne ikke åbnes og blev sprunget over.",
        "unreadable": "Vi kunne ikke læse filen. Den er måske beskadiget eller i et format, værktøjet ikke kender.",
        "noAudio": "Vi kunne ikke finde noget lyd i filen.",
        "noSpeech": "Vi hørte ikke noget tale i filen. Hvis der er tale, så tjek, at det rigtige sprog er valgt.",
        "memory": "Din enhed løb tør for hukommelse til opgaven. Luk andre faner, eller prøv en mindre fil.",
        "modelDownload": "Vi kunne ikke hente talemodellen. Tjek din internetforbindelse, og prøv igen. Din fil er ikke sendt nogen steder hen.",
        "needSize": "Skriv først den størrelse, du vil have.",
        "generic": "Noget gik galt. Prøv igen, eller prøv en mindre fil.",
    },
}

HUB = {
    "title": "Gratis værktøjer til dine filer, på din egen enhed | Webspind",
    "desc": "Lav lyd om til tekst, komprimer video, lav HEIC om til JPG og fjern baggrunden fra billeder i din browser. Dine filer bliver aldrig uploadet.",
    "eyebrow": "Dine filer forlader aldrig din enhed",
    "h1": "Praktiske værktøjer, der aldrig uploader dine filer",
    "p": "Alt foregår i din browser, på din egen computer eller telefon. Intet bliver sendt til en server, så du trygt kan bruge dem til private optagelser, familievideoer og billeder.",
    "why": [
        ("Ingen upload", "Dine filer bliver åbnet og ændret på din egen enhed. Vi ser dem aldrig."),
        ("Ingen konto", "Ingen tilmelding, ingen e-mail og intet vandmærke. Åbn siden, og brug den."),
        ("Ærlige om grænserne", "Din enhed gør arbejdet, så meget lange videoer tager tid. Hver side fortæller, hvad du kan forvente."),
    ],
    "faq": [
        ("Bliver mine filer uploadet?", "Nej. Dine filer bliver åbnet og behandlet i din browser på din egen enhed. To af værktøjerne, transskription og fjernelse af baggrund, henter en AI-model første gang, du bruger dem. Den vej går det kun den ene vej: modellen kommer til dig, og dine filer bliver, hvor de er."),
        ("Er det virkelig gratis?", "Ja. Der er ingen konto, ingen prøveperiode og intet vandmærke."),
        ("Hvorfor er nogle værktøjer langsommere end sider, der uploader?", "Det er din egen enhed, der arbejder, i stedet for en lejet server. Det er prisen for privatlivet, og derfor kan en lang video tage et stykke tid."),
    ],
}

PRIVACY = """<p>Webspinds værktøjer kører i din browser. Den lyd, video og de billeder, du vælger, bliver åbnet og behandlet på din egen enhed. De bliver ikke uploadet, gemt eller set af nogen.</p>
<h2>Det henter din browser</h2>
<ul>
<li>Siderne og den kode, der gør arbejdet, kommer fra webspind.com, som ligger på GitHub Pages. Som ved alle hjemmesider får GitHub de almindelige tekniske oplysninger (fx din IP-adresse), når din browser beder om en side. Dem får vi ikke.</li>
<li>To værktøjer bruger en AI-model: Transskription og Fjern baggrund. Hver af dem henter sin model, ikke dine filer, første gang du bruger det, fra den offentlige modeltjeneste Hugging Face. Din browser gemmer modellen i sin cache, så den ikke skal hentes igen næste gang.</li>
</ul>
<h2>Det gør vi ikke</h2>
<ul>
<li>Ingen cookies, ingen statistik, ingen sporing og ingen reklamer.</li>
<li>Ingen konti og ingen tilmelding.</li>
<li>Intet af det, du behandler, bliver sendt til os eller andre.</li>
</ul>
<h2>Det bliver på din enhed</h2>
<p>Modellerne og programfilerne ligger i din browsers almindelige cache, så værktøjerne starter hurtigere næste gang. Du fjerner dem ved at rydde sidens data i browserens indstillinger. Dine egne filer findes kun i fanens hukommelse, mens du bruger værktøjet, og er væk, når du trykker Start forfra eller lukker fanen.</p>
<p>De open source-dele, vi bruger, og deres licenser står i <a href="/tools/LICENSES.md">LICENSES.md</a>. Spørgsmål? Skriv til <a href="mailto:webspind@gmail.com">webspind@gmail.com</a>.</p>
"""

TOOLS = {
    "transcribe": {
        "name": "Lyd til tekst",
        "tile": "Få tale i lyd og video lavet om til tekst, du kan kopiere, og undertekster.",
        "title": "Transskriber lyd og video til tekst gratis på din enhed | Webspind",
        "desc": "Få interviews, stemmememoer og videoer lavet om til tekst og undertekster (SRT) i din browser. Virker på dansk og flere sprog. Din optagelse bliver aldrig uploadet.",
        "h1": "Transskriber lyd eller video til tekst",
        "lead": "Få tale lavet om til tekst, du kan kopiere, og undertekster. På dansk, engelsk og mange andre sprog.",
        "local": "Din optagelse bliver på din enhed. Kun talemodellen bliver hentet.",
        "button": "Transskriber",
        "steps": [
            "Vælg en optagelse eller en video. Almindelige formater som MP3, M4A, WAV, MP4 og MOV virker alle.",
            "Vælg det sprog, der bliver talt, så værktøjet ved, hvad det skal lytte efter.",
            "Tryk Transskriber. Når det er færdigt, kan du kopiere teksten eller hente den som tekstfil eller SRT-undertekster.",
        ],
        "notes": [
            "Transskriptionen kører på din egen enhed med Whisper, en talegenkendelsesmodel fra OpenAI. Første gang henter din browser modellen, ikke dine filer, én gang. Bagefter starter den fra din browsers cache.",
            "Hastigheden afhænger af din enhed. Det går hurtigst på en computer med en nyere grafikchip. Uden en må du regne med, at transskriptionen tager cirka lige så lang tid som optagelsen, eller længere på ældre maskiner og telefoner. Lad fanen stå åben, mens den arbejder.",
            "Det er et godt første udkast, ikke en autoriseret udskrift. Navne og utydelig tale kan komme forkert ud, og værktøjet skelner ikke mellem talere. Læs det igennem, hvis det skal være helt rigtigt.",
        ],
        "faq": [
            ("Bliver min optagelse uploadet?", "Nej. Lyden bliver i din browser på din egen enhed. Det eneste, der hentes, er talemodellen, første gang du bruger den."),
            ("Virker det på dansk?", "Ja. Vælg Dansk som sprog. Brug Mest præcis, hvis din computer tilbyder den, og ellers Standard. Hurtig-modellen laver mange flere fejl på dansk."),
            ("Hvor lang må optagelsen være?", "Lange optagelser tager tilsvarende længere tid og bruger mere hukommelse. I vores test tog en optagelse på 15 minutter cirka 5 minutter på en bærbar med indstillingen Hurtig. En time burde gå fint på en computer med rigeligt hukommelse. På en telefon skal du helst holde dig under cirka 20 minutter."),
            ("Kan jeg lave undertekster?", "Ja. Hent SRT-filen, som de fleste videoredigeringsprogrammer og afspillere kan læse. Værktøjet sætter tider på hver linje for dig."),
            ("Er det gratis?", "Ja. Ingen konto, ingen minutgrænse og intet vandmærke."),
        ],
        "tl": {
            "readingAudio": "Læser lyden…", "preparing": "Gør talemodellen klar…", "downloadingModel": "Henter talemodellen (kun første gang):", "transcribing": "Transskriberer:",
            "language": "Sproget i optagelsen", "accuracy": "Præcision",
            "modelBase": "Hurtig (henter op til 140 MB)", "modelSmall": "Standard (henter op til 300 MB)", "modelTurbo": "Mest præcis (henter cirka 560 MB)",
            "modelHint": "Modellen bliver hentet én gang og gemt i din browser. Det gør dine filer ikke.",
            "textResult": "Din tekst", "copy": "Kopiér teksten", "copied": "Kopieret", "finished": "Færdig på {time}, på din {engine}.", "onGpu": "grafikchip", "onCpu": "processor",
        },
    },
    "compress-video": {
        "name": "Komprimer video",
        "tile": "Gør en video lille nok til at sende, dele eller uploade, uden at miste billedet.",
        "title": "Komprimer video gratis, uden at uploade den | Webspind",
        "desc": "Gør MP4, MOV og andre videoer mindre i din browser. Din video bliver aldrig uploadet. Vælg selv kvalitet og opløsning, uden tilmelding og uden vandmærke.",
        "h1": "Komprimer video",
        "lead": "Gør en video mindre, så den er nem at sende, dele og gemme. Du vælger hvor lille; resten sker på din enhed.",
        "button": "Komprimer video",
        "steps": ["Vælg en video fra din computer eller telefon.", "Vælg kvaliteten og den største opløsning, du vil have.", "Tryk Komprimer video, følg med i fremdriften, og hent MP4-filen."],
        "notes": [
            "Din enhed komprimerer videoen med én processorkerne ad gangen, fordi det er det, en statisk hjemmeside som denne kan i en browser. Det er langsommere end et program på computeren: som tommelfingerregel tager det en bærbar fra cirka et minut til nogle minutter at komprimere ét minuts 1080p-video til 720p, alt efter hvor meget der sker i billedet.",
            "En fornuftig grænse er filer op til cirka 1 GB på en computer og nogle hundrede MB på en telefon. Resultatet ligger i hukommelsen, indtil du henter det, så meget store videoer kan løbe tør.",
            "Resultatet er en MP4 med H.264-video og AAC-lyd, som kan afspilles næsten overalt. Hvis videoen allerede er godt komprimeret, får du besked i stedet for en større fil.",
        ],
        "faq": [
            ("Bliver min video uploadet?", "Nej. Videoen bliver på din enhed. Motoren, der komprimerer den, kører i din browser."),
            ("Hvorfor er det langsommere end andre sider?", "Andre sider sender din video til deres computere. Her er det din enhed, der arbejder, med én processorkerne i browseren. Det tager længere tid, men videoen forlader aldrig dig."),
            ("Hvad er den bedste indstilling?", "Balanceret i 720p passer til de fleste klip: Det gør som regel en telefonvideo flere gange mindre, og den ser stadig godt ud på enhver skærm."),
            ("Kan jeg stoppe den?", "Ja. Tryk Stop når som helst. Der bliver ikke gemt noget, før opgaven er færdig."),
        ],
        "tl": {
            "quality": "Kvalitet", "levelSmall": "Mindst mulig fil", "levelBalanced": "Balanceret", "levelHigh": "Høj kvalitet",
            "resolution": "Største opløsning", "resolutionHint": "En video, der er mindre end det, beholder sin størrelse.", "mute": "Fjern lyden",
            "notSmaller": "Videoen er allerede godt komprimeret. Prøv Mindst mulig fil eller en lavere opløsning, eller behold bare din original.",
        },
    },
    "video-to-mp3": {
        "name": "Video til MP3",
        "tile": "Træk lyden ud af en video, og gem den som MP3.",
        "title": "Video til MP3, uden at uploade din fil | Webspind",
        "desc": "Lav MP4, MOV og andre videoer om til MP3 i din browser. Vælg selv kvaliteten. Ingen upload, ingen tilmelding og intet vandmærke.",
        "h1": "Lav video om til MP3",
        "lead": "Behold kun lyden fra en video, og gem den som en MP3, du kan afspille overalt.",
        "button": "Lav MP3",
        "steps": ["Vælg en video. En lydfil som M4A eller WAV virker også.", "Vælg en kvalitet. 192 kbps passer til det meste.", "Tryk Lav MP3, og hent filen."],
        "notes": [
            "Lyden bliver lavet om på din egen enhed, så en lang video kan tage et stykke tid på en telefon. Det er det hurtigste af videoværktøjerne, fordi billedet ikke skal røres.",
            "Brug det til optagelser og videoer, der er dine, eller som du må bruge. Det læser kun filer på din enhed og henter ikke noget fra YouTube eller andre sider.",
        ],
        "faq": [
            ("Bliver min video uploadet?", "Nej. Den bliver læst og lavet om i din browser, på din enhed."),
            ("Hvilken kvalitet skal jeg vælge?", "192 kbps lyder godt til både musik og tale. Brug 128 kbps til en mindre fil, fx et foredrag eller en podcast, og 320 kbps, hvis originalen lyder rigtig godt."),
            ("Kan den tage filer fra YouTube?", "Nej. Den virker kun med filer, du allerede har på din enhed."),
            ("Er der en grænse for filstørrelsen?", "Der er ingen fast grænse. Værktøjet læser store filer uden at indlæse det hele på én gang; en telefon er bare længere om det."),
        ],
        "tl": {"quality": "Kvalitet", "q128": "128 kbps (mindre fil)", "q192": "192 kbps (anbefalet)", "q320": "320 kbps (bedste kvalitet)"},
    },
    "video-to-gif": {
        "name": "Video til GIF",
        "tile": "Lav et kort klip af en video om til en GIF, der virker overalt.",
        "title": "Lav video om til GIF gratis, uden upload | Webspind",
        "desc": "Lav et klip fra en MP4 eller MOV om til en GIF i din browser. Vælg selv start, længde, bredde og hastighed. Din video bliver aldrig uploadet.",
        "h1": "Lav video om til GIF",
        "lead": "Vælg det øjeblik, du vil have, og lav det om til en GIF. Din video bliver på din enhed.",
        "button": "Lav GIF",
        "steps": ["Vælg en video.", "Angiv, hvor GIF'en skal starte, og hvor lang den skal være.", "Tryk Lav GIF, se resultatet, og hent det."],
        "notes": [
            "GIF er et gammelt format, og filerne bliver hurtigt store. Hold klip under cirka 10 sekunder og bredden på 480 pixels, så filen er til at dele. Værktøjet kan tage op til 60 sekunder.",
            "Din enhed gør arbejdet, så et kort klip tager et øjeblik, og et langt eller bredt klip tager længere.",
        ],
        "faq": [
            ("Bliver min video uploadet?", "Nej. Den bliver lavet om til GIF i din browser, på din enhed."),
            ("Hvorfor er min GIF så stor?", "GIF har ingen moderne komprimering. Sæt bredden, billeder pr. sekund eller længden ned, så bliver den hurtigt mindre."),
            ("Har GIF'en lyd?", "Nej. GIF-formatet har ikke lyd."),
            ("Er der vandmærke?", "Nej."),
        ],
        "tl": {"start": "Start (sekunder)", "length": "Længde (sekunder)", "width": "Bredde", "w320": "320 px (lille)", "w480": "480 px (anbefalet)", "w640": "640 px (stor)", "fps": "Billeder pr. sekund", "previewAlt": "Din færdige GIF"},
    },
    "heic": {
        "name": "HEIC til JPG",
        "tile": "Lav iPhone-billeder i HEIC om til JPG, der kan åbnes overalt, mange på én gang.",
        "title": "HEIC til JPG gratis og uden upload | Webspind",
        "desc": "Lav iPhone-billeder i HEIC om til JPG i din browser, mange på én gang, og hent dem som zip. Dine billeder bliver aldrig uploadet.",
        "h1": "Lav HEIC om til JPG",
        "lead": "iPhones gemmer billeder som HEIC, som mange programmer og hjemmesider ikke kan åbne. Lav dem om til JPG, mange på én gang.",
        "button": "Lav til JPG",
        "steps": ["Vælg et eller flere HEIC-billeder, eller træk dem herhen.", "Tryk Lav til JPG.", "Hent hvert billede for sig, eller dem alle på én gang som zip."],
        "notes": [
            "Billederne bliver lavet om i din browser, så de aldrig forlader din enhed. Det betyder også, at ingen andre nogensinde får en kopi af dine familiebilleder.",
            "JPG-filen indeholder ikke originalens placering eller andre kameraoplysninger. Har du brug for dem, så behold også HEIC-filen.",
        ],
        "faq": [
            ("Bliver mine billeder uploadet?", "Nej. De bliver lavet om i din browser, på din enhed."),
            ("Mister jeg kvalitet?", "Næsten ikke ved standardindstillingen Høj. JPG komprimerer lidt anderledes end HEIC, men det ser du ikke ved almindelig brug."),
            ("Hvor mange billeder kan jeg lave om?", "Så mange, din enheds hukommelse kan klare. Snesevis ad gangen går fint; en telefon har det bedst med mindre portioner."),
            ("Bliver min placering gemt?", "Nej. JPG-filerne laves kun ud fra billedet, så placering og kameraoplysninger kommer ikke med."),
        ],
        "tl": {"quality": "Kvalitet", "qMax": "Maksimal", "qHigh": "Høj (anbefalet)", "qMed": "Mellem (mindre filer)"},
    },
    "compress-images": {
        "name": "Komprimer billeder",
        "tile": "Gør JPG-, PNG- og WebP-billeder mindre, ét ad gangen eller mange på én gang.",
        "title": "Komprimer billeder gratis, uden upload | Webspind",
        "desc": "Gør JPG-, PNG- og WebP-billeder mindre i din browser. Tag flere på én gang, og hent dem som zip. Dine billeder bliver aldrig uploadet.",
        "h1": "Komprimer billeder",
        "lead": "Gør billeder mindre til e-mail, hjemmesider og formularer. Dine billeder bliver på din enhed.",
        "button": "Komprimer billeder",
        "steps": ["Vælg et eller flere billeder.", "Vælg en kvalitet og en største størrelse, hvis billederne også skal fylde færre pixels.", "Tryk Komprimer billeder, og hent dem hver for sig eller som zip."],
        "notes": [
            "En JPG forbliver en JPG, en PNG en PNG og en WebP en WebP. PNG-billeder bliver reduceret til en palet af farver, hvilket passer godt til skærmbilleder og grafik. Til fotos bør du vælge WebP eller bruge JPG, som er langt bedre til fotos.",
            "Komprimering fjerner oplysninger som placering og kameradata fra filen. Hvis et billede ikke kan blive mindre, får du din original tilbage uændret, og vi siger det.",
        ],
        "faq": [
            ("Bliver mine billeder uploadet?", "Nej. De bliver komprimeret i din browser, på din enhed."),
            ("Hvor meget mindre bliver mine billeder?", "Det afhænger af billedet. Telefonbilleder bliver ofte mere end halvt så store ved indstillingen Mellem, især hvis du også begrænser størrelsen. Allerede komprimerede billeder bliver måske kun lidt mindre."),
            ("Er der en grænse for antallet af billeder?", "Ingen fast grænse, kun din enheds hukommelse. Snesevis ad gangen går fint på en computer."),
            ("Bliver selve billedet mindre i pixels?", "Kun hvis du vælger en største størrelse. Ellers forbliver dimensionerne de samme."),
        ],
        "tl": {
            "quality": "Kvalitet", "qHigh": "Høj", "qMed": "Mellem (anbefalet)", "qLow": "Lav (mindste filer)",
            "maxSide": "Største størrelse (længste side)", "maxSideHint": "Mindre billeder bliver ikke gjort større.", "keepSize": "Behold den originale størrelse",
            "format": "Format", "fmtKeep": "Behold formatet", "fmtWebp": "Lav om til WebP (som regel mindst)",
            "keptNote": "Filer, der ikke kunne gøres mindre, får du tilbage som originalen.",
        },
    },
    "resize-images": {
        "name": "Skift billedstørrelse",
        "tile": "Skift pixelstørrelsen på mange billeder på én gang.",
        "title": "Skift størrelse på billeder gratis, uden upload | Webspind",
        "desc": "Skift størrelse på JPG-, PNG- og WebP-billeder i pixels eller procent i din browser. Mange på én gang med zip. Dine billeder bliver aldrig uploadet.",
        "h1": "Skift størrelse på billeder",
        "lead": "Skift størrelsen på ét billede eller en hel bunke, i præcise pixels eller i procent.",
        "button": "Skift størrelse",
        "steps": ["Vælg et eller flere billeder.", "Skriv en bredde eller højde eller en procent. Lad den ene side stå tom for at bevare proportionerne.", "Tryk Skift størrelse, og hent dem hver for sig eller som zip."],
        "notes": [
            "Alt sker på din enhed, ét billede ad gangen, så en bunke kan tage lidt tid, men den bliver hos dig.",
            "Vælg Beskær, så det fylder, hvis du skal bruge en bestemt form som et kvadrat, og Stræk kun, hvis det er i orden, at billedet bliver klemt.",
        ],
        "faq": [
            ("Bliver mine billeder uploadet?", "Nej. De får ny størrelse i din browser, på din enhed."),
            ("Kan jeg tage mange billeder på én gang?", "Ja. Tilføj så mange, du vil, og hent dem som zip."),
            ("Hvad er den bedste størrelse til nettet?", "En bredde på 1600 pixels er et godt valg til billeder på de fleste hjemmesider. Til e-mail er 1200 pixels som regel rigeligt."),
            ("Kan billeder også blive større?", "Ja, op til 400 procent, men forstørrede billeder ser blødere ud, fordi detaljer ikke kan opfindes."),
        ],
        "tl": {
            "mode": "Skift størrelse efter", "modeSize": "Bredde og højde", "modePercent": "Procent",
            "width": "Bredde (pixels)", "height": "Højde (pixels)", "auto": "Automatisk", "percent": "Procent",
            "fit": "Hvis du skriver både bredde og højde", "fitKeep": "Passer inden for (bevar proportioner)", "fitCrop": "Beskær, så det fylder", "fitStretch": "Stræk", "fitHint": "Bruges kun, når begge sider er udfyldt.",
            "format": "Format", "fmtSame": "Samme som originalen",
        },
    },
    "rembg": {
        "name": "Fjern baggrund",
        "tile": "Skær baggrunden væk fra et billede, og behold det vigtigste.",
        "title": "Fjern baggrund fra billede gratis på din enhed | Webspind",
        "desc": "Fjern baggrunden fra et billede i din browser, og hent en gennemsigtig PNG. Dit billede bliver aldrig uploadet. Uden tilmelding og uden vandmærke.",
        "h1": "Fjern baggrunden fra et billede",
        "lead": "Skær personen eller tingen ud af et billede, og gem det med gennemsigtig baggrund.",
        "local": "Dit billede bliver på din enhed. Kun AI-modellen bliver hentet.",
        "button": "Fjern baggrund",
        "steps": ["Vælg et billede.", "Behold baggrunden gennemsigtig, eller vælg hvid.", "Tryk Fjern baggrund, se resultatet, og hent PNG-filen."],
        "notes": [
            "Arbejdet bliver gjort på din enhed af en AI-model, der hedder U-2-Net. Første gang henter din browser modellen, ikke dine filer, cirka 175 MB. Bagefter starter den fra din browsers cache.",
            "På en almindelig computer tager et billede omkring ti sekunder, når modellen er hentet. Telefoner kan løbe tør for hukommelse, så her er en computer det bedste valg.",
            "Det virker bedst med et tydeligt motiv foran en roligere baggrund: en person, en ting, et kæledyr. Fint hår, glas og urolige baggrunde kan have brug for en finpudsning, fordi modellen ser billedet i en mindre størrelse.",
        ],
        "faq": [
            ("Bliver mit billede uploadet?", "Nej. Billedet bliver i din browser på din enhed. Kun AI-modellen bliver hentet, første gang."),
            ("Må jeg bruge resultatet kommercielt?", "Ja. Resultatet er dit, og modellen er udgivet under Apache 2.0-licensen, som tillader kommerciel brug."),
            ("Er der vandmærke eller en grænse?", "Intet vandmærke, ingen tilmelding og ingen grænse for antallet af billeder."),
            ("Hvorfor er første gang langsom?", "Modellen skal først hentes, cirka 175 MB. Senere starter det meget hurtigere."),
        ],
        "tl": {
            "background": "Baggrund", "bgTransparent": "Gennemsigtig", "bgWhite": "Hvid",
            "preparing": "Gør modellen klar…", "downloadingModel": "Henter modellen (kun første gang):", "cutting": "Finder motivet og skærer det ud…",
            "previewAlt": "Dit billede med baggrunden fjernet",
            "phoneWarn": "Det kræver meget hukommelse, og en telefon kan stoppe halvvejs. En computer klarer det bedre. Du kan stadig prøve.",
        },
    },
}
