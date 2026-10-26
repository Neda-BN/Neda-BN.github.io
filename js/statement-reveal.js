(function () {
  'use strict';

  var p = document.querySelector('#statement .statement');
  if (!p) return;

  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  if (reduce) return;

  var raw = p.textContent;
  p.textContent = '';

  var parts = raw.split(/(\s+)/);
  var words = [];

  parts.forEach(function (part) {
    if (!part) return;
    if (/^\s+$/.test(part)) {
      p.appendChild(document.createTextNode(part));
      return;
    }
    var span = document.createElement('span');
    span.className = 'w';
    span.textContent = part;
    p.appendChild(span);
    words.push(span);
  });

  var totalWords = words.length;
  if (!totalWords) return;

  p.classList.add('is-ready');

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function update() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var r = p.getBoundingClientRect();
    var progress = clamp((0.8 * vh - r.top) / (0.35 * vh + r.height), 0, 1);
    var litCount = Math.round(progress * totalWords);

    for (var i = 0; i < totalWords; i++) {
      if (i < litCount) words[i].classList.add('is-lit');
      else words[i].classList.remove('is-lit');
    }
  }

  var ticking = false;
  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      update();
    });
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  update();
})();
