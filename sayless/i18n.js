/* Say Less web: Danish dictionary (loaded before sl-i18n.js). English lives in app.js; this maps what people see.
   exact: whole strings (trimmed). re: patterns, anchored automatically, tried in order. */
(function () {
  'use strict';
  const T = s => (window.SL_TR ? window.SL_TR(s) : s);

  // ---- dates
  const WDF = { Sunday: 'søndag', Monday: 'mandag', Tuesday: 'tirsdag', Wednesday: 'onsdag', Thursday: 'torsdag', Friday: 'fredag', Saturday: 'lørdag' };
  const WD3 = { Sun: 'søn.', Mon: 'man.', Tue: 'tirs.', Wed: 'ons.', Thu: 'tors.', Fri: 'fre.', Sat: 'lør.' };
  const MOF = { January: 'januar', February: 'februar', March: 'marts', April: 'april', May: 'maj', June: 'juni', July: 'juli', August: 'august', September: 'september', October: 'oktober', November: 'november', December: 'december' };
  const MO3 = { Jan: 'jan.', Feb: 'feb.', Mar: 'mar.', Apr: 'apr.', May: 'maj', Jun: 'jun.', Jul: 'jul.', Aug: 'aug.', Sep: 'sep.', Oct: 'okt.', Nov: 'nov.', Dec: 'dec.' };
  const DL = '(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)';
  const D3 = '(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)';
  const ML = '(?:January|February|March|April|May|June|July|August|September|October|November|December)';
  const M3 = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)';
  // every date shape the app prints, inside any string
  const D = s => String(s)
    .replace(new RegExp(`\\b(${DL}) (\\d{1,2}) (${ML})\\b`, 'g'), (_, w, d, m) => `${WDF[w]} ${d}. ${MOF[m]}`)
    .replace(new RegExp(`\\b(${DL}) (\\d{1,2}) (${M3})\\b`, 'g'), (_, w, d, m) => `${WDF[w]} ${d}. ${MO3[m]}`)
    .replace(new RegExp(`\\b(${D3}) (\\d{1,2}) (${M3})\\b`, 'g'), (_, w, d, m) => `${WD3[w]} ${d}. ${MO3[m]}`)
    .replace(new RegExp(`\\b(${D3}) (\\d{1,2})\\b(?! ${M3})`, 'g'), (_, w, d) => `${WD3[w]} ${d}.`)
    .replace(new RegExp(`\\b(\\d{1,2}) (${M3})\\b`, 'g'), (_, d, m) => `${d}. ${MO3[m]}`)
    .replace(new RegExp(`\\b(${ML}) (\\d{4})\\b`, 'g'), (_, m, y) => `${MOF[m]} ${y}`)
    .replace(/ to (?=\d{1,2}\. )/g, ' til ');
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const dot = s => (/\.$/.test(s) ? s : s + '.');           // "dec." already ends the sentence
  const pl = (n, one, many) => `${n} ${+n === 1 ? one : many}`;
  const og = s => s.replace(/ and (?!.* and )/, ' og ');      // "A, B and C" -> "A, B og C"
  const gen = n => (/[sxzSXZ]$/.test(n) ? n + "'" : n + 's'); // Annas, Lars'
  const NUM = { 'no one': 'ingen', one: 'én', two: 'to', three: 'tre', four: 'fire', five: 'fem', six: 'seks', seven: 'syv', eight: 'otte', nine: 'ni', ten: 'ti' };
  const num = w => NUM[String(w).toLowerCase()] || w;
  const NW = '(no one|one|two|three|four|five|six|seven|eight|nine|ten|\\d+)';
  const R = (src, flags) => new RegExp(src, flags || '');

  const exact = {
    // errors (nice() and friends)
    'No connection. Try again in a moment.': 'Ingen forbindelse. Prøv igen om lidt.',
    'Lots of taps at once. Wait a minute and try again.': 'Mange tryk på én gang. Vent et minut, og prøv igen.',
    'The host called this plan off.': 'Værten har aflyst planen.',
    'plan is locked': 'Planen er låst.',
    'This plan is gone. The link may be mistyped.': 'Planen findes ikke længere. Måske er linket skrevet forkert.',
    'Write your name first.': 'Skriv dit navn først.',
    'This browser can no longer change that. Use your edit link.': 'Den her browser kan ikke længere ændre det. Brug dit personlige link.',
    'Something went wrong. Try again.': 'Noget gik galt. Prøv igen.',

    // weekdays and months on their own (locked card, board, month headings)
    Sunday: 'søndag', Monday: 'mandag', Tuesday: 'tirsdag', Wednesday: 'onsdag', Thursday: 'torsdag', Friday: 'fredag', Saturday: 'lørdag',
    January: 'januar', February: 'februar', March: 'marts', April: 'april', May: 'maj', June: 'juni', July: 'juli', August: 'august',
    September: 'september', October: 'oktober', November: 'november', December: 'december',
    'no one': 'ingen',

    // the picture picker, plan kinds, their descriptions and options
    'One drink': 'Én øl',
    'It has never once been one drink.': 'Det er aldrig blevet ved én øl.',
    'The window table': 'Bordet ved vinduet',
    'A wine bar': 'En vinbar',
    'Arcade bar': 'Arcadebar',
    Cabin: 'Hytte',
    'Cabin, no signal': 'Hytte, ingen dækning',
    'Two nights. One fire. No bars.': 'To nætter. Ét bål. Nul dækning.',
    'Sauna and a swim': 'Sauna og en dukkert',
    'A long hike': 'En lang vandretur',
    'Board games by the fire': 'Brætspil ved pejsen',
    '5K': '5 km',
    '5K, allegedly': '5 km, siger vi',
    'We run. Then we earn the pastries.': 'Vi løber. Så har vi fortjent wienerbrødet.',
    'Round the lake': 'Rundt om søen',
    'Along the harbour': 'Langs havnen',
    'Through the park': 'Gennem parken',
    Birthday: 'Fødselsdag',
    'Birthday, the big one': 'Fødselsdag, den store',
    'They said nothing big. They did not mean it.': 'De sagde, at det ikke skulle være stort. Det mente de ikke.',
    Karaoke: 'Karaoke',
    'House party': 'Hjemmefest',
    'One long dinner': 'Én lang middag',
    'Film night': 'Filmaften',
    'Someone else picks. No one complains.': 'En anden vælger. Ingen brokker sig.',
    'Something scary': 'Noget uhyggeligt',
    'Something funny': 'Noget sjovt',
    'Something old': 'Noget gammelt',
    'Pasta night': 'Pastaaften',
    'Bring wine. Leave your phone in the hall.': 'Tag vin med. Lad telefonen blive i entréen.',
    Carbonara: 'Carbonara',
    Lasagne: 'Lasagne',
    'Pizza from scratch': 'Hjemmelavet pizza',
    Concert: 'Koncert',
    'Gig night': 'Koncertaften',
    'Loud music. Bad ears tomorrow.': 'Høj musik. Ondt i ørerne i morgen.',
    'A small venue': 'Et lille spillested',
    'Festival day': 'Festivaldag',
    Barbecue: 'Grill',
    'Barbecue in the park': 'Grill i parken',
    'Someone brings the grill. Everyone brings sausages.': 'En tager grillen med. Alle tager pølser med.',
    'The park': 'Parken',
    'Someone’s garden': 'En vens have',
    "Someone's garden": 'En vens have',
    'The beach': 'Stranden',
    Padel: 'Padel',
    'Padel, two v two': 'Padel, to mod to',
    'Losers buy the beers.': 'Taberne giver øl.',
    Tennis: 'Tennis',
    'Table tennis': 'Bordtennis',
    Camping: 'Camping',
    'One night in a tent': 'En nat i telt',
    'No hotel. Bring a warm jumper.': 'Intet hotel. Tag en varm trøje med.',
    'By the lake': 'Ved søen',
    'In the woods': 'I skoven',
    'On the beach': 'På stranden',
    Outdoors: 'Udenfor',
    'Beach day': 'Stranddag',
    'If the sun shows up, so do we.': 'Kommer solen, så kommer vi.',
    'A long walk': 'En lang gåtur',
    'Picnic in the park': 'Picnic i parken',
    Letters: 'Bogstaver',
    'Your photo': 'Dit foto',

    // the 14 idea chips
    'Give me ideas': 'Giv mig idéer',
    'Movie night': 'Filmaften',
    'One drink after work': 'Én øl efter arbejde',
    'Cabin weekend': 'Hyttetur',
    'Pasta at mine': 'Pasta hos mig',
    '5K, then pastries': '5 km, så wienerbrød',
    'Birthday dinner': 'Fødselsdagsmiddag',
    'Board game night': 'Brætspilsaften',
    'Sunday brunch': 'Søndagsbrunch',

    // general ui
    Close: 'Luk',
    'Could not copy here. Press and hold the link to copy it.': 'Kunne ikke kopiere her. Hold fingeren på linket for at kopiere det.',
    Copied: 'Kopieret',
    'Try logos': 'Prøv logoer',
    'Previous logo': 'Forrige logo',
    'Next logo': 'Næste logo',
    'Hide the logo switch': 'Skjul logoskifteren',
    'Say Less (now)': 'Say Less (nu)',
    'say less. with blue dot': 'say less. med blå prik',
    'say/less tile': 'say/less-flise',
    'Clay object + say less': 'Lerfigur + say less',
    'Say Less, start a new plan': 'Say Less, lav en ny plan',
    Untitled: 'Uden navn',
    'Your plan': 'Din plan',

    // create: what
    'Say Less. Do more.': 'Sig mindre. Gør mere.',
    'Say less. Do more.': 'Sig mindre. Gør mere.',
    'Your plan card': 'Dit plankort',
    'Friends never pay. No app, no account.': 'Vennerne betaler aldrig. Ingen app, ingen konto.',
    'Your card shows up here as you write.': 'Dit kort dukker op her, mens du skriver.',
    Steps: 'Trin',
    '1. What': '1. Hvad',
    '2. When': '2. Hvornår',
    '3. Ready': '3. Klar',
    'Shuffle the look': 'Bland udseendet',
    Shuffle: 'Bland',
    'Card colour': 'Kortets farve',
    'Silver foil, a Plus finish': 'Sølvfolie, en del af Plus',
    'Silver foil (Plus)': 'Sølvfolie (Plus)',
    'Swap the picture': 'Skift billedet',
    'Silver foil is a Plus finish': 'Sølvfolie hører til Plus',
    'Plus gives your plans a silver card, more pictures and every group you plan with. It opens soon. Everything else stays free, and friends never pay.':
      'Med Plus får dine planer et sølvkort, flere billeder og alle de grupper, du planlægger med. Det åbner snart. Alt andet er stadig gratis, og vennerne betaler aldrig.',
    'Got it': 'Forstået',
    'Pick a picture': 'Vælg et billede',
    Swap: 'Skift',
    Undo: 'Fortryd',
    'Movie night, padel, a cabin trip...': 'Filmaften, padel, hyttetur...',
    'What do you want to do?': 'Hvad skal I lave?',
    'A line for your friends (optional)': 'En linje til vennerne (valgfri)',
    'A line for your friends': 'En linje til vennerne',
    'What do you want to do with the group?': 'Hvad skal I lave sammen?',
    'Write it your way. We find a picture for it, and you can swap it.': 'Skriv det, som du vil. Vi finder et billede til, og du kan skifte det.',
    'Hide ideas': 'Skjul idéer',
    'Or tap an idea': 'Eller tryk på en idé',
    'Free while Say Less is new. Friends never pay, and need no app.': 'Gratis, mens Say Less er nyt. Vennerne betaler aldrig og skal ikke have en app.',
    'Your plans': 'Dine planer',

    // create: when
    '62 days is the most': 'Højst 62 dage',
    'Tap days, or drag across': 'Tryk på dagene, eller træk hen over',
    'Start time': 'Starttidspunkt',
    'Pick the period': 'Vælg perioden',
    'Previous month': 'Forrige måned',
    'Next month': 'Næste måned',
    'Tap the days that could work, or drag across many. Tap a day again to take it out. Friends pick from these.':
      'Tryk på de dage, der kunne passe, eller træk hen over mange. Tryk på en dag igen for at fjerne den. Vennerne vælger blandt dem.',
    'This weekend': 'Denne weekend',
    'Next 2 weeks': 'De næste 2 uger',
    'Next 3 weeks': 'De næste 3 uger',
    Clear: 'Ryd',
    'Add a time': 'Tilføj et tidspunkt',
    'Optional. Leave it off and you decide later.': 'Valgfrit. Spring det over, så bestemmer du senere.',
    'Back to this month': 'Tilbage til denne måned',

    // create: ready
    'Remove option': 'Fjern valgmulighed',
    '+ Add an option': '+ Tilføj en valgmulighed',
    'A friend’s name': 'En vens navn',
    "A friend's name": 'En vens navn',
    'Friend name': 'Vens navn',
    'Ready?': 'Klar?',
    'Answer by': 'Svar senest',
    'That day the leading night is picked for you.': 'Den dag vælges den aften, der fører.',
    'No deadline. You lock it when you are happy.': 'Ingen frist. Du låser dagen, når du er tilfreds.',
    'No deadline': 'Ingen frist',
    'Add options to vote on': 'Tilføj noget at stemme om',
    'Like where to go. Friends pick as many as they like.': 'Fx hvor I skal hen. Vennerne vælger så mange, de vil.',
    'Add names (optional)': 'Tilføj navne (valgfrit)',
    'So friends just tap their name. Anyone with the link can still join.': 'Så trykker vennerne bare på deres navn. Alle med linket kan stadig være med.',
    Add: 'Tilføj',
    'Your name (shown to friends)': 'Dit navn (vises for vennerne)',
    Optional: 'Valgfrit',
    'Always before the first day. That day the leading night is picked for you.': 'Altid før den første dag. Den dag vælges den aften, der fører.',
    'The first day is too soon for a deadline.': 'Den første dag er for tæt på til en frist.',
    'Upload a photo': 'Upload et foto',
    'That photo did not work. Try another.': 'Det foto virkede ikke. Prøv et andet.',
    'Photos are made small and stored with the plan, so anyone with the link sees them.': 'Fotos bliver gjort små og gemt med planen, så alle med linket kan se dem.',
    Next: 'Næste',
    'Make the link': 'Lav linket',
    Back: 'Tilbage',
    'Friends never pay.': 'Vennerne betaler aldrig.',
    'Making it...': 'Laver linket...',
    'Link copied': 'Link kopieret',
    'Link ready': 'Linket er klar',

    // plan pages
    'Loading the plan...': 'Henter planen...',
    'This plan is gone': 'Planen findes ikke længere',
    'Could not load the plan': 'Kunne ikke hente planen',
    'The link may be mistyped.': 'Måske er linket skrevet forkert.',
    'Make your own plan': 'Lav din egen plan',
    'The host just locked the date.': 'Værten har lige låst datoen.',

    // share
    'Copy link': 'Kopiér link',
    'Waiting room': 'Venteværelset',
    'This is what your friends see first.': 'Det her ser dine venner først.',
    'Send it.': 'Send det.',
    'iPhone, Android or computer. Friends open it and tap. No app, no account.': 'iPhone, Android eller computer. Vennerne åbner og trykker. Ingen app, ingen konto.',
    'Copy invite text': 'Kopiér invitationen',
    Email: 'Mail',
    Share: 'Del',
    'Show QR': 'Vis QR-kode',
    'Your host link': 'Dit værtslink',
    'Keep this one to yourself. It is how you lock the night from another phone or computer. This browser remembers it already.':
      'Behold det her for dig selv. Med det kan du låse aftenen fra en anden telefon eller computer. Den her browser husker det allerede.',
    'Copy host link': 'Kopiér værtslink',
    'Open the waiting room': 'Åbn venteværelset',
    'Scan with a phone': 'Scan med en telefon',
    'Point a phone camera at it.': 'Peg et telefonkamera på den.',
    'The link is too long for a QR code.': 'Linket er for langt til en QR-kode.',
    'QR code for the link': 'QR-kode til linket',

    // friend answer
    'That edit link does not match an answer on this plan.': 'Det personlige link passer ikke til et svar i den her plan.',
    No: 'Nej',
    'See the board': 'Se oversigten',
    'Not on the list? Your name': 'Ikke på listen? Dit navn',
    'Your name': 'Dit navn',
    'Who are you?': 'Hvem er du?',
    '✓ Answered': '✓ Har svaret',
    'Tap to answer': 'Tryk for at svare',
    'Write your name and tap the days you are free.': 'Skriv dit navn, og tryk på de dage, du kan.',
    Join: 'Vær med',
    'Save changes': 'Gem ændringer',
    'Save my answer': 'Gem mit svar',
    'Tap the days you are free': 'Tryk på de dage, du kan',
    'What should we do?': 'Hvad skal vi lave?',
    'Pick as many as you like.': 'Vælg så mange, du vil.',
    Free: 'Kan',
    'If I have to (tap twice)': 'Hvis det skal være (tryk to gange)',
    'Friends who can': 'Venner, der kan',
    'Welcome back,': 'Velkommen tilbage,',
    'Answering as': 'Svarer som',
    '. Change your answers?': '. Vil du rette dine svar?',
    Switch: 'Skift',
    'Switch name?': 'Skift navn?',
    'Copy the edit link': 'Kopiér det personlige link',
    'Switch name': 'Skift navn',
    'When are you free?': 'Hvornår kan du?',
    'Tap the days you can. Tap twice for “if I have to”. Drag to mark many.': 'Tryk på de dage, du kan. Tryk to gange for “hvis det skal være”. Træk for at markere mange.',
    'Keys: arrows to move, Y free, M maybe, N clear.': 'Taster: pile for at flytte, Y kan, M måske, N ryd.',
    "Can't make any": 'Kan ingen af dagene',
    'All days cleared.': 'Alle dage er ryddet.',
    "Tap the days you're free, or press Can't make any.": 'Tryk på de dage, du kan, eller tryk på Kan ingen af dagene.',
    'Saving...': 'Gemmer...',
    'Try again': 'Prøv igen',

    // waiting room
    'Nothing new since you last looked.': 'Intet nyt siden sidst.',
    'Your turn next.': 'Nu er det din tur.',
    'Plan a hangout in 20 seconds. Free, no account.': 'Lav en plan på 20 sekunder. Gratis, ingen konto.',
    'Waiting for answers': 'Venter på svar',
    'The host locks it when everyone is in.': 'Værten låser dagen, når alle har svaret.',
    'Nudge everyone': 'Prik til alle',
    'Copied, paste it in the chat': 'Kopieret, sæt det ind i chatten',
    'Share page': 'Del planen',
    'Change my answer': 'Ret mit svar',
    'Add my own answer': 'Tilføj mit eget svar',
    Answer: 'Svar',
    'Copy link for the group': 'Kopiér link til gruppen',
    "You're in.": 'Du er med.',
    'Change your answer any time from this link. On another phone or computer, use your edit link.':
      'Du kan rette dit svar når som helst fra det her link. På en anden telefon eller computer bruger du dit personlige link.',
    'Copy my edit link': 'Kopiér mit personlige link',
    Leading: 'I front',
    Ranked: 'Rangliste',
    'Full grid': 'Hele skemaet',
    'You are the host': 'Du er vært',
    'Who is in': 'Hvem er med',
    'No answers yet': 'Ingen svar endnu',
    'No answers yet.': 'Ingen svar endnu.',
    'Send the link to the group. The nights line up here as people answer.': 'Send linket til gruppen. Aftenerne stiller sig op her, efterhånden som folk svarer.',
    'moved up': 'rykket op',
    'moved down': 'rykket ned',
    'Lock this day': 'Lås dagen',
    'Show the top 4': 'Vis top 4',
    'What to do': 'Hvad I skal lave',
    'Copy for the group chat': 'Kopiér til gruppechatten',
    'Another one': 'En til',
    'Lock it': 'Lås den',
    'Not yet': 'Ikke endnu',

    // locked
    Tonight: 'I aften',
    Tomorrow: 'I morgen',
    'That was a good one': 'Det var en god en',
    'Add to calendar': 'Føj til kalender',
    'Download card': 'Hent kortet',
    "Who's in": 'Hvem kommer',
    'Nobody said yes to this day yet.': 'Ingen har sagt ja til den dag endnu.',
    'Copy plan text': 'Kopiér planen',
    'Unlock the date': 'Lås datoen op',
    'Date unlocked. Friends can vote again.': 'Datoen er låst op. Vennerne kan stemme igen.',
    'Google Calendar': 'Google Kalender',
    'Apple or Outlook (.ics file)': 'Apple eller Outlook (.ics-fil)',
    'Copy plan details': 'Kopiér detaljerne',
    'Could not make the card.': 'Kunne ikke lave kortet.',
    'That host link is not valid for this plan.': 'Det værtslink virker ikke til den her plan.',
    'Say Less needs JavaScript to work.': 'Say Less kræver JavaScript.',
  };

  const re = [
    // ---- dates on their own
    // PNG card: "Monday 3 December, 19:00"
    [R(`(${DL} \\d{1,2} ${ML})(?:, (\\d\\d:\\d\\d))?`), (d, t) => cap(D(d)) + (t ? ', kl. ' + t : '')],
    // vh label / plan text line: "Monday 3 Dec 2026, 19:00"
    [R(`(${DL} \\d{1,2} ${M3} \\d{4})(?:, (\\d\\d:\\d\\d))?`), (d, t) => D(d) + (t ? ', kl. ' + t : '')],
    // "Monday 3 Dec" (aria labels, deadline button), "Mon 3 Dec" (deadline chips), "Mon 3" (board, grid)
    [R(`(${DL} \\d{1,2} ${M3})`), d => cap(D(d))],
    [R(`(${D3} \\d{1,2} ${M3})`), d => D(d)],
    [R(`(${D3} \\d{1,2})`), d => D(d)],
    // card dates: "3 Dec", "30 Nov to 13 Dec"
    [R(`(\\d{1,2} ${M3}(?: to \\d{1,2} ${M3})?)`), d => D(d)],
    // month heading and calendar aria: "December 2026"
    [R(`(${ML} \\d{4})`), d => D(d)],

    // ---- create
    [/(\d+) (?:day|days) picked/, n => pl(n, 'dag', 'dage') + ' valgt'],
    [R(`(\\d+) (?:day|days), (.+?)(?:, from (\\d\\d:\\d\\d))?\\. Friends tap the days they are free\\.`),
      (n, s, t) => `${pl(n, 'dag', 'dage')}, ${D(s)}${t ? ', fra kl. ' + t : ''}.`.replace(/\.\.$/, '.') + ' Vennerne trykker på de dage, de kan.'],
    [/Picture: (.+)\. Tap to swap/, k => `Billede: ${T(k)}. Tryk for at skifte`],
    [/Swapped “([\s\S]*)” for “([\s\S]*)”\./, (a, b) => `Skiftede »${T(a)}« ud med »${T(b)}«.`],
    [/Colour (#[0-9A-Fa-f]{6})/, c => `Farve ${c}`],
    [/Option (\d+)/, n => `Valgmulighed ${n}`],
    [/Cut letters (\d+)/, n => `Klippebogstaver ${n}`],
    [/Your image (\d+)/, n => `Dit billede ${n}`],
    [/(\d+\/\d+) (Say Less \(now\)|say less\. with blue dot|say\/less tile|Clay object \+ say less|Cut letters \d+|Your image \d+)/, (a, b) => `${a} ${T(b)}`],

    // ---- page title: "(3) Title · Say Less"
    [/(\(\d+\) )?(.+) · Say Less/, (n, t) => `${n || ''}${T(t)} · Say Less`],

    // ---- invite text (copied line by line; shared as two lines joined by a space)
    [/([\s\S]*?)\s*Which of these work\? (.+?)\. Tap your name and answer, takes ten seconds:/,
      (pre, s) => `${pre ? T(pre) + ' ' : ''}Hvilke af dagene kan du? ${dot(D(s))} Tryk på dit navn, og svar. Det tager ti sekunder:`],
    // nudge: "Anna and Bo, Title: which days work? Tap your name, takes ten seconds. link"
    [/([\s\S]*?): which days work\? Tap your name, takes ten seconds\. (\S+)/,
      (pre, link) => { const m = pre.match(/^(.+?) and ([^,]+), ([\s\S]+)$/); const p = m ? `${m[1]} og ${m[2]}, ${T(m[3])}` : T(pre); return `${p}: hvilke dage kan I? Tryk på dit navn, det tager ti sekunder. ${link}`; }],
    // locked copy: "Title: Monday 3 Dec at 19:00. link"
    [R(`([\\s\\S]+): (${DL} \\d{1,2} ${M3})(?: at (\\d\\d:\\d\\d))?\\. (\\S+)`),
      (t, d, tm, link) => `${T(t)}: ${D(d)}${tm ? ' kl. ' + tm + '.' : (/\.$/.test(D(d)) ? '' : '.')} ${link}`],

    // ---- answer page
    [/From (.+?)\. Answer by (.+)\./, (n, d) => `Fra ${n}. Svar senest ${dot(D(d))}`],
    [R(`Answer by (${DL} \\d{1,2} ${M3})\\.`), d => `Svar senest ${dot(D(d))}`],
    [/From ([^.]{1,40})\./, n => `Fra ${n}.`],
    [/(\d+) answered\. No app, no account\. Takes ten seconds\./, n => `${n} har svaret. Ingen app, ingen konto. Det tager ti sekunder.`],
    [/Continue as (.+)\?/, n => `Fortsæt som ${n}?`],
    [/This edit link changes (.+)'s answer\. Only continue if that is you\./, n => `Det personlige link retter ${gen(n)} svar. Fortsæt kun, hvis det er dig.`],
    [/Yes, I'm (.+)/, n => `Ja, jeg er ${n}`],
    [/Answer as (.+)/, n => `Svar som ${n}`],
    [/(.+) already answered\. Add a last letter, like (.+)\./, (n, x) => `${n} har allerede svaret. Tilføj et forbogstav fra efternavnet, fx ${x}.`],
    [/(.+) answered already\. To change it, open (.+)'s edit link\./, (n, m) => `${n} har allerede svaret. Vil du rette det, så åbn ${gen(m)} personlige link.`],
    [R(`(${DL} \\d{1,2} ${M3}), (\\d+) others can`), (d, n) => `${cap(D(d))}, ${n} ${+n === 1 ? 'anden' : 'andre'} kan`],
    [/(\d+) free(?:, (\d+) if I have to)?/, (y, m) => `${y} kan${m ? `, ${m} hvis det skal være` : ''}`],
    [/Not (.+)\? Switch/, n => `Ikke ${n}? Skift`],
    [/You can only change (.+)'s answer from this browser or (.+)'s edit link\. Copy it first if it is yours\./,
      (a, b) => `Du kan kun rette ${gen(a)} svar fra den her browser eller fra ${gen(b)} personlige link. Kopiér det først, hvis det er dit.`],
    [/All days are in (.+) time\./, c => `Alle dage følger tiden i ${c}.`],
    [/This browser already answers as (.+)\. Tap Switch first, then open the edit link again\./,
      n => `Den her browser svarer allerede som ${n === 'someone' ? 'en anden' : n}. Tryk først på Skift, og åbn så det personlige link igen.`],

    // ---- waiting room
    [R(`${NW} in, ${NW} to go`, 'i'), (a, b) => `${cap(num(a))} har svaret, ${num(b)} mangler`],
    [R(`${NW} answered`, 'i'), a => `${cap(num(a))} har svaret`],
    [R(`They have until (${DL} \\d{1,2} ${M3})\\. Then the leader is picked\\.`), d => `De har indtil ${dot(D(d))} Så vælges den dag, der fører.`],
    [R(`You're in\\. Waiting on ${NW} more\\.`), n => `Du er med. Vi venter stadig på ${num(n)}.`],
    [/Live, (\d+) answered/, n => `Live, ${n} har svaret`],
    [/Welcome back, (.+?)\. (Since you left: [\s\S]+|Nothing new since you last looked\.)/, (n, rest) => `Velkommen tilbage, ${n}. ${T(rest)}`],
    [/Welcome back, (.+)\./, n => `Velkommen tilbage, ${n}.`],
    [/Since you left: ([\s\S]+)/, rest => {
      const m = rest.match(new RegExp(`^(?:(.+?) answered\\.)?\\s*(?:(${D3} \\d{1,2} ${M3}) took the lead\\.)?$`));
      if (!m) return 'Siden sidst: ' + rest;
      const parts = [];
      if (m[1]) parts.push(`${og(m[1])} har svaret.`);
      if (m[2]) parts.push(`Nu fører ${dot(D(m[2]))}`);
      return 'Siden sidst: ' + parts.join(' ');
    }],
    [/(.+) has not answered\. Poke them/, n => `${n} har ikke svaret. Giv et prik`],
    [/(\d+) free(?:, (\d+) maybe)?/, (y, m) => `${y} kan${m ? `, ${m} måske` : ''}`],
    [R(`Lock (${D3} \\d{1,2})`), d => `Lås ${D(d)}`],
    [/Show all (\d+) days/, n => `Vis alle ${n} dage`],
    [/(.+), (\w{3} \d{1,2} \w{3}): (yes|maybe|no|no answer)/, (n, d, v) => `${n}, ${D(d)}: ${{ yes: 'ja', maybe: 'måske', no: 'nej', 'no answer': 'intet svar' }[v]}`],
    [/(\d+) of (\d+) picked it/, (a, b) => `${a} af ${b} valgte den`],
    [/Poke (?!bowls?\b)(.+)/i, n => `Prik til ${n}`],
    [R(`Lock (${DL} \\d{1,2} ${M3})\\?`), d => `Lås ${D(d)}?`],
    [/(\d+) yes(?:, (\d+) maybe)?\. Everyone with the link sees the date\. You can unlock it again\./,
      (y, m) => `${y} ja${m ? `, ${m} måske` : ''}. Alle med linket kan se datoen. Du kan låse den op igen.`],
    [R(`New leader: (${DL} \\d{1,2} ${M3})`), d => `Ny dag i front: ${D(d)}`],
    [/(.+) just answered\./, n => `${og(n)} har lige svaret.`],

    // roasts (poke sheet, and what gets copied to the group chat)
    [/(.+), we saved you a seat\.(\s+\S+)?/, (n, l) => `${n}, vi har holdt en plads til dig.${l || ''}`],
    [/(.+), the group chat can see you not answering\.(\s+\S+)?/, (n, l) => `${n}, gruppechatten kan godt se, at du ikke svarer.${l || ''}`],
    [/(.+), one tap\. That is all we ask\.(\s+\S+)?/, (n, l) => `${n}, ét tryk. Mere beder vi ikke om.${l || ''}`],
    [/(.+), your calendar called\. It says you are free\.(\s+\S+)?/, (n, l) => `${n}, din kalender ringede. Den siger, du har tid.${l || ''}`],
    [/(.+), we almost picked a day without you\. Almost\.(\s+\S+)?/, (n, l) => `${n}, vi valgte næsten en dag uden dig. Næsten.${l || ''}`],
    [/(.+), the plan is ready\. It is only missing you\.(\s+\S+)?/, (n, l) => `${n}, planen er klar. Den mangler kun dig.${l || ''}`],

    // ---- locked
    [/(\d+) days to go/, n => `${n} dage til`],
    [R(`(${DL}) it is\\.`), w => `Så blev det ${WDF[w]}.`],
    [R(`(${DL} \\d{1,2} ${M3})(?:, (\\d\\d:\\d\\d))?\\. (\\d+) yes(?:, (\\d+) maybe)?\\.`),
      (d, t, y, m) => `${t ? cap(D(d)) + ', kl. ' + t + '.' : dot(cap(D(d)))} ${y} ja${m ? `, ${m} måske` : ''}.`],
    [/(.+) \(maybe\)/, n => `${n} (måske)`],

    // tooltips last: "Anna, Bo can" (calendar day hover); kept narrow: capitalised names split by commas
    [/(\p{Lu}[\p{L}'-]*(?: \p{Lu}[\p{L}.'-]*)*(?:, \p{Lu}[\p{L}'-]*(?: \p{Lu}[\p{L}.'-]*)*)*) can/u, n => `${n} kan`],
    [/Remove (.{1,40})/, n => `Fjern ${n}`],
  ];

  window.SL_DA = { exact, re };
})();

/* Say Less: Danish (Jakob 26/11: "på dansk også"). One layer for the web and the app prototype, so the apps stay in English
   in code and the Danish lives in one dictionary each (da_web.js / da_app.js, loaded BEFORE this file as window.SL_DA).
   Language: saved choice (sl.lang) or the browser's (da/nb/no -> Danish). Translates text nodes, placeholder/aria-label/title,
   the page title, canvas text (the card picture), clipboard and share texts. A user's own words are left alone unless they
   happen to match a dictionary line exactly. */
(function () {
  'use strict';
  const KEY = 'sl.lang';
  // localStorage, or window.name where storage is blocked (the claude.ai artifact frame): window.name survives a reload
  const saved = (() => { try { const v = localStorage.getItem(KEY); if (v) return v; } catch (e) {} const m = /sl\.lang=(da|en)/.exec(window.name || ''); return m ? m[1] : null; })();
  const lang = saved === 'da' || saved === 'en' ? saved : (/^(da|nb|nn|no)\b/i.test(navigator.language || '') ? 'da' : 'en');
  const D = window.SL_DA || { exact: {}, re: [] };
  const exact = D.exact || {};
  const rules = (D.re || []).map(([p, r]) => [p instanceof RegExp ? new RegExp('^(?:' + p.source + ')$', p.flags.replace('g', '')) : new RegExp('^(?:' + p + ')$'), r]);

  function tr(s) {
    if (lang !== 'da' || typeof s !== 'string' || !s) return s;
    const t = s.trim();
    if (!t) return s;
    let o = Object.prototype.hasOwnProperty.call(exact, t) ? exact[t] : null;
    if (o == null) for (const [r, rep] of rules) { const m = t.match(r); if (m) { o = typeof rep === 'function' ? rep(...m.slice(1)) : t.replace(r, rep); break; } }
    if (o == null && t.includes('\n')) { const parts = t.split('\n'); const pt = parts.map(tr); if (pt.some((x, i) => x !== parts[i])) o = pt.join('\n'); }
    return o == null ? s : s.replace(t, o);
  }
  window.SL_LANG = lang;
  window.SL_TR = tr;
  window.SL_SETLANG = l => { try { localStorage.setItem(KEY, l); } catch (e) {} window.name = (window.name || '').replace(/;?sl\.lang=(da|en)/, '') + ';sl.lang=' + l; location.reload(); };
  document.documentElement.lang = lang;
  if (lang !== 'da') {   // English: only the switch
    const go = () => { addSwitch(); new MutationObserver(addSwitch).observe(document.documentElement, { subtree: true, childList: true }); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
    return;
  }

  // ---- text on the page
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'NOSCRIPT', 'CODE']);
  const ATTRS = ['placeholder', 'aria-label', 'title', 'data-tip'];
  const done = new WeakMap();
  function node(n) {
    if (n.nodeType === 3) {
      const p = n.parentNode; if (!p || SKIP.has(p.nodeName) || (p.closest && p.closest('[data-no-tr],[contenteditable]'))) return;
      const v = n.nodeValue; if (done.get(n) === v) return;
      const o = tr(v); if (o !== v) n.nodeValue = o; done.set(n, n.nodeValue);
    } else if (n.nodeType === 1) {
      if (SKIP.has(n.nodeName) || n.hasAttribute('data-no-tr')) return;
      for (const a of ATTRS) if (n.hasAttribute(a)) { const v = n.getAttribute(a), o = tr(v); if (o !== v) n.setAttribute(a, o); }
      if (n.nodeName === 'INPUT' && (n.type === 'button' || n.type === 'submit') && n.value) { const o = tr(n.value); if (o !== n.value) n.value = o; }
      for (let c = n.firstChild; c; c = c.nextSibling) node(c);
    }
  }
  let busy = false;
  const mo = new MutationObserver(list => {
    if (busy) return; busy = true;
    try {
      for (const m of list) {
        if (m.type === 'childList') m.addedNodes.forEach(node);
        else if (m.type === 'characterData') node(m.target);
        else if (m.type === 'attributes') { const v = m.target.getAttribute(m.attributeName); const o = tr(v); if (o !== v) m.target.setAttribute(m.attributeName, o); }
      }
    } finally { busy = false; }
    addSwitch();
  });
  const start = () => { node(document.documentElement); mo.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS }); addSwitch(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  // ---- text that never reaches the page: the card picture, copied and shared texts
  const C2 = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
  if (C2) for (const f of ['fillText', 'strokeText', 'measureText']) { const o = C2[f]; C2[f] = function (t, ...a) { return o.call(this, tr(String(t)), ...a); }; }
  if (navigator.clipboard && navigator.clipboard.writeText) { const o = navigator.clipboard.writeText.bind(navigator.clipboard); try { navigator.clipboard.writeText = t => o(tr(String(t))); } catch (e) {} }
  if (navigator.share) { const o = navigator.share.bind(navigator); try { navigator.share = d => o(Object.assign({}, d, d && d.text ? { text: tr(d.text) } : {}, d && d.title ? { title: tr(d.title) } : {})); } catch (e) {} }
  const oc = window.confirm; if (oc) window.confirm = m => oc(tr(String(m)));

  // ---- the DA / EN switch: next to the logo on the web (.brand), on the welcome/top bar in the app (.wm / #langslot)
  function addSwitch() {
    if (document.querySelector('.langsw')) return;
    const brand = document.querySelector('.brand');
    const host = document.querySelector('#langslot') || (brand && brand.parentNode) || (document.querySelector('#phone') ? document.body : null);
    if (!host) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'langsw' + (host === document.body ? ' float' : ''); b.setAttribute('data-no-tr', '');
    b.textContent = lang === 'da' ? 'EN' : 'DA';
    b.setAttribute('aria-label', lang === 'da' ? 'Switch to English' : 'Skift til dansk');
    b.onclick = () => window.SL_SETLANG(lang === 'da' ? 'en' : 'da');
    host.appendChild(b);
  }
})();
