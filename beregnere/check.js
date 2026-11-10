#!/usr/bin/env node
/* Tjek af beregnerne. Kør fra repo-roden:  node beregnere/check.js
   Eksempler fra officielle kilder er markeret [officiel]; resten er håndregnet [hånd]. */
"use strict";
var fs = require("fs"), vm = require("vm"), path = require("path");
var dir = __dirname;
var ctx = {}; ctx.globalThis = ctx; ctx.window = ctx; vm.createContext(ctx);
["satser-2026.js", "satser-2027.js", "beregn.js"].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(dir, f), "utf8"), ctx);
});
var B = ctx.WS_BEREGN, S = ctx.WS_SATSER, S26 = S[2026], S27 = S[2027];
var kom = function (n, y) { return (y === 2027 ? S27 : S26).kommuner.data[n]; };

var ok = 0, fail = 0;
function near(navn, got, want, tol) {
  if (Math.abs(got - want) <= (tol || 0.01)) { ok++; }
  else { fail++; console.log("FEJL  " + navn + ": fik " + got + ", ventede " + want); }
}

// --- Moms [hånd]
var m1 = B.moms(1000, "til", S26); near("moms til ex", m1.ex, 1000); near("moms til", m1.moms, 250); near("moms til inkl", m1.inkl, 1250);
var m2 = B.moms(1250, "fra", S26); near("moms fra ex", m2.ex, 1000); near("moms fra", m2.moms, 250); near("moms fra inkl", m2.inkl, 1250);

// --- Kørsel: Den juridiske vejledning 2026-2, C.A.4.3.3.2.1 [officiel]
var k = function (o) { return B.koersel(Object.assign({ dage: 1, yderkommune: false, broPrDag: 0, indkomst: null }, o), S26); };
near("JV 46 km", k({ kmPrDag: 46 }).prDag, 69.74);
near("JV 128 km", k({ kmPrDag: 128 }).prDag, 317.04);
near("24 km intet", k({ kmPrDag: 24 }).prDag, 0);
near("25 km", k({ kmPrDag: 25 }).prDag, 3.17);
// Yderkommune: 3,51 kr. over 24 km [officiel sats, håndregnet]
near("Yder 128 km", k({ kmPrDag: 128, yderkommune: true }).prDag, (128 - 24) * 3.51);
// Roskilde-Odense 258 km, 2 x Storebælt: skat.dk-eksemplet med 2026-satser [hånd]
var j = B.koersel({ kmPrDag: 258, dage: 1, yderkommune: false, broPrDag: 220, indkomst: null }, S26);
near("Jens bil pr. dag", j.prDag + j.aarBro, 743.74);
// Lav indkomst [hånd]
near("Tillæg 300.000", B.koersel({ kmPrDag: 60, dage: 220, yderkommune: false, broPrDag: 0, indkomst: 300000 }, S26).tillaeg, 36 * 3.17 * 220 * 0.64);
near("Tillæg loft", B.koersel({ kmPrDag: 200, dage: 300, yderkommune: false, broPrDag: 0, indkomst: 300000 }, S26).tillaeg, 30800);
var mid = B.koersel({ kmPrDag: 120, dage: 200, yderkommune: false, broPrDag: 0, indkomst: 366500 }, S26);
near("Tillæg midt, pct", mid.tillaegPct, 32);
near("Tillæg midt, loft", mid.tillaegLoft, 15400);
near("Tillæg 391.500", B.koersel({ kmPrDag: 60, dage: 220, yderkommune: false, broPrDag: 0, indkomst: 391500 }, S26).tillaeg, 0);

// --- Ferie [officielle satser, hånd]
var f = B.ferie({ loen: 35000, maaneder: 12, dage: 0 }, S26);
near("24,96 dage", f.optjent, 24.96); near("12,5 %", f.godtgorelse, 52500); near("1 %", f.tillaeg, 4200); near("12 %", f.godtgorelse12, 50400);
var f2 = B.ferie({ loen: 30000, maaneder: 6, dage: 10 }, S26);
near("6 md. + 10 dage", f2.optjent, 12.48 + 0.7);
near("Dage højst 2,08", B.ferie({ loen: 30000, maaneder: 0, dage: 31 }, S26).optjent, 2.08);

// --- Løn efter skat 2026, 40.000 kr., København, uden kirkeskat [hånd]
var l = B.loen({ maanedsloen: 40000, kommune: kom("København")[0], kirkeProcent: kom("København")[1], kirke: false }, S26);
near("AM", l.am, 38400); near("personlig", l.personlig, 441600);
near("besk", l.besk, 61200); near("job", l.job, 3100); near("skattepligtig", l.skattepligtig, 377300);
near("bund", l.bundskat, 46538.75); near("kommune", l.kommuneskat, 75596.48); near("mellem", l.mellemskat, 0);
near("netto år", l.nettoAar, 319464.77); near("netto md", l.nettoMaaned, 26622.06, 0.01);

