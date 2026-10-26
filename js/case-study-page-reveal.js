(function () {
  'use strict';

  var SKIP_ROOT =
    '.pos-ujm-strip, .hc-ujm-strip, .mob-journey-wrap, .proto-embed, .pos-affinity-wrap, .hero-video-wrap';

  function shouldSkipReveal(el) {
    if (!el || !el.classList) return false;
    if (el.classList.contains('reveal-media')) return true;
    if (el.classList.contains('hc-reveal-journey')) return true;
    if (el.closest(SKIP_ROOT)) return true;
    return false;
  }

  function revealAll() {
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('visible');
    });
    document.querySelectorAll('.reveal, .reveal-media').forEach(function (el) {
      el.classList.add('is-visible');
    });
    document.querySelectorAll('.wizard-steps').forEach(function (el) {
      el.classList.add('is-steps-visible');
    });
  }

  function initProtoPosters() {
    document.querySelectorAll('.proto-poster').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var frame = btn.closest('.proto-frame');
        var src = btn.getAttribute('data-embed');
        if (!frame || !src) return;
        var iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.title = btn.getAttribute('data-title') || 'Figma interactive prototype';
        iframe.setAttribute('allow', 'fullscreen');
        iframe.setAttribute('allowfullscreen', '');
        iframe.loading = 'lazy';
        frame.appendChild(iframe);
        btn.remove();
      });
    });
  }

  function initScrollReveal() {
    var reduce =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || !window.IntersectionObserver) {
      revealAll();
      return;
    }

    var seen = new Set();
    document.querySelectorAll('.fade-in, .reveal, .reveal-media').forEach(function (el) {
      if (seen.has(el)) return;
      seen.add(el);

      if (shouldSkipReveal(el)) {
        el.classList.add('is-visible');
        if (el.classList.contains('fade-in')) el.classList.add('visible');
        return;
      }

      var io = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var t = entry.target;
            if (t.classList.contains('fade-in')) t.classList.add('visible');
            if (t.classList.contains('reveal') || t.classList.contains('reveal-media')) {
              t.classList.add('is-visible');
            }
            obs.unobserve(t);
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
      );
      io.observe(el);
    });

    var ws = document.getElementById('hc-wizard-steps');
    if (ws) {
      var wio = new IntersectionObserver(
        function (entries, obs) {
          if (entries[0].isIntersecting) {
            ws.classList.add('is-steps-visible');
            obs.disconnect();
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );
      wio.observe(ws);
    }
  }

  initScrollReveal();
  initProtoPosters();
})();
