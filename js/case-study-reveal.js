(function () {
  var root = document.querySelector('.sb-case');
  if (!root) return;

  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  var targets = root.querySelectorAll(
    '.sb-hero-img, .sb-section, .sb-compare figure, .sb-ds-sheet, .sb-tldr'
  );

  if (reduce) {
    targets.forEach(function (el) {
      el.classList.add('cs-reveal', 'is-visible');
    });
    return;
  }

  targets.forEach(function (el) {
    el.classList.add('cs-reveal');
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.dataset.csRevealed === 'true') return;
        el.dataset.csRevealed = 'true';
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -4% 0px' }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();
