// Keeps a visitor at the same place when they switch language. Before leaving, it
// records the section or card at the top of the viewport and the position inside it;
// on the other language's page it scrolls that same element back into place.
// Used by every page on webspind.com, including /pdf/. Stores nothing beyond one
// short-lived sessionStorage entry for the switch.
(function () {
  "use strict";
  var KEY = "wsLangKeep", de = document.documentElement;
  var MAX_AGE = 20000;

  function norm(path) { return path.replace(/index\.html$/, ""); }
  function headerLine() {
    var h = document.querySelector(".site-header");
    return (h ? Math.max(0, h.getBoundingClientRect().bottom) : 0) + 4;
  }
  function anchors() {
    var nodes = document.querySelectorAll("main [id], main section, main article, main .ttile, main h1, main h2, main h3");
    return [].filter.call(nodes, function (n) { return n.id !== "main" && n.offsetParent !== null; });
  }
  // What a heading, section, article or card is called when it has no id.
  function kindOf(n) {
    if (n.matches(".ttile")) return ".ttile";
    if (n.matches("h1,h2,h3")) return "h1,h2,h3";
    return n.tagName.toLowerCase();
  }
  function describe(n) {
    if (n.id) return { id: n.id };
    var kind = kindOf(n), list = [].slice.call(document.querySelectorAll("main " + kind.split(",").join(", main ")));
    return { kind: kind, i: list.indexOf(n), n: list.length };
  }
  function resolve(a) {
    if (a.id) return document.getElementById(a.id);
    var list = document.querySelectorAll("main " + a.kind.split(",").join(", main "));
    return list.length === a.n ? list[a.i] : null;
  }

  function save(toUrl) {
    var to;
    try { to = norm(new URL(toUrl, location.href).pathname); } catch (e) { return; }
    var y = window.pageYOffset || 0;
    if (y < 8) return;
    var line = headerLine(), chain = [];
    anchors().forEach(function (n) {
      var r = n.getBoundingClientRect();
      if (r.top <= line && r.bottom > line && r.height) chain.push({ a: describe(n), r: (line - r.top) / r.height });
    });
    chain = chain.reverse().slice(0, 5);
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    try { sessionStorage.setItem(KEY, JSON.stringify({ to: to, ts: Date.now(), chain: chain, p: y / max })); } catch (e) {}
  }

  // Header switch on paired pages.
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[data-keep]") : null;
    if (a) save(a.href);
  }, true);
  // Language picker on /pdf/ pages.
  document.addEventListener("change", function (e) {
    if (e.target && e.target.matches && e.target.matches(".lang-pick select")) save(e.target.value);
  }, true);

  var raw = null;
  try { raw = sessionStorage.getItem(KEY); if (raw) sessionStorage.removeItem(KEY); } catch (e) {}
  if (!raw) return;
  var state;
  try { state = JSON.parse(raw); } catch (e) { return; }
  if (!state || Date.now() - state.ts > MAX_AGE || state.to !== norm(location.pathname)) return;

  de.setAttribute("data-lang-keep", "");
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  var active = true, oldBehavior = de.style.scrollBehavior;
  function place() {
    if (!active) return;
    de.style.scrollBehavior = "auto";
    var y = null, line = headerLine();
    for (var i = 0; i < state.chain.length && y === null; i++) {
      var el = resolve(state.chain[i].a);
      if (el && el.offsetParent !== null) {
        var r = el.getBoundingClientRect();
        if (r.height) y = window.pageYOffset + r.top + state.chain[i].r * r.height - line;
      }
    }
    if (y === null) {
      y = state.p * Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    }
    window.scrollTo(0, Math.max(0, y));
  }
  function stop() {
    active = false;
    de.style.scrollBehavior = oldBehavior;
  }
  place();
  ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (t) {
    window.addEventListener(t, stop, { passive: true, once: true });
  });
  // Web fonts and images can shift things; settle once more while nobody has touched the page.
  window.addEventListener("load", function () { place(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  setTimeout(function () { place(); stop(); }, 1200);
})();
