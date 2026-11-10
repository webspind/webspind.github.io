// Webspind free exam tools: the quiz and the "what can I hunt today" lookup.
// Plain DOM, no dependencies. Nothing is sent or stored; data is inlined in the page.
(function () {
  "use strict";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function fill(s) {
    var a = [].slice.call(arguments, 1);
    return s.replace(/%d/g, function () { return a.shift(); });
  }
  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function data(id) { return JSON.parse(document.getElementById(id).textContent); }

  // ---------------------------------------------------------------- quiz
  function quiz(root) {
    var cfg = data("quiz-data"), ui = cfg.ui;
    var deck, at, picks, chosen = null;

    function scrollTop() {
      if (root.getBoundingClientRect().top < 56) root.scrollIntoView({ block: "start" });
    }

    function start() {
      clear(root);
      var head = el("div", "xt-head");
      head.appendChild(el("h2", null, ui.start));
      head.appendChild(el("p", null, ui.startSub));
      root.appendChild(head);
      var row = el("div", "xt-lengths");
      cfg.lengths.forEach(function (n, i) {
        var last = i === cfg.lengths.length - 1;
        var b = el("button", "btn" + (i === 1 ? "" : " btn-secondary"), last ? fill(ui.all, n) : fill(ui.go, n));
        b.type = "button";
        b.addEventListener("click", function () { begin(n); });
        row.appendChild(b);
      });
      root.appendChild(row);
    }

    function begin(n) {
      deck = shuffle(cfg.questions).slice(0, n).map(function (q) {
        return { q: q, options: q.keepOrder ? q.options : shuffle(q.options) };
      });
      at = 0; picks = [];
      question();
    }

    function question() {
      chosen = null;
      clear(root);
      var item = deck[at], q = item.q;
      var progress = el("div", "xt-progress");
      progress.appendChild(el("span", null, fill(ui.progress, at + 1, deck.length)));
      progress.appendChild(el("span", "xt-topic", q.topic));
      root.appendChild(progress);
      var bar = el("div", "xt-bar");
      var fillBar = el("span");
      fillBar.style.width = ((at + 1) / deck.length * 100) + "%";
      bar.appendChild(fillBar);
      bar.setAttribute("aria-hidden", "true");
      root.appendChild(bar);

      var prompt = el("h2", "xt-q", q.prompt);
      prompt.tabIndex = -1;
      root.appendChild(prompt);

      var list = el("div", "xt-options");
      list.setAttribute("role", "group");
      list.setAttribute("aria-label", q.prompt);
      item.options.forEach(function (o, i) {
        var b = el("button", "xt-opt");
        b.type = "button";
        b.appendChild(el("span", "xt-key", String(i + 1)));
        b.appendChild(el("span", "xt-txt", o.text));
        b.dataset.id = o.id;
        b.addEventListener("click", function () { answer(o.id); });
        list.appendChild(b);
      });
      root.appendChild(list);

      var feedback = el("div", "xt-feedback");
      feedback.id = "xt-fb";
      feedback.setAttribute("aria-live", "polite");
      root.appendChild(feedback);

      root.appendChild(el("p", "xt-hint", ui.keyHint));
      scrollTop();
      prompt.focus({ preventScroll: true });
    }

    function answer(id) {
      if (chosen !== null) return;
      chosen = id;
      var item = deck[at], q = item.q, ok = id === q.correct;
      picks[at] = id;
      var buttons = root.querySelectorAll(".xt-opt");
      for (var i = 0; i < buttons.length; i++) {
        var b = buttons[i], bid = b.dataset.id;
        b.disabled = true;
        if (bid === q.correct) { b.classList.add("is-right"); b.appendChild(el("span", "xt-mark", "✓")); }
        else if (bid === id) { b.classList.add("is-wrong"); b.appendChild(el("span", "xt-mark", "✗")); }
      }
      var fb = document.getElementById("xt-fb");
      var v = el("p", "xt-verdict " + (ok ? "ok" : "no"), ok ? ui.right : ui.wrong);
      if (!ok) {
        v.appendChild(document.createTextNode(" "));
        v.appendChild(el("strong", null, q.options.filter(function (o) { return o.id === q.correct; })[0].text));
      }
      fb.appendChild(v);
      fb.appendChild(el("p", "xt-expl", q.explanation));
      if (q.source) fb.appendChild(el("p", "xt-src", ui.source + ": " + q.source));
      var next = el("button", "btn xt-next", at === deck.length - 1 ? ui.finish : ui.next);
      next.type = "button";
      next.addEventListener("click", function () {
        if (at === deck.length - 1) done();
        else { at++; question(); }
      });
      fb.appendChild(next);
      var hint = root.querySelector(".xt-hint");
      if (hint) hint.remove();
      next.focus({ preventScroll: true });
      var r = next.getBoundingClientRect();
      if (r.bottom > window.innerHeight) window.scrollBy({ top: r.bottom - window.innerHeight + 24, behavior: "smooth" });
    }

    function done() {
      clear(root);
      var right = picks.filter(function (p, i) { return p === deck[i].q.correct; }).length;
      var head = el("div", "xt-result");
      var score = el("h2", "xt-score", fill(ui.score, right, deck.length));
      score.tabIndex = -1;
      head.appendChild(score);
      head.appendChild(el("p", "xt-pct", Math.round(right / deck.length * 100) + " %"));
      head.appendChild(el("p", null, ui.note));
      root.appendChild(head);

      var row = el("div", "xt-lengths");
      var again = el("button", "btn", ui.again);
      again.type = "button";
      again.addEventListener("click", function () { begin(deck.length); });
      var other = el("button", "btn btn-secondary", ui.change);
      other.type = "button";
      other.addEventListener("click", start);
      row.appendChild(again); row.appendChild(other);
      root.appendChild(row);

      var details = el("details", "xt-review");
      details.appendChild(el("summary", null, ui.review));
      var list = el("ol");
      deck.forEach(function (item, i) {
        var q = item.q, ok = picks[i] === q.correct;
        var li = el("li", ok ? "ok" : "no");
        li.appendChild(el("p", "xt-rq", q.prompt));
        var yours = q.options.filter(function (o) { return o.id === picks[i]; })[0];
        var said = el("p", null, ui.youSaid + ": " + (yours ? yours.text : ui.noAnswer) + (ok ? " ✓" : " ✗"));
        li.appendChild(said);
        if (!ok) li.appendChild(el("p", "xt-rr", q.options.filter(function (o) { return o.id === q.correct; })[0].text));
        li.appendChild(el("p", "xt-expl", q.explanation));
        if (q.source) li.appendChild(el("p", "xt-src", ui.source + ": " + q.source));
        list.appendChild(li);
      });
      details.appendChild(list);
      root.appendChild(details);
      scrollTop();
      score.focus({ preventScroll: true });
    }

    document.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey || chosen !== null || !deck) return;
      var n = parseInt(e.key, 10);
      if (!n) return;
      var buttons = root.querySelectorAll(".xt-opt");
      if (buttons[n - 1]) { e.preventDefault(); buttons[n - 1].click(); }
    });

    start();
  }

  // ---------------------------------------------------------------- seasons
  var MONTHS = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  var LONG_DATE = new Intl.DateTimeFormat("da-DK", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  function dayText(md) {
    var p = md.split("-"), m = +p[0], d = +p[1];
    if (m === 2 && d === 29) return "sidste dag i feb";
    return d + ". " + MONTHS[m - 1];
  }

  function parts(iso) {
    var p = iso.split("-").map(Number);
    return { y: p[0], m: p[1], d: p[2], md: p[1] * 100 + p[2], wd: new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay() };
  }

  function daysIn(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }

  function fullWeekendSaturday(number, day) {
    var first = new Date(Date.UTC(day.y, day.m - 1, 1)).getUTCDay();
    var sat = 1 + (6 - first + 7) % 7, count = 0, last = daysIn(day.y, day.m);
    while (sat + 1 <= last) {
      count++;
      if (count === number) return sat;
      sat += 7;
    }
    return null;
  }

  function mdValue(md) { var p = md.split("-"); return +p[0] * 100 + +p[1]; }

  function active(p, day) {
    if (p.start) {
      var s = mdValue(p.start), e = mdValue(p.end);
      return s <= e ? day.md >= s && day.md <= e : day.md >= s || day.md <= e;
    }
    if (p.saturdays) {
      return day.m === p.saturdays && day.wd === 6 && p.which.indexOf(Math.floor((day.d - 1) / 7) + 1) >= 0;
    }
    if (p.fullWeekend) {
      if (day.m !== p.fullWeekend) return false;
      var which = Array.isArray(p.which) ? p.which[0] : p.which;
      var sat = fullWeekendSaturday(which, day);
      return sat !== null && (day.d === sat || day.d === sat + 1);
    }
    return false;
  }

  function rangeText(p) { return p.start ? dayText(p.start) + " – " + dayText(p.end) : p.text; }

  function seasons() {
    var d = data("season-data");
    var blocks = {};
    d.blocks.forEach(function (b) { blocks[b.id] = b; });
    var areas = {};
    ["small", "kron", "daa"].forEach(function (k) { d.areas[k].forEach(function (a) { areas[a.id] = a; }); });

    var input = document.getElementById("st-date");
    var picks = { small: "st-small", kron: "st-kron", daa: "st-daa" };
    var nodes = {};
    Object.keys(picks).forEach(function (k) { nodes[k] = document.getElementById(picks[k]); });

    // Region names head the option groups for the small areas; deer areas list directly.
    var byRegion = {};
    d.areas.small.forEach(function (a) { (byRegion[a.region] = byRegion[a.region] || []).push(a); });
    Object.keys(byRegion).forEach(function (r) {
      var g = el("optgroup"); g.label = r;
      byRegion[r].forEach(function (a) { var o = el("option", null, a.name); o.value = a.id; g.appendChild(o); });
      nodes.small.appendChild(g);
    });
    ["kron", "daa"].forEach(function (k) {
      d.areas[k].forEach(function (a) { var o = el("option", null, a.name); o.value = a.id; nodes[k].appendChild(o); });
    });

    input.min = d.validFrom;
    input.value = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Copenhagen" }).format(new Date());

    var banner = document.getElementById("st-banner");
    var summary = document.getElementById("st-summary");
    var results = document.getElementById("st-results");

    function choice() {
      return { small: nodes.small.value, kron: nodes.kron.value, daa: nodes.daa.value };
    }

    function pickerFor(id) { return id === "kronvildt" ? "kron" : id === "daavildt" ? "daa" : "small"; }

    function rowsFor(s, ch) {
      var general = s.periods.map(function (p) {
        return { speciesID: s.id, label: p.label, periods: [p], replaces: [], ref: "Bilag 1" };
      });
      var local = [];
      ["small", "kron", "daa"].forEach(function (k) {
        var a = areas[ch[k]];
        if (!a) return;
        a.blocks.forEach(function (bid) {
          var b = blocks[bid];
          if (!b) return;
          b.rows.forEach(function (r) {
            if (r.speciesID === s.id) local.push({
              speciesID: r.speciesID, label: r.label, periods: r.periods, replaces: r.replaces || [],
              note: r.note, ref: b.ref
            });
          });
        });
      });
      if (!local.length) return general;
      var replaced = {};
      local.forEach(function (r) { r.replaces.forEach(function (x) { replaced[x] = true; }); });
      var kept = replaced["*"] ? [] : general.filter(function (r) { return !replaced[r.label]; });
      var seen = {}, unique = [];
      for (var i = local.length - 1; i >= 0; i--) {
        if (!seen[local[i].label]) { seen[local[i].label] = true; unique.unshift(local[i]); }
      }
      return kept.concat(unique);
    }

    function openRows(s, ch, day) {
      var rows = rowsFor(s, ch).filter(function (r) { return r.periods.some(function (p) { return active(p, day); }); });
      (s.extra || []).forEach(function (x) {
        if (x.noArea && ch.small) return;
        if (active(x, day)) rows.push({ label: "Alle", periods: [x], extra: x.cond });
      });
      return rows;
    }

    function nextOpen(ch, day) {
      for (var i = 1; i < 366; i++) {
        var t = new Date(Date.UTC(day.y, day.m - 1, day.d + i));
        var iso = t.toISOString().slice(0, 10), p = parts(iso), found = [];
        d.species.forEach(function (s) { if (openRows(s, ch, p).length) found.push(s.name); });
        if (found.length) return { iso: iso, names: found };
      }
      return null;
    }

    function renderBanner(iso, day) {
      clear(banner);
      if (iso < d.draft.date) return;
      var box = el("div", "xt-warn");
      box.appendChild(el("strong", null, "Datoen ligger efter 1. februar 2027."));
      box.appendChild(el("p", null, "Et udkast til nye jagttider er i høring med forventet ikrafttræden den dag. Det er ikke vedtaget, så listen viser reglerne i bekendtgørelse nr. 470 af 2024, der gælder i dag. Er udkastet vedtaget, når du læser det her, kan listen være forkert, især for hare, canadagås, ringdue, edderfugl og lokale jagttider for kron- og dåvildt."));
      banner.appendChild(box);
    }

    function render() {
      var iso = input.value;
      clear(results);
      if (!iso || iso < d.validFrom) {
        clear(banner);
        summary.textContent = "Vælg en dato fra 1. juli 2024 og frem. Reglerne her gælder fra den dag.";
        return;
      }
      var day = parts(iso), ch = choice(), pre = iso >= d.draft.date;
      renderBanner(iso, day);
      var date = LONG_DATE.format(new Date(Date.UTC(day.y, day.m - 1, day.d)));
      var rows = [];
      d.species.forEach(function (s) {
        var open = openRows(s, ch, day);
        if (open.length) rows.push({ s: s, open: open });
      });
      if (!rows.length) {
        summary.textContent = "Ingen arter har jagttid " + date + ".";
        var next = nextOpen(ch, day);
        if (next) {
          var nd = parts(next.iso);
          var p = el("p", "xt-empty", "Næste jagttid åbner " + LONG_DATE.format(new Date(Date.UTC(nd.y, nd.m - 1, nd.d))) + ": " + next.names.join(", ") + ".");
          results.appendChild(p);
        }
        return;
      }
      var total = rows.length;
      summary.textContent = total + (total === 1 ? " art har" : " arter har") + " jagttid " + date + ".";
      Object.keys(d.groups).forEach(function (g) {
        var inGroup = rows.filter(function (r) { return r.s.group === g; });
        if (!inGroup.length) return;
        var sec = el("section", "xt-group");
        sec.appendChild(el("h3", null, d.groups[g]));
        var ul = el("ul");
        inGroup.forEach(function (r) {
          var li = el("li");
          li.appendChild(el("strong", null, r.s.name));
          r.open.forEach(function (row) {
            var line = el("p", "xt-range");
            var label = row.label === "Alle" ? "" : row.label + ": ";
            line.textContent = label + row.periods.map(rangeText).join(" og ");
            li.appendChild(line);
            if (row.note) li.appendChild(el("p", "xt-sub", row.note));
            if (row.extra) li.appendChild(el("p", "xt-sub", row.extra));
          });
          r.s.notes.forEach(function (n) { li.appendChild(el("p", "xt-sub", n)); });
          if (!ch[pickerFor(r.s.id)]) r.s.regionalNotes.forEach(function (n) { li.appendChild(el("p", "xt-sub", "Lokale regler: " + n)); });
          if (pre && d.draft.species[r.s.id]) li.appendChild(el("p", "xt-sub xt-draft", d.draft.species[r.s.id] + " Tjek bekendtgørelsen."));
          ul.appendChild(li);
        });
        sec.appendChild(ul);
        results.appendChild(sec);
      });
    }

    function detail(kind, nodeId) {
      var a = areas[nodes[kind].value];
      document.getElementById(nodeId).textContent = a && a.detail ? a.detail : "";
    }

    input.addEventListener("input", render);
    nodes.small.addEventListener("change", render);
    nodes.kron.addEventListener("change", function () { detail("kron", "st-kron-detail"); render(); });
    nodes.daa.addEventListener("change", function () { detail("daa", "st-daa-detail"); render(); });
    render();
  }

  if (document.querySelector("[data-quiz]")) quiz(document.querySelector("[data-quiz]"));
  if (document.querySelector("[data-seasons]")) seasons();
})();
