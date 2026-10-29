(function () {
  var DEFAULT_LANG = "en";
  var KEY = "novadock-lang";

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function remember(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) { }
  }

  function apply(lang) {
    var dict = (window.I18N || {})[lang];
    if (!dict) return;

    document.documentElement.lang = lang;
    document.title = dict["meta.title"] || document.title;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = dict[el.getAttribute("data-i18n")];
      if (value !== undefined) el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var value = dict[el.getAttribute("data-i18n-html")];
      if (value !== undefined) el.innerHTML = value;
    });

    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var value = dict[el.getAttribute("data-i18n-alt")];
      if (value !== undefined) el.setAttribute("alt", value);
    });

    document.querySelectorAll(".lang button").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-lang") === lang);
    });

    remember(lang);
  }

  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { apply(b.getAttribute("data-lang")); });
  });

  var initial = stored();
  if (!window.I18N || !window.I18N[initial]) initial = DEFAULT_LANG;
  apply(initial);

  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { observer.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
