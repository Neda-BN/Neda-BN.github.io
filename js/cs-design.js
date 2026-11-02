(function () {
  if (
    !document.body.classList.contains("cs-design-page") &&
    !document.body.classList.contains("sb-design-page")
  ) {
    return;
  }

  var progress = document.querySelector(".cs-read-progress, .sb-read-progress");
  var processFrame = document.querySelector(".cs-process-frame, .sb-process-frame");
  var processSection = document.querySelector('section[aria-labelledby="how-i-worked"]');
  var glance = document.querySelector(".cs-glance, .sb-glance");

  function updateProgress() {
    if (!progress) return;
    var el = document.documentElement;
    var max = el.scrollHeight - el.clientHeight;
    var pct = max > 0 ? (el.scrollTop / max) * 100 : 0;
    progress.style.width = pct + "%";
  }

  function advanceProcessBar() {
    if (!processFrame) return;
    processFrame.classList.add("is-advanced");
  }

  if (processSection && processFrame && "IntersectionObserver" in window) {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      advanceProcessBar();
    } else {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              advanceProcessBar();
              obs.disconnect();
            }
          });
        },
        { threshold: 0.2 }
      );
      obs.observe(processSection);
    }
  }

  function showGlanceStatus() {
    if (!glance) return;
    glance.classList.add("is-status-visible");
  }

  if (glance && "IntersectionObserver" in window) {
    var reducedGlance = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedGlance) {
      showGlanceStatus();
    } else {
      var glanceObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              showGlanceStatus();
              glanceObs.disconnect();
            }
          });
        },
        { threshold: 0.25 }
      );
      glanceObs.observe(glance);
    }
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();
})();
