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
    var SPACING = 14;
    var OFFSET_X = 0;
    var OFFSET_Y = 0;
    var HOLD = 90;
    var FADE = 6;
    var path = [];
    var shown = 0;
    var speed = 0;
    var accum = 0;
    var lastMove = 0;
    var lastReal = null;
    var prevT = 0;
    var vx = 0;
    var vy = 0;
    var LEAD = 30;
    var running = false;

    function fit() {
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function trim(maxLength) {
      var total = 0;
      for (var i = path.length - 1; i > 0; i--) {
        total += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
        if (total > maxLength) {
          path.splice(0, i - 1);
          return;
        }
      }
    }

    function pointAt(distance) {
      var remaining = distance;
      for (var i = path.length - 1; i > 0; i--) {
        var a = path[i], b = path[i - 1];
        var seg = Math.hypot(a.x - b.x, a.y - b.y);
        if (remaining <= seg) {
          var t = seg === 0 ? 0 : remaining / seg;
          return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        }
        remaining -= seg;
      }
      return null;
    }

    function tick() {
      var moving = performance.now() - lastMove < HOLD;
      if (!moving && lastReal && path.length) {
        path[path.length - 1] = { x: lastReal.x, y: lastReal.y };
      }
      speed = speed * 0.7 + accum * 0.3;
      accum = 0;

      var target = Math.max(3, Math.min(20, 3 + speed * 0.5));
      if (moving) {
        shown += (target - shown) * 0.25;
      } else {
        shown -= Math.max(0.3, shown * 0.1);
        if (shown < 0) shown = 0;
      }

      var count = Math.floor(shown + 0.5);
      trim((count + 2) * SPACING);

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (count > 0 && path.length > 0) {
        ctx.shadowColor = "rgba(10, 8, 40, 0.55)";
        ctx.shadowBlur = 9;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = "rgba(205, 215, 255, 0.45)";
        for (var k = 0; k < count; k++) {
          var p = k === 0 ? path[path.length - 1] : pointAt(k * SPACING);
          if (!p) break;
          var fromTail = count - 1 - k;
          ctx.globalAlpha = fromTail < FADE ? (fromTail + 1) / (FADE + 1) : 1;
          ctx.beginPath();
          ctx.arc(p.x + OFFSET_X, p.y + OFFSET_Y, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (moving || count > 0) {
        requestAnimationFrame(tick);
      } else {
        running = false;
        path = [];
        shown = 0;
      }
    }

    window.addEventListener("resize", fit);
    window.addEventListener("pointermove", function (e) {
      var now = performance.now();
      var dt = Math.max(1, now - prevT);
      if (lastReal && dt < 120) {
        vx = vx * 0.6 + ((e.clientX - lastReal.x) / dt) * 0.4;
        vy = vy * 0.6 + ((e.clientY - lastReal.y) / dt) * 0.4;
      } else {
        vx = 0;
        vy = 0;
      }
      prevT = now;
      var d0 = lastReal ? Math.hypot(e.clientX - lastReal.x, e.clientY - lastReal.y) : 0;
      lastReal = { x: e.clientX, y: e.clientY };

      var ax = vx * LEAD, ay = vy * LEAD;
      var al = Math.hypot(ax, ay);
      if (al > 40) {
        ax = ax * 40 / al;
        ay = ay * 40 / al;
      }
      var px = e.clientX + ax, py = e.clientY + ay;

      var last = path.length ? path[path.length - 1] : null;
      if (last) {
        var d = Math.hypot(px - last.x, py - last.y);
        if (d < 1) return;
        accum += d0 || d;
      }
      path.push({ x: px, y: py });
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
