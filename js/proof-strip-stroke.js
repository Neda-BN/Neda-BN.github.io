(function () {
  'use strict';

  var links = document.querySelectorAll('.proof-strip__link');
  if (!links.length) return;

  var RADIUS = 16;

  links.forEach(function (link) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('proof-strip__stroke');
    svg.setAttribute('aria-hidden', 'true');

    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.classList.add('proof-stat-stroke');
    rect.setAttribute('pathLength', '1');
    svg.appendChild(rect);
    link.insertBefore(svg, link.firstChild);

    function layout() {
      var w = link.clientWidth;
      var h = link.clientHeight;
      if (w < 2 || h < 2) return;

      svg.setAttribute('width', String(w));
      svg.setAttribute('height', String(h));
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);

      rect.setAttribute('x', '0.5');
      rect.setAttribute('y', '0.5');
      rect.setAttribute('width', String(w - 1));
      rect.setAttribute('height', String(h - 1));

      var r = RADIUS - 0.5;
      rect.setAttribute('rx', String(r));
      rect.setAttribute('ry', String(r));
    }

    layout();

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(function () {
        layout();
      }).observe(link);
    } else {
      window.addEventListener('resize', layout);
    }
  });
})();
