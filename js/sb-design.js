(function () {
  if (!document.body.classList.contains("sb-design-page")) return;

  var progress = document.querySelector(".sb-read-progress");
  var processFrame = document.querySelector(".sb-process-frame");
  var processSection = document.querySelector('section[aria-labelledby="how-i-worked"]');

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

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();
})();
