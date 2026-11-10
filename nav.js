// The header menus: Apps and Tools drop-downs, and one panel on phone width.
// Opens on click or tap, and on hover where the device has a real pointer.
(function () {
  "use strict";
  var header = document.querySelector(".site-header");
  if (!header || !header.querySelector(".nav-panel")) return;
  var toggle = header.querySelector(".nav-toggle");
  var dds = [].slice.call(header.querySelectorAll(".nav-dd"));
  var phone = window.matchMedia("(max-width: 820px)");
  var hoverable = window.matchMedia("(hover: hover) and (pointer: fine)");

  function btn(dd) { return dd.querySelector(".nav-btn"); }
  function links(dd) { return [].slice.call(dd.querySelectorAll(".nav-drop a")); }
  function isOpen(dd) { return dd.classList.contains("open"); }
  function setOpen(dd, on) {
    dd.classList.toggle("open", on);
    btn(dd).setAttribute("aria-expanded", on ? "true" : "false");
    if (!on) { dd.removeAttribute("data-pin"); dd.removeAttribute("data-hover"); }
  }
  function closeAll(except) { dds.forEach(function (d) { if (d !== except) setOpen(d, false); }); }
  function setPanel(on) {
    header.classList.toggle("menu-open", on);
    toggle.setAttribute("aria-expanded", on ? "true" : "false");
    closeAll();
    if (on) dds.forEach(function (d) { setOpen(d, true); });
  }

  toggle.addEventListener("click", function () { setPanel(!header.classList.contains("menu-open")); });

  dds.forEach(function (dd) {
    btn(dd).addEventListener("click", function () {
      if (phone.matches) { setOpen(dd, !isOpen(dd)); return; }
      if (isOpen(dd) && dd.hasAttribute("data-hover") && !dd.hasAttribute("data-pin")) {
        dd.setAttribute("data-pin", "");
        return;
      }
      var opening = !isOpen(dd);
      closeAll(dd);
      setOpen(dd, opening);
      if (opening) dd.setAttribute("data-pin", "");
    });
    dd.addEventListener("mouseenter", function () {
      if (phone.matches || !hoverable.matches || isOpen(dd)) return;
      closeAll(dd);
      setOpen(dd, true);
      dd.setAttribute("data-hover", "");
    });
    dd.addEventListener("mouseleave", function () {
      if (!phone.matches && dd.hasAttribute("data-hover") && !dd.hasAttribute("data-pin")) setOpen(dd, false);
    });
    dd.addEventListener("focusout", function (e) {
      if (!phone.matches && e.relatedTarget && !dd.contains(e.relatedTarget)) setOpen(dd, false);
    });
    dd.addEventListener("keydown", function (e) {
      var list = links(dd), i = list.indexOf(document.activeElement);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen(dd)) { closeAll(dd); setOpen(dd, true); dd.setAttribute("data-pin", ""); }
        var next = i < 0 ? 0 : (i + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
        list[next].focus();
      }
    });
  });

  // Choosing a link closes everything; the browser follows it as usual.
  header.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".nav-drop a, .nav-panel > a")) {
      if (phone.matches) setPanel(false); else closeAll();
    }
  });
  document.addEventListener("click", function (e) {
    if (!header.contains(e.target)) { closeAll(); if (phone.matches) setPanel(false); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var open = dds.filter(isOpen)[0];
    if (phone.matches && header.classList.contains("menu-open")) { setPanel(false); toggle.focus(); return; }
    if (open) { var b = btn(open); closeAll(); b.focus(); }
  });
  phone.addEventListener("change", function () { setPanel(false); });
})();
