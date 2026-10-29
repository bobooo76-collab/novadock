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

  var canvas = document.querySelector(".trail");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  if (canvas && !reduce && !coarse && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var dots = [];
    var mx = 0, my = 0, lx = null, ly = null, speed = 0, lastMove = 0, running = false;
    var SPACING = 9;
    var OFFSET_X = 3;
    var OFFSET_Y = 20;
    var HOLD = 90;

    function fit() {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function tick() {
      var steps = 0;
      var moving = performance.now() - lastMove < HOLD;
      if (moving && lx !== null) {
        var dx = mx - lx, dy = my - ly;
        var dist = Math.sqrt(dx * dx + dy * dy);
        speed = speed * 0.7 + dist * 0.3;
        var count = Math.floor(dist / SPACING);
        for (var i = 1; i <= count; i++) {
          dots.push({ x: lx + dx * i / count, y: ly + dy * i / count });
        }
        if (count > 0) {
          lx = lx + dx * (count * SPACING / dist);
          ly = ly + dy * (count * SPACING / dist);
        }
        steps = count;
      } else {
        speed *= 0.8;
      }

      var limit = Math.max(3, Math.min(28, 3 + speed * 0.7));
      var extra = dots.length - limit;
      if (moving) {
        if (extra > 0) dots.splice(0, Math.min(extra, steps + 1));
      } else if (dots.length) {
        dots.splice(0, Math.max(1, Math.ceil(dots.length * 0.08)));
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.shadowColor = "rgba(10, 8, 40, 0.55)";
      ctx.shadowBlur = 9;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = "rgba(205, 215, 255, 0.45)";
      var n = dots.length;
      for (var j = 0; j < n; j++) {
        var t = (j + 1) / n;
        ctx.beginPath();
        ctx.arc(dots[j].x + OFFSET_X, dots[j].y + OFFSET_Y, 1.1 + t * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (n > 0 || speed > 0.2) {
        requestAnimationFrame(tick);
      } else {
        running = false;
        lx = null;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }

    window.addEventListener("resize", fit);
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (lx === null) {
        lx = mx;
        ly = my;
      }
      lastMove = performance.now();
      if (!running) {
        running = true;
        requestAnimationFrame(tick);
      }
    }, { passive: true });
    document.addEventListener("mouseleave", function () { lastMove = 0; });
    fit();
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