// 70.000 kr., Læsø, med kirkeskat: mellemskat med skatteloft-nedslag [hånd]
var r = kom("Læsø");
var l2 = B.loen({ maanedsloen: 70000, kommune: r[0], kirkeProcent: r[1], kirke: true }, S26);
near("70.000: personlig", l2.personlig, 772800);
near("70.000: besk loft", l2.besk, 63300);
near("70.000: job loft", l2.job, 3100);
near("70.000: skattepligtig", l2.skattepligtig, 706400);
near("70.000: bund", l2.bundskat, 86315.87);
near("70.000: kommune", l2.kommuneskat, 652300 * r[0] / 100);
near("70.000: kirke", l2.kirkeskat, 652300 * r[1] / 100);
near("70.000: nedslag", l2.nedslag, r[0] + 12.01 + 7.5 - 44.57);
near("70.000: mellem", l2.mellemskat, 131600 * (7.5 - (r[0] + 12.01 + 7.5 - 44.57)) / 100);
near("70.000: top", l2.topskat, 0);

// 300.000 kr., København: topskat og toptopskat [hånd]
var l3 = B.loen({ maanedsloen: 300000, kommune: kom("København")[0], kirkeProcent: kom("København")[1], kirke: false }, S26);
near("300.000: personlig", l3.personlig, 3312000);
near("300.000: mellem uden nedslag", l3.mellemskat, (3312000 - 641200) * 0.075);
near("300.000: top", l3.topskat, (3312000 - 777900) * 0.075);
near("300.000: toptop", l3.toptopskat, (3312000 - 2592700) * 0.05);

// Enlig forsørger, pension, andre fradrag og lav løn [hånd]
var l4 = B.loen({ maanedsloen: 30000, kommune: 25, kirkeProcent: 0, kirke: false, enlig: true, pensionPrMd: 1000, andreFradrag: 5000 }, S26);
near("grundlag efter pension", l4.grundlag, 348000);
near("AM af grundlag", l4.am, 27840);
near("besk af grundlag", l4.besk, 348000 * 0.1275);
near("enlig", l4.enlig, 348000 * 0.115);
near("job loft", l4.job, 3100);
var l4b = B.loen({ maanedsloen: 21000, kommune: 25, kirkeProcent: 0, kirke: false }, S26);
near("job under loft", l4b.job, (252000 - 235200) * 0.045);
var l5 = B.loen({ maanedsloen: 4000, kommune: 25, kirkeProcent: 0, kirke: false }, S26);
near("lav løn: AM", l5.am, 3840); near("lav løn: bund 0", l5.bundskat, 0); near("lav løn: kommune 0", l5.kommuneskat, 0);

// 2027: beløbsgrænser fra ministeriets tabel, reguleret [hånd]
var l27 = B.loen({ maanedsloen: 40000, kommune: kom("København", 2027)[0], kirkeProcent: 0, kirke: false }, S27);
near("2027 personfradrag", l27.personfradrag, 55700);
near("2027 besk", l27.besk, 61200);
near("2027 job", l27.job, 3200);
near("2027 bund", l27.bundskat, (441600 - 55700) * 0.1201);

// --- Dataintegritet
[S26, S27].forEach(function (s) {
  var n = Object.keys(s.kommuner.data).length;
  near(s.aar + ": 98 kommuner", n, 98, 0);
  Object.keys(s.kommuner.data).forEach(function (navn) {
    var v = s.kommuner.data[navn];
    if (!(v[0] > 22 && v[0] < 28)) { fail++; console.log("FEJL kommuneskat", s.aar, navn, v); }
    if (!(v[1] > 0.2 && v[1] < 1.6)) { fail++; console.log("FEJL kirkeskat", s.aar, navn, v); }
  });
});
near("København 2026 kommune", kom("København")[0], 23.39);
near("Slagelse 2026 kommune", kom("Slagelse")[0], 26.1);
near("Slagelse 2026 kirke", kom("Slagelse")[1], 0.96);
near("Horsens 2026 kommune", kom("Horsens")[0], 25.69);
near("Læsø 2027 kommune", kom("Læsø", 2027)[0], 26.3);
near("Rudersdal 2027 kommune", kom("Rudersdal", 2027)[0], 23.47);

console.log(ok + " tjek bestået, " + fail + " fejlet");
process.exit(fail ? 1 : 0);
