/* Runwise — site script. No third-party code, no network calls, no tracking. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile menu ---------- */
  var mb = document.getElementById("menu-btn"), nl = document.getElementById("nav-links");
  if (mb && nl) {
    mb.addEventListener("click", function () {
      var open = nl.classList.toggle("open");
      mb.setAttribute("aria-expanded", String(open));
    });
    nl.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nl.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nl.classList.contains("open")) { nl.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); mb.focus(); }
    });
  }

  /* ---------- Data-driven sizes (CSP forbids inline style attributes) ---------- */
  document.querySelectorAll("[data-h]").forEach(function (el) { el.style.setProperty("--h", el.dataset.h); });

  /* ---------- Scroll reveal ---------- */
  var rv = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- Glass spotlight follows pointer ---------- */
  document.querySelectorAll(".spot").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--sx", e.clientX - r.left + "px");
      el.style.setProperty("--sy", e.clientY - r.top + "px");
    });
  });

  /* ---------- Pricing toggle ---------- */
  var billing = "yearly";
  var tg = document.querySelectorAll("[data-billing]");
  function setBilling(b) {
    billing = b;
    tg.forEach(function (btn) { btn.setAttribute("aria-pressed", String(btn.dataset.billing === b)); });
    document.querySelectorAll(".price[data-m]").forEach(function (el) {
      var m = Number(el.dataset.m), y = Number(el.dataset.y);
      var amt = el.querySelector(".amt"), per = el.querySelector(".per");
      amt.textContent = "₹" + (b === "yearly" ? y : m).toLocaleString("en-IN");
      per.textContent = b === "yearly" ? "/ year" : "/ month";
    });
    document.querySelectorAll("[data-billed]").forEach(function (el) {
      var m = Number(el.dataset.m), y = Number(el.dataset.y);
      el.innerHTML = b === "yearly"
        ? "<b>2 months free.</b> Pay for 10, get 12 (saves ₹" + (m * 12 - y).toLocaleString("en-IN") + ")."
        : "Billed monthly. Switch to yearly and get 2 months free.";
    });
    document.querySelectorAll("[data-renew]").forEach(function (el) {
      var y = Number(el.dataset.y), m = Number(el.dataset.m);
      el.textContent = b === "yearly"
        ? "Renews automatically every year at ₹" + y.toLocaleString("en-IN") + " until you cancel. Cancel anytime from WhatsApp."
        : "Renews automatically every month at ₹" + m.toLocaleString("en-IN") + " until you cancel. Cancel anytime from WhatsApp.";
    });
    var sb = document.getElementById("billing-" + b); if (sb) sb.checked = true;
  }
  tg.forEach(function (btn) { btn.addEventListener("click", function () { setBilling(btn.dataset.billing); }); });
  if (tg.length) setBilling("yearly");

  /* Plan buttons preselect the plan in the form */
  document.querySelectorAll("[data-plan]").forEach(function (a) {
    a.addEventListener("click", function () {
      var sel = document.getElementById("plan"); if (sel) sel.value = a.dataset.plan;
      var sb = document.getElementById("billing-" + billing); if (sb) sb.checked = true;
    });
  });

  /* ---------- Signup form (DEMO: validates, sends nothing) ---------- */
  var form = document.getElementById("signup-form");
  if (form) {
    var msg = document.getElementById("form-msg");
    function fieldWrap(el) { return el.closest(".field") || el.closest(".check"); }
    function validate() {
      var ok = true, first = null;
      form.querySelectorAll("[required]").forEach(function (el) {
        var valid = el.type === "checkbox" ? el.checked : el.checkValidity() && el.value.trim() !== "";
        if (el.id === "phone" && valid) valid = /^[+]?[0-9 ()-]{8,18}$/.test(el.value.trim());
        var w = fieldWrap(el);
        if (w) w.classList.toggle("invalid", !valid);
        el.setAttribute("aria-invalid", String(!valid));
        if (!valid) { ok = false; if (!first) first = el; }
      });
      if (first) first.focus();
      return ok;
    }
    form.addEventListener("input", function (e) {
      var w = fieldWrap(e.target); if (w && w.classList.contains("invalid")) { w.classList.remove("invalid"); e.target.setAttribute("aria-invalid", "false"); }
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.className = "form-msg"; msg.textContent = "";
      if (form.elements["website"] && form.elements["website"].value) return; // honeypot
      if (!validate()) {
        msg.className = "form-msg show bad";
        msg.textContent = "Please fix the highlighted fields and try again.";
        return;
      }
      // TODO(backend): POST to a server endpoint (with rate limiting + server-side validation). Nothing is sent today.
      msg.className = "form-msg show ok";
      msg.textContent = "Thanks! This is a preview form, so nothing was sent or saved yet. Early-access signups open soon. To reach us right now, message us on WhatsApp or email.";
      form.reset(); setBilling(billing);
    });
  }

  /* ---------- Cookie notice (stores one preference in localStorage) ---------- */
  var KEY = "runwise_cookie_choice", banner = document.getElementById("cookie");
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function loadOptional() {
    // Analytics/third-party scripts must only ever be loaded from here, after "accepted".
    // None are used today.
  }
  if (banner) {
    var c = read();
    if (!c) banner.classList.add("show"); else if (c === "accepted") loadOptional();
    banner.addEventListener("click", function (e) {
      var a = e.target.closest("[data-cookie]"); if (!a) return;
      write(a.dataset.cookie); banner.classList.remove("show");
      if (a.dataset.cookie === "accepted") loadOptional();
    });
  }
  var reopen = document.getElementById("cookie-settings");
  if (reopen && banner) reopen.addEventListener("click", function (e) { e.preventDefault(); banner.classList.add("show"); banner.querySelector("button").focus(); });
})();
