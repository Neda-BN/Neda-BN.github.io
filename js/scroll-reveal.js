(function () {
  'use strict';

  var REVEAL = 'reveal';
  var CS = 'cs-reveal';
  var VISIBLE = 'is-visible';
  var FADE_VISIBLE = 'visible';
  var IO_OPTS = { threshold: 0, rootMargin: '0px 0px -10% 0px' };

  function reducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function markVisible(el) {
    if (el.classList.contains('fade-in')) el.classList.add(FADE_VISIBLE);
    el.classList.add(VISIBLE);
  }

  function isStillHidden(el) {
    if (el.classList.contains(CS) || el.classList.contains(REVEAL)) {
      return !el.classList.contains(VISIBLE);
    }
    if (el.classList.contains('fade-in')) return !el.classList.contains(FADE_VISIBLE);
    return false;
  }

  function anyPartInViewport(el) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.bottom > 0 && rect.top < vh;
  }

  function revealIfInView(nodes) {
    nodes.forEach(function (el) {
      if (isStillHidden(el) && anyPartInViewport(el)) markVisible(el);
    });
  }

  function shouldNotObserve(el) {
    if (el.closest('.sb-compare .sb-scroll-x') && !el.matches('figure')) return true;
    return false;
  }

  function demoteLargeWrappers() {
    document.querySelectorAll('section.reveal, section.fade-in').forEach(function (sec) {
      sec.classList.remove(REVEAL, 'fade-in', 'reveal-media');

      sec.querySelectorAll(
        ':scope > .section-header, :scope > p, :scope > .role-block, :scope > .hc-tldr, :scope > .bo-tldr, :scope > .mob-tldr, :scope > .pos-tldr, :scope > .hc-methods-persona, :scope > .persona-block, :scope > .pain-grid, :scope > .findings-list, :scope > .lessons-list, :scope > .process-steps, :scope > .quote-block, :scope > .wizard-steps, :scope > .results-grid, :scope > .screens-section, :scope > .proto-embed, :scope > .mob-journey-wrap, :scope > .pos-ujm-strip, :scope > .hc-ujm-strip, :scope > .hc-reveal-journey, :scope > .reveal-media, :scope > figure, :scope > .case-study-figure'
      ).forEach(function (child) {
        if (child.matches('.screens-section, .reveal-media, .hc-reveal-journey, .proto-embed, .mob-journey-wrap, .pos-ujm-strip, .hc-ujm-strip')) {
          child.classList.remove(REVEAL, 'fade-in', 'reveal-media');
          child.querySelectorAll('.section-header, .screen-item, .screen-wrap, figure, .screens-grid > *, p').forEach(function (inner) {
            if (!inner.closest('.pos-ujm-chart-scroll, .hc-ujm-chart-scroll')) inner.classList.add(REVEAL);
          });
        } else {
          child.classList.add(REVEAL);
        }
      });
    });

    document.querySelectorAll('.hero-image.reveal, .hero-image.fade-in, .hero-image.reveal-media').forEach(function (hero) {
      hero.classList.remove(REVEAL, 'fade-in', 'reveal-media');
      var fig = hero.querySelector('figure');
      if (fig) fig.classList.add(REVEAL);
      else {
        var img = hero.querySelector('.case-hero-img, picture, img');
        if (img) (img.closest('figure') || img).classList.add(REVEAL);
      }
    });

    document.querySelectorAll('.screens-section.reveal, .screens-section.fade-in, .screens-section.reveal-media').forEach(function (block) {
      if (block.closest('section')) return;
      block.classList.remove(REVEAL, 'fade-in', 'reveal-media');
      block.querySelectorAll('.screen-item, .screen-wrap, figure').forEach(function (c) {
        c.classList.add(REVEAL);
      });
    });
  }

  function initSimpleBooking() {
    var root = document.querySelector('.sb-case');
    if (!root) return;

    var sel = [
      '.sb-hero-img',
      '.sb-tldr',
      '.sb-ds-sheet',
      '.sb-section .section-header',
      '.sb-section .sb-text',
      '.sb-section .sb-legend',
      'article.sb-compare > h3',
      'article.sb-compare > .sb-finding-lede',
      'article.sb-compare > .sb-changes',
      'article.sb-compare > figure',
      'article.sb-compare .sb-compare-sub',
      '.sb-principles .sb-num-card',
      '.sb-process .sb-wrap > *',
      '.sb-reflect .sb-wrap > *',
      '.sb-status .sb-wrap > *',
    ].join(', ');

    root.querySelectorAll(sel).forEach(function (el) {
      el.classList.add(CS);
    });
  }

  function collectNodes() {
    return Array.prototype.slice.call(
      document.querySelectorAll('.' + REVEAL + ', .' + CS + ', .fade-in')
    );
  }

  function observeNodes(nodes) {
    if (!window.IntersectionObserver) {
      nodes.forEach(markVisible);
      return null;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        markVisible(entry.target);
        obs.unobserve(entry.target);
      });
    }, IO_OPTS);

    nodes.forEach(function (el) {
      if (shouldNotObserve(el)) {
        markVisible(el);
        return;
      }
      observer.observe(el);
    });

    return observer;
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

  function initHcWizardSteps() {
    var ws = document.getElementById('hc-wizard-steps');
    if (!ws || !window.IntersectionObserver) return;
    var wio = new IntersectionObserver(
      function (entries, obs) {
        if (entries[0].isIntersecting) {
          ws.classList.add('is-steps-visible');
          obs.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );
    wio.observe(ws);
  }

  function init() {
    document.documentElement.classList.add('js');

    initSimpleBooking();
    demoteLargeWrappers();
    var nodes = collectNodes();

    if (reducedMotion()) {
      nodes.forEach(markVisible);
      initProtoPosters();
      return;
    }

    observeNodes(nodes);
    revealIfInView(nodes);

    setTimeout(function () {
      revealIfInView(collectNodes());
    }, 2000);

    initProtoPosters();
    initHcWizardSteps();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
