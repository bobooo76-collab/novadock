(function () {
  var OFFSET = 130;
  var ticking = false;

  function update() {
    ticking = false;
    document.querySelectorAll(".toc").forEach(function (toc) {
      if (!toc.offsetParent) return;
      var links = toc.querySelectorAll("a[href^='#']");
      var current = null;
      links.forEach(function (a) {
        var target = document.getElementById(a.getAttribute("href").slice(1));
        if (target && target.getBoundingClientRect().top <= OFFSET) current = a;
      });
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && links.length) current = links[links.length - 1];
      if (!current && links.length) current = links[0];
      links.forEach(function (a) { a.classList.toggle("on", a === current); });
    });
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
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { setTimeout(request, 50); });
  });
  request();
})();
