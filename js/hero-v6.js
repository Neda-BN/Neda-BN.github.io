(function () {
  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  var items = document.querySelectorAll('.hero-v6__reveal');
  if (!items.length) return;

  if (reduce) {
    items.forEach(function (el) {
      el.classList.add('is-in');
    });
    return;
  }

  items.forEach(function (el, i) {
    window.setTimeout(function () {
      el.classList.add('is-in');
    }, i * 120);
  });
})();
