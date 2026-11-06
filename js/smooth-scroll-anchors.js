/**
 * In-page anchor scroll with ease-in-out cubic timing, optional data-smooth-scroll on <a>.
 * Cancels on wheel / touchmove during animation. Respects prefers-reduced-motion.
 */
(function () {
  'use strict';

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function scrollMarginTopPx(el) {
    var raw = window.getComputedStyle(el).scrollMarginTop;
    var n = parseFloat(raw);
    return isNaN(n) ? 0 : n;
  }

  function targetScrollY(el) {
    var rect = el.getBoundingClientRect();
    return rect.top + window.pageYOffset - scrollMarginTopPx(el);
  }

  var rafId = 0;
  var cancelled = false;

  function stopAnimation() {
    if (rafId) {
      cancelled = true;
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  document.addEventListener(
    'wheel',
    function () {
      stopAnimation();
    },
    { passive: true, capture: true }
  );

  document.addEventListener(
    'touchmove',
    function () {
      stopAnimation();
    },
    { passive: true, capture: true }
  );

  document.addEventListener(
    'click',
    function (e) {
      var anchor = e.target.closest('a[data-smooth-scroll]');
      if (!anchor || !anchor.getAttribute('href')) return;

      var url;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch (err) {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.pathname !== window.location.pathname) return;
      if (!url.hash || url.hash.length < 2) return;

      var id = decodeURIComponent(url.hash.slice(1));
      var target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      var endY = targetScrollY(target);
      var hashUrl = url.pathname + url.search + url.hash;

      if (prefersReducedMotion()) {
        window.scrollTo(0, endY);
        history.pushState(null, '', hashUrl);
        try {
          target.focus({ preventScroll: true });
        } catch (err) {
          target.focus();
        }
        return;
      }

      var startY = window.pageYOffset;
      var dist = Math.abs(endY - startY);
      var duration = Math.min(1000, Math.max(600, 600 + (dist / 5000) * 400));

      stopAnimation();
      cancelled = false;

      var t0 = null;

      function step(now) {
        if (cancelled) {
          rafId = 0;
          return;
        }
        if (t0 === null) t0 = now;
        var elapsed = now - t0;
        var t = Math.min(1, elapsed / duration);
        var y = startY + (endY - startY) * easeInOutCubic(t);
        window.scrollTo(0, y);
        if (t < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          rafId = 0;
          window.scrollTo(0, endY);
          history.pushState(null, '', hashUrl);
          try {
            target.focus({ preventScroll: true });
          } catch (err) {
            target.focus();
          }
        }
      }

      rafId = requestAnimationFrame(step);
    },
    true
  );
})();
