/* Beregnere på webspind.com: selve regnestykkerne, uden DOM.
   Alle satser ligger i satser-2026.js / satser-2027.js med kilde ved hver værdi.
   Virker både i browseren og i node (beregnere/check.js). */
(function (root) {
  "use strict";

  function pos(n) { return n > 0 ? n : 0; }
  function v(x) { return x.v; }

  // ---- Moms -------------------------------------------------------------
  function moms(belob, mode, S) {
    var sats = v(S.moms.sats) / 100, ex, inkl;
    if (mode === "fra") { inkl = belob; ex = belob / (1 + sats); }
    else { ex = belob; inkl = belob * (1 + sats); }
    return { ex: ex, moms: inkl - ex, inkl: inkl, sats: v(S.moms.sats) };
  }

  // ---- Kørselsfradrag -----------------------------------------------------
  // S.koersel er null, hvis året ikke er fastsat endnu.
  function koersel(input, S) {
    var K = S.koersel;
    var km = input.kmPrDag, dage = input.dage, bro = input.broPrDag || 0;
    var over24 = pos(km - v(K.gratisKm));
    var mellem = Math.min(over24, v(K.knaekKm) - v(K.gratisKm));
    var rest = pos(km - v(K.knaekKm));
    var kmDel;
    if (input.yderkommune) {
      kmDel = over24 * v(K.satsYder);
    } else {
      kmDel = mellem * v(K.sats25_120) + rest * v(K.satsOver120);
    }
    var prDag = kmDel;
    var aarKm = prDag * dage;
    var aarBro = bro * dage;
    var grund = aarKm + aarBro;

    var indkomst = input.indkomst;
    var tillaeg = 0, tPct = v(K.tillaegPct), tLoft = v(K.tillaegMaks);
    if (indkomst != null && indkomst >= 0 && grund > 0) {
      var over = pos(indkomst - v(K.tillaegGraense)) / 1000;
      tPct = pos(v(K.tillaegPct) - over * v(K.tillaegAftrapPct));
      tLoft = pos(v(K.tillaegMaks) * (1 - over * v(K.tillaegAftrapLoftPct) / 100));
      tillaeg = Math.min(grund * tPct / 100, tLoft);
    }
    return {
      over24: over24, mellemKm: input.yderkommune ? over24 : mellem, restKm: input.yderkommune ? 0 : rest,
      prDag: prDag, aarKm: aarKm, aarBro: aarBro, grund: grund,
      tillaeg: tillaeg, tillaegPct: tPct, tillaegLoft: tLoft,
      fradrag: grund + tillaeg
    };
  }

  // ---- Feriepenge ---------------------------------------------------------
  function ferie(input, S) {
    var F = S.ferie;
    var maaneder = Math.min(input.maaneder, 12);
    var dage = maaneder >= 12 ? 0 : input.dage;
    var loen = input.loen;
    // § 5: 2,08 dage pr. hel måned; kortere end en måned 0,07 pr. dag, højst 2,08.
    var optjent = maaneder * v(F.dagePrMaaned) +
                  Math.min(dage * v(F.dagePrDag), v(F.dagePrMaaned));
    var periode = maaneder + dage / 30;
    var lonPeriode = loen * periode;
    var dagsloen = loen * 12 / v(F.arbejdsdageAar);
    return {
      optjent: optjent,
      lonPeriode: lonPeriode,
      godtgorelse: lonPeriode * v(F.godtgorelsePct) / 100,
      godtgorelse12: lonPeriode * v(F.godtgorelseValgfriPct) / 100,
      tillaeg: lonPeriode * v(F.tillaegPct) / 100,
      dagsloen: dagsloen,
      lonUnderFerie: optjent * dagsloen
    };
  }

  // ---- Løn efter skat -----------------------------------------------------
  // Årsregnestykket følger personskatteloven (PSL) og ligningsloven (LL).
  function loen(input, S) {
    var P = S.personskat, LL = S.ligning;
    var maaned = input.maanedsloen;
    var pension = input.pensionPrMd || 0;
    var kommune = input.kommune;   // procent
    var kirke = input.kirke ? input.kirkeProcent : 0;
    var andre = input.andreFradrag || 0;

    var aarsloen = maaned * 12;
    var aarPension = pension * 12;
    var grundlag = pos(aarsloen - aarPension);   // AM-grundlag

    var am = grundlag * v(S.am.sats) / 100;
    var personlig = grundlag - am;               // personlig indkomst

    var besk = Math.min(grundlag * v(LL.beskPct) / 100, v(LL.beskMaks));
    var enlig = input.enlig ? Math.min(grundlag * v(LL.enligPct) / 100, v(LL.enligMaks)) : 0;
    var job = Math.min(pos(grundlag - v(LL.jobGraense)) * v(LL.jobPct) / 100, v(LL.jobMaks));

    var pf = v(P.personfradrag);
    var skattepligtig = personlig - besk - enlig - job - andre;

    var kommuneBase = pos(skattepligtig - pf);
    var kommuneskat = kommuneBase * kommune / 100;
    var kirkeskat = kommuneBase * kirke / 100;

    var bundBase = pos(personlig - pf);
    var bundskat = bundBase * v(P.bundPct) / 100;

    var mellemBase = pos(personlig - v(P.mellemGraense));
    var nedslag = pos(kommune + v(P.bundPct) + v(P.mellemPct) - v(P.skatteloftPct));
    var mellemSats = pos(v(P.mellemPct) - nedslag);
    var mellemskat = mellemBase * mellemSats / 100;

    var topBase = pos(personlig - v(P.topGraense));
    var topskat = topBase * v(P.topPct) / 100;

    var toptopBase = pos(personlig - v(P.toptopGraense));
    var toptopskat = toptopBase * v(P.toptopPct) / 100;

    var skatIalt = bundskat + kommuneskat + kirkeskat + mellemskat + topskat + toptopskat;
    var nettoAar = grundlag - am - skatIalt;

    return {
      aarsloen: aarsloen, pension: aarPension, grundlag: grundlag,
      am: am, personlig: personlig,
      besk: besk, enlig: enlig, job: job, andre: andre, skattepligtig: skattepligtig,
      personfradrag: pf,
      kommuneBase: kommuneBase, kommuneskat: kommuneskat, kirkeskat: kirkeskat,
      bundBase: bundBase, bundskat: bundskat,
      mellemBase: mellemBase, mellemSats: mellemSats, nedslag: nedslag, mellemskat: mellemskat,
      topBase: topBase, topskat: topskat,
      toptopBase: toptopBase, toptopskat: toptopskat,
      skatIalt: skatIalt,
      nettoAar: nettoAar, nettoMaaned: nettoAar / 12,
      skatMaaned: (am + skatIalt) / 12,
      procent: aarsloen > 0 ? (am + skatIalt) / aarsloen * 100 : 0
    };
  }

  var api = { moms: moms, koersel: koersel, ferie: ferie, loen: loen };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.WS_BEREGN = api;
})(typeof window !== "undefined" ? window : globalThis);
