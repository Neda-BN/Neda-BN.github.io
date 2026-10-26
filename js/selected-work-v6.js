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
    { threshold: 0, rootMargin: '0px 0px -10% 0px' }
  );

  cards.forEach(function (card) {
    if (card.dataset.workAnimated !== 'true') observer.observe(card);
  });

  setTimeout(function () {
    cards.forEach(function (card) {
      if (card.dataset.workAnimated !== 'true' && cardInView(card)) showCard(card);
    });
  }, 2000);
})();
