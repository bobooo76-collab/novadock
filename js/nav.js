(function () {
  var nav = document.querySelector("nav.top");
  if (!nav) return;
  var bar = nav.querySelector(".progress");
  var links = Array.prototype.slice.call(nav.querySelectorAll(".links a"));
  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  var ticking = false;

  var spy = [];
  links.forEach(function (a) {
    var href = a.getAttribute("href") || "";
    var file = href.split("#")[0].toLowerCase();
    var hash = href.indexOf("#") >= 0 ? href.split("#")[1] : "";
    if (file === "" || file === page) {
      var target = hash ? document.getElementById(hash) : null;
      if (target) spy.push({ a: a, el: target });
    }
    if (file === page && !hash) a.classList.add("on");
  });

  function update() {
    ticking = false;
    var y = window.scrollY || 0;
    nav.classList.toggle("scrolled", y > 24);

    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    }

    if (spy.length) {
      var current = null;
      spy.forEach(function (s) {
        if (s.el.getBoundingClientRect().top <= 140) current = s.a;
      });
      var atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 4;
      if (atBottom) current = spy[spy.length - 1].a;
      spy.forEach(function (s) { s.a.classList.toggle("on", s.a === current); });
    }
  }

  function request() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  window.addEventListener("load", request);
  request();
})();
