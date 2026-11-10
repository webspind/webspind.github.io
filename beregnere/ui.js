/* Beregnere: formattering og kobling mellem felter og resultater.
   Intet forlader browseren: ingen cookies, ingen netkald, ingen måling. */
(function () {
  "use strict";
  var B = window.WS_BEREGN, SATSER = window.WS_SATSER;

  var fmt0 = new Intl.NumberFormat("da-DK", { maximumFractionDigits: 0 });
  var fmt2 = new Intl.NumberFormat("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function kr(n) { return fmt0.format(Math.round(n)) + " kr."; }
  function kr2(n) { return fmt2.format(n) + " kr."; }
  function pct(n, d) { return new Intl.NumberFormat("da-DK", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n) + " %"; }

  // Dansk tal: "1.234,50" eller "1234.50" eller "35 000".
  function tal(s) {
    if (s == null) return NaN;
    var t = String(s).toLowerCase().replace(/kr\.?/g, "").replace(/\s/g, "").trim();
    if (!t) return NaN;
    if (t.indexOf(",") >= 0) t = t.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
    var n = Number(t);
    return isFinite(n) ? n : NaN;
  }

  function $(id) { return document.getElementById(id); }
  function set(id, text) { var e = $(id); if (e) e.textContent = text; }
  function hide(id, h) { var e = $(id); if (e) e.hidden = h; }

  // Pænt komma og tusindtal, når feltet forlades.
  document.querySelectorAll("input[data-kr]").forEach(function (el) {
    el.addEventListener("blur", function () {
      var n = tal(el.value);
      if (!isNaN(n)) el.value = new Intl.NumberFormat("da-DK", { maximumFractionDigits: 2 }).format(n);
    });
  });

  var ugyldig = false;
  function maal(el, min, max) {
    var raw = el.value, n = tal(raw);
    var bad = raw.trim() !== "" && isNaN(n);
    if (bad) ugyldig = true;
    el.classList.toggle("b-bad", bad);
    el.setAttribute("aria-invalid", bad ? "true" : "false");
    if (isNaN(n)) return 0;
    if (min != null && n < min) n = min;
    if (max != null && n > max) n = max;
    return n;
  }

  function fejl(id, msg) {
    var e = $(id);
    if (!e) return;
    e.textContent = msg || "";
    e.hidden = !msg;
  }

  function visFejl(bigId, big, lblId, lbl) {
    set(bigId, ugyldig ? "–" : big);
    set(lblId, ugyldig ? "Tjek det markerede felt" : lbl);
  }

  // ---- Momsberegner
  if ($("moms-form")) {
    var mf = $("moms-form");
    var runMoms = function () {
      var S = SATSER[2026];
      var mode = mf.elements.mode.value;
      var b = tal($("moms-belob").value);
      fejl("moms-fejl", (isNaN(b) || b < 0) && $("moms-belob").value.trim() ? "Skriv et beløb, fx 1.250,00." : "");
      if (isNaN(b) || b < 0) b = 0;
      var r = B.moms(b, mode, S);
      set("moms-res", kr2(mode === "fra" ? r.ex : r.inkl));
      set("moms-res-lbl", mode === "fra" ? "Pris uden moms" : "Pris med moms");
      set("moms-ex", kr2(r.ex));
      set("moms-moms", kr2(r.moms));
      set("moms-inkl", kr2(r.inkl));
    };
    mf.addEventListener("input", runMoms);
    mf.addEventListener("change", runMoms);
    runMoms();
  }

  // ---- Kørselsfradrag
  if ($("koersel-form")) {
    var kf = $("koersel-form");
    var runK = function () {
      var S = SATSER[2026];
      ugyldig = false;
      var en = maal($("k-km"), 0, 2000);
      var dage = maal($("k-dage"), 0, 366);
      var yder = $("k-yder").checked;
      var bro = maal(kf.elements.bro, 0, null);
      var passager = maal($("k-pass"), 0, 10);
      var indkomst = tal($("k-indkomst").value);
      var kmDag = en * 2;
      var r = B.koersel({
        kmPrDag: kmDag, dage: dage, yderkommune: yder, broPrDag: bro * passager,
        indkomst: isNaN(indkomst) ? null : indkomst
      }, S);
      visFejl("k-res", kr(r.fradrag), "k-lbl", "Dit kørselsfradrag for 2026");
      set("k-kmdag", fmt0.format(kmDag) + " km");
      set("k-prdag", kr2(r.prDag));
      set("k-aarkm", kr(r.aarKm));
      set("k-broaar", kr(r.aarBro));
      hide("k-broaar-row", r.aarBro === 0);
      set("k-till", kr(r.tillaeg));
      hide("k-till-row", r.tillaeg === 0);
      set("k-vaerdi", kr(r.fradrag * (S.gnsKommune.v) / 100));
      set("k-note", kmDag <= 24
        ? "Du kører " + fmt0.format(kmDag) + " km om dagen. Der er først fradrag, når turen frem og tilbage er over 24 km."
        : (yder ? "Du regnes med yderkommune-satsen på 3,51 kr. pr. km over 24 km." : "Du regnes med 3,17 kr. pr. km fra 25 til 120 km og 1,59 kr. over 120 km."));
    };
    kf.addEventListener("input", runK);
    kf.addEventListener("change", runK);
    runK();
  }

  // ---- Feriepenge
  if ($("ferie-form")) {
    var ff = $("ferie-form");
    var runF = function () {
      var S = SATSER[2026];
      ugyldig = false;
      var loen = maal($("f-loen"), 0, null);
      var m = Math.floor(maal($("f-maaneder"), 0, 12));
      var d = Math.floor(maal($("f-dage"), 0, 31));
      if (m >= 12) d = 0;
      var r = B.ferie({ loen: loen, maaneder: m, dage: d }, S);
      visFejl("f-dagene", fmt2.format(r.optjent) + " dage", "f-lbl", "Optjente feriedage");
      set("f-lonper", kr(r.lonPeriode));
      set("f-godt", kr(r.godtgorelse));
      set("f-godt12", kr(r.godtgorelse12));
      set("f-tillaeg", kr(r.tillaeg));
      set("f-dagsloen", kr(r.dagsloen));
      set("f-medlon", kr(r.lonUnderFerie + r.tillaeg));
      set("f-loen-ferie", kr(r.lonUnderFerie));
      set("f-note", m >= 12 ? "Et helt ferieår giver 12 x 2,08 = 24,96 dage. Det svarer til de 5 ugers ferie, loven giver." : "");
    };
    ff.addEventListener("input", runF);
    ff.addEventListener("change", runF);
    runF();
  }

  // ---- Løn efter skat
  if ($("loen-form")) {
    var lf = $("loen-form");
    var kommuneEl = $("l-kommune");
    var aarEl = $("l-aar");
    var fyldKommuner = function () {
      var S = SATSER[Number(aarEl.value)];
      var valgt = kommuneEl.value;
      var navne = Object.keys(S.kommuner.data).sort(function (a, b) { return a.localeCompare(b, "da"); });
      kommuneEl.textContent = "";
      navne.forEach(function (n) {
        var o = document.createElement("option");
        o.value = n; o.textContent = n;
        kommuneEl.appendChild(o);
      });
      kommuneEl.value = navne.indexOf(valgt) >= 0 ? valgt : "København";
    };
    var runL = function () {
      var aar = Number(aarEl.value);
      var S = SATSER[aar];
      var navn = kommuneEl.value;
      var k = S.kommuner.data[navn];
      ugyldig = false;
      var maaned = maal($("l-loen"), 0, null);
      var pension = maal($("l-pension"), 0, null);
      var r = B.loen({
        maanedsloen: maaned, pensionPrMd: Math.min(pension, maaned),
        kommune: k[0], kirkeProcent: k[1],
        kirke: $("l-kirke").checked, enlig: $("l-enlig").checked,
        andreFradrag: maal($("l-andre"), 0, null)
      }, S);

      visFejl("l-res", kr(r.nettoMaaned), "l-res-lbl", "Udbetalt om måneden (" + navn + ", " + aar + ")");
      set("l-skatpct", pct(r.procent, 1));
      set("l-netaar", kr(r.nettoAar));
      set("l-am", kr(r.am / 12));
      set("l-bund", kr(r.bundskat / 12));
      set("l-kom", kr(r.kommuneskat / 12));
      set("l-kommune-pct", pct(k[0], 2));
      set("l-kir", kr(r.kirkeskat / 12));
      set("l-kirke-pct", pct(k[1], 2));
      hide("l-kir-row", !$("l-kirke").checked);
      set("l-mellem", kr(r.mellemskat / 12));
      hide("l-mellem-row", r.mellemskat === 0);
      set("l-mellem-sats", pct(r.mellemSats, 2));
      set("l-top", kr(r.topskat / 12));
      hide("l-top-row", r.topskat === 0);
      set("l-tt", kr(r.toptopskat / 12));
      hide("l-tt-row", r.toptopskat === 0);
      set("l-pensionvis", kr(r.pension / 12));
      hide("l-pensionvis-row", r.pension === 0);
      set("l-besk", kr(r.besk));
      set("l-job", kr(r.job));
      set("l-enligv", kr(r.enlig));
      hide("l-enlig-row", r.enlig === 0);
      set("l-andre-v", kr(r.andre));
      hide("l-andre-row", r.andre === 0);
      set("l-pf", kr(r.personfradrag));
      set("l-sk", kr(r.skattepligtig));
      $("l-2027-note").hidden = aar !== 2027;
    };
    fyldKommuner();
    aarEl.addEventListener("change", function () { fyldKommuner(); runL(); });
    lf.addEventListener("input", runL);
    lf.addEventListener("change", runL);
    runL();
  }
})();
