(function () {
  if (!document.body.classList.contains("editorial-case")) return;

  var main = document.querySelector("main.sb-case");
  if (!main) return;

  var progress = document.querySelector(".ed-reading-progress");
  var rail = document.querySelector(".ed-section-rail");
  var sections = Array.prototype.slice.call(
    main.querySelectorAll(".ed-main-section")
  );

  function updateProgress() {
    if (!progress) return;
    var el = document.documentElement;
    var max = el.scrollHeight - el.clientHeight;
    var pct = max > 0 ? (el.scrollTop / max) * 100 : 0;
    progress.style.width = pct + "%";
  }

  function setActiveSection(id) {
    if (!rail) return;
    rail.querySelectorAll("[data-section]").forEach(function (link) {
      var on = link.getAttribute("data-section") === id;
      link.classList.toggle("is-active", on);
      if (on) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  if (rail) {
    rail.addEventListener("click", function (e) {
      var link = e.target.closest("a[data-section]");
      if (!link) return;
      var id = link.getAttribute("data-section");
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (sections.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute("data-ed-section-id"));
          }
        });
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  if ("IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll(".ed-section-opener, .ed-pull");
    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    revealEls.forEach(function (el) {
      revealObs.observe(el);
    });
  } else {
    document.querySelectorAll(".ed-section-opener, .ed-pull").forEach(function (el) {
      el.classList.add("is-revealed");
    });
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();
})();
