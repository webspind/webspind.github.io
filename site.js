// Webspind v2 — small progressive-enhancement behaviours.
// No framework, no build step: plain DOM APIs only.
(function () {
  "use strict";

  var de = document.documentElement;

  // ---- language: Danish tree at "/", English tree at "/en/".
  // A stored choice always wins and redirects either direction. With no
  // stored choice, an explicit URL is trusted: we only auto-redirect a
  // Danish-tree visitor to /en when the browser language isn't Danish —
  // we never bounce someone off /en based on browser language alone.
  // Pages with no twin (the Danish-only policy, the bilingual 404) carry
  // data-nolang and are left alone — redirecting the 404 would bounce,
  // because GitHub Pages serves it under the URL that was asked for.
  var LS_KEY = "webspindLang";

  function storedLang() {
    try { return localStorage.getItem(LS_KEY); } catch (e) { return null; }
  }
  function storeLang(v) {
    try { localStorage.setItem(LS_KEY, v); } catch (e) {}
  }

  if (!de.hasAttribute("data-nolang")) {
    var path = location.pathname;
    var inEn = path === "/en" || path.indexOf("/en/") === 0;
    var pref = storedLang();
    var target = null;
    if (pref === "en" || pref === "da") {
      if (pref === "en" && !inEn) target = "/en" + path;
      else if (pref === "da" && inEn) target = path.slice(3) || "/";
    } else if (!inEn) {
      var browserIsDa = String(navigator.language || "").toLowerCase().indexOf("da") === 0;
      if (!browserIsDa) target = "/en" + path;
    }
    // Only ever move between the two trees, and never to where we already are.
    if (target && target !== path) {
      location.replace(target + location.search + location.hash);
      return;
    }
  }

  // Clicking DA or EN in the header stores the choice, then follows the link.
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("[data-lang]") : null;
    if (a) storeLang(a.getAttribute("data-lang"));
  });

  de.setAttribute("data-js-reveal", "");

  var io = null;
  function reveal(el) {
    el.classList.add("rv-in");
    if (io) io.unobserve(el);
  }
  function observe() {
    if (!io) {
      io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting || e.boundingClientRect.bottom < 0) reveal(e.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
    }
    requestAnimationFrame(function () {
      document.querySelectorAll(".rv:not(.rv-in)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) reveal(el);
        else io.observe(el);
      });
    });
  }
  // Safety net: never leave content invisible if IO or rAF misbehave.
  setTimeout(function () {
    document.querySelectorAll(".rv:not(.rv-in)").forEach(reveal);
  }, 2500);

  function onScroll() {
    var b = document.body;
    var y = window.scrollY || de.scrollTop || b.scrollTop || 0;
    var h = Math.max(de.scrollHeight, b.scrollHeight) - window.innerHeight;
    var bar = document.querySelector("[data-progress]");
    if (bar) bar.style.width = (h > 0 ? Math.min(100, Math.max(0, (y / h) * 100)) : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  observe();
  onScroll();

  // Support page: build a mailto: link from the form fields instead of
  // sending anything — there is no server behind this site.
  var mailBtn = document.querySelector("[data-send-mail]");
  if (mailBtn) {
    mailBtn.addEventListener("click", function () {
      var isDa = de.lang !== "en";
      var subjectEl = document.querySelector("[data-field-subject]");
      var emailEl = document.querySelector("[data-field-email]");
      var bodyEl = document.querySelector("[data-field-body]");
      // The placeholder option has an empty value, so this works in either
      // language without matching on the label text.
      var subjectVal = subjectEl && subjectEl.value ? subjectEl.value : "Support — Jagtprøven";
      var replyLabel = isDa ? "\n\nSvar til: " : "\n\nReply to: ";
      var bodyVal = (bodyEl && bodyEl.value ? bodyEl.value : "") +
                    (emailEl && emailEl.value ? replyLabel + emailEl.value : "");
      window.location.href = "mailto:support@webspind.com?subject=" +
        encodeURIComponent(subjectVal) + "&body=" + encodeURIComponent(bodyVal);
    });
  }
})();
