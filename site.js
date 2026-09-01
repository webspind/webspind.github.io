// Webspind v2 — small progressive-enhancement behaviours.
// No framework, no build step: plain DOM APIs only.
(function () {
  "use strict";

  document.documentElement.setAttribute("data-js-reveal", "");

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
    var de = document.documentElement, b = document.body;
    var y = window.scrollY || de.scrollTop || b.scrollTop || 0;
    var h = Math.max(de.scrollHeight, b.scrollHeight) - window.innerHeight;
    var bar = document.querySelector("[data-progress]");
    var par = document.querySelector("[data-parallax]");
    if (bar) bar.style.width = (h > 0 ? Math.min(100, Math.max(0, (y / h) * 100)) : 0) + "%";
    if (par) par.style.transform = "translate3d(0," + (y * 0.18).toFixed(1) + "px,0)";
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
      var subjectEl = document.querySelector("[data-field-subject]");
      var emailEl = document.querySelector("[data-field-email]");
      var bodyEl = document.querySelector("[data-field-body]");
      var subjectVal = subjectEl && subjectEl.value && subjectEl.value !== "Vælg…" ? subjectEl.value : "Support — Jagtprøven";
      var bodyVal = (bodyEl && bodyEl.value ? bodyEl.value : "") + (emailEl && emailEl.value ? "\n\nSvar til: " + emailEl.value : "");
      window.location.href = "mailto:support@webspind.com?subject=" + encodeURIComponent(subjectVal) + "&body=" + encodeURIComponent(bodyVal);
    });
  }
})();
