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

  function revealOrder(el) {
    if (el.classList.contains('work-card__media')) return 1;
    if (el.classList.contains('work-card__meta')) return 2;
    if (el.classList.contains('work-card__title')) return 3;
    if (el.classList.contains('work-card__role')) return 4;
    if (el.classList.contains('work-card__desc')) return 5;
    if (el.classList.contains('work-card__link')) return 6;
    return 99;
  }

  cards.forEach(function (card) {
    var reveals = card.querySelectorAll('.work-card__reveal');
    reveals.forEach(function (el) {
      el.style.setProperty('--reveal-i', String(revealOrder(el)));
    });
    var rowDelay = 0;
    if (card.classList.contains('work-card--col-right')) {
      rowDelay = 80;
    }
    card.style.setProperty('--row-delay', rowDelay + 'ms');
  });

  function cardInView(card) {
    var rect = card.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.bottom > 0 && rect.top < vh;
  }

  function showCard(card) {
    if (card.dataset.workAnimated === 'true') return;
    card.dataset.workAnimated = 'true';
    card.classList.add('is-visible');
  }

  cards.forEach(function (card) {
    if (cardInView(card)) showCard(card);
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        showCard(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0, rootMargin: '0px 0px -5% 0px' }
  );

  cards.forEach(function (card) {
    if (card.dataset.workAnimated !== 'true') observer.observe(card);
  });

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      cards.forEach(function (card) {
        if (card.dataset.workAnimated !== 'true' && cardInView(card)) showCard(card);
      });
    });
  });
})();
