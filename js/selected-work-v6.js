(function () {
  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  var cards = document.querySelectorAll('.work-card');
  if (!cards.length) return;

  if (reduce) {
    cards.forEach(function (card) {
      card.classList.add('is-visible');
      card.querySelectorAll('.work-card__reveal').forEach(function (el, i) {
        el.style.setProperty('--reveal-i', String(i + 1));
      });
    });
    return;
  }

  cards.forEach(function (card, cardIndex) {
    var reveals = card.querySelectorAll('.work-card__reveal');
    reveals.forEach(function (el, i) {
      el.style.setProperty('--reveal-i', String(i + 1));
    });
    var rowDelay = 0;
    if (card.classList.contains('work-card--col-right')) {
      rowDelay = 150;
    }
    card.style.setProperty('--row-delay', rowDelay + 'ms');
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var card = entry.target;
        if (card.dataset.workAnimated === 'true') return;
        card.dataset.workAnimated = 'true';
        card.classList.add('is-visible');
        observer.unobserve(card);
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -5% 0px' }
  );

  cards.forEach(function (card) {
    observer.observe(card);
  });
})();
