(function () {
  'use strict';

  var DRAG_THRESHOLD = 6;

  var CASE_STUDIES = [
    {
      href: 'simplebooking.html',
      meta: 'CASE 01 · FINTECH · 2026–PRESENT',
      title: 'Simple Booking',
      role: 'Sole Product Designer · Research → Design → Code',
      imgPos: 'center top',
      picture: [{ src: 'sb-hero.webp', type: 'image/webp' }],
      img: { src: 'sb-hero.png', width: 2400, height: 1300, alt: '' }
    },
    {
      href: 'healthcare.html',
      meta: 'CASE 02 · HEALTHTECH · 2025–2026',
      title: 'Healthcare Survey Platform',
      role: 'Sole Product Designer · Discovery → Front-end',
      imgPos: 'center',
      img: { src: 'healthcare-provider-thumbnail.png?v=20260324', width: 1024, height: 725, alt: '' }
    },
    {
      href: 'pos-app.html',
      meta: 'CASE 03 · RETAIL PAYMENTS · 2024–2025',
      title: 'Cashier POS App',
      role: 'Product Designer · Mobile POS',
      imgPos: 'center top',
      img: { src: 'pos-app-thumbnail.png', width: 1024, height: 767, alt: '' }
    },
    {
      href: 'mobile-app.html',
      meta: 'CASE 04 · RETAIL · B2C · 2023–2024',
      title: 'Mobile Shopping App',
      role: 'Sole Product Designer',
      imgPos: 'center',
      img: { src: 'mobile-customer-shopping-app-thumbnail.png', width: 1024, height: 576, alt: '' }
    },
    {
      href: 'backoffice.html',
      meta: 'CASE 05 · RETAIL · B2B SAAS · 2023–2025',
      title: 'Focalpay Back-office',
      role: 'Product Designer · Replenishment and Campaigns',
      imgPos: 'center top',
      img: { src: 'Backoffice-Dashboard.png', width: 1200, height: 900, alt: '' }
    }
  ];

  var CHEVRON_LEFT =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
  var CHEVRON_RIGHT =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

  function currentPageKey() {
    var path = window.location.pathname || '';
    var file = path.split('/').pop() || '';
    if (!file || file.indexOf('.') === -1) {
      file = 'index.html';
    }
    return file;
  }

  function orderedForPage(pageKey) {
    var idx = -1;
    for (var i = 0; i < CASE_STUDIES.length; i++) {
      if (CASE_STUDIES[i].href === pageKey) {
        idx = i;
        break;
      }
    }
    if (idx === -1) {
      return CASE_STUDIES.slice();
    }
    var out = [];
    for (var j = 0; j < CASE_STUDIES.length - 1; j++) {
      out.push(CASE_STUDIES[(idx + 1 + j) % CASE_STUDIES.length]);
    }
    return out;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function mediaHtml(item) {
    var style = 'object-position:' + item.imgPos + ';';
    var imgTag =
      '<img class="cs-more__img" src="' +
      escapeHtml(item.img.src) +
      '" width="' +
      item.img.width +
      '" height="' +
      item.img.height +
      '" alt="' +
      escapeHtml(item.img.alt) +
      '" loading="lazy" decoding="async" style="' +
      style +
      '">';
    if (item.picture && item.picture.length) {
      var sources = item.picture
        .map(function (p) {
          return '<source srcset="' + escapeHtml(p.src) + '" type="' + escapeHtml(p.type) + '">';
        })
        .join('');
      return '<picture class="cs-more__picture">' + sources + imgTag + '</picture>';
    }
    return imgTag;
  }

  function cardHtml(item, index) {
    return (
      '<a class="cs-more__card" href="' +
      escapeHtml(item.href) +
      '" style="--cs-more-i:' +
      index +
      '" aria-label="' +
      escapeHtml(item.title + ' — read case study') +
      '">' +
      '<span class="cs-more__media">' +
      mediaHtml(item) +
      '</span>' +
      '<span class="cs-more__meta">' +
      escapeHtml(item.meta) +
      '</span>' +
      '<span class="cs-more__title">' +
      escapeHtml(item.title) +
      '</span>' +
      '<span class="cs-more__role">' +
      escapeHtml(item.role) +
      '</span>' +
      '</a>'
    );
  }

  function buildSection(items) {
    var cards = items.map(cardHtml).join('');
    return (
      '<div class="cs-more">' +
      '<div class="cs-more__header">' +
      '<div class="cs-more__headings">' +
      '<p class="cs-more__eyebrow">Keep exploring</p>' +
      '<h2 class="cs-more__heading" id="cs-more-heading">More case studies</h2>' +
      '</div>' +
      '<div class="cs-more__nav">' +
      '<button type="button" class="cs-more__arrow-btn cs-more__arrow-btn--prev" aria-label="Previous case studies">' +
      CHEVRON_LEFT +
      '</button>' +
      '<button type="button" class="cs-more__arrow-btn cs-more__arrow-btn--next" aria-label="Next case studies">' +
      CHEVRON_RIGHT +
      '</button>' +
      '</div>' +
      '</div>' +
      '<div class="cs-more__viewport">' +
      '<div class="cs-more__track" tabindex="0" role="region" aria-label="More case studies carousel">' +
      cards +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function usesNativeTouchScroll() {
    try {
      if (window.matchMedia('(max-width: 899px)').matches) return true;
      if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return true;
    } catch (e) {}
    return false;
  }

  function isMousePointer(e) {
    return e && e.pointerType === 'mouse';
  }

  function initCarousel(root) {
    var track = root.querySelector('.cs-more__track');
    var viewport = root.querySelector('.cs-more__viewport');
    var btnPrev = root.querySelector('.cs-more__arrow-btn--prev');
    var btnNext = root.querySelector('.cs-more__arrow-btn--next');
    if (!track || !viewport) return;

    var reduced = prefersReducedMotion();
    var section = root.closest('.cs-more-section') || root;
    var drag = {
      pointerId: null,
      active: false,
      dragging: false,
      suppressClick: false,
      startX: 0,
      scrollLeft: 0,
      lastX: 0,
      lastT: 0,
      velocity: 0,
      momentumRaf: 0
    };
    var focusRaf = 0;

    function cardStep() {
      var card = track.querySelector('.cs-more__card');
      if (!card) return 404;
      var gap = 24;
      try {
        gap = parseFloat(getComputedStyle(track).gap) || 24;
      } catch (e2) {}
      return card.offsetWidth + gap;
    }

    function scrollBounds() {
      return Math.max(0, track.scrollWidth - track.clientWidth);
    }

    function updateEdges() {
      var max = scrollBounds();
      var sl = track.scrollLeft;
      var atStart = sl <= 2;
      var atEnd = sl >= max - 2;
      viewport.classList.toggle('cs-more__viewport--at-start', atStart);
      viewport.classList.toggle('cs-more__viewport--at-end', atEnd || max <= 2);
      if (btnPrev) btnPrev.disabled = atStart;
      if (btnNext) btnNext.disabled = atEnd;
    }

    function resetFocusCards() {
      var cards = track.querySelectorAll('.cs-more__card');
      for (var c = 0; c < cards.length; c++) {
        cards[c].style.removeProperty('--cs-more-scale');
        cards[c].style.removeProperty('--cs-more-opacity');
      }
    }

    function updateFocusCards() {
      focusRaf = 0;
      if (
        reduced ||
        usesNativeTouchScroll() ||
        !section.classList.contains('cs-more-section--focus-ready')
      ) {
        return;
      }
      var trackRect = track.getBoundingClientRect();
      var centerX = trackRect.left + trackRect.width * 0.5;
      var falloff = Math.max(trackRect.width * 0.45, 280);
      var cards = track.querySelectorAll('.cs-more__card');
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var rect = card.getBoundingClientRect();
        var cardCenter = rect.left + rect.width * 0.5;
        var dist = Math.abs(cardCenter - centerX);
        var t = Math.min(1, dist / falloff);
        var scale = 1 - t * 0.06;
        var opacity = 1 - t * 0.45;
        card.style.setProperty('--cs-more-scale', String(scale));
        card.style.setProperty('--cs-more-opacity', String(opacity));
      }
    }

    function scheduleFocus() {
      if (reduced) return;
      if (usesNativeTouchScroll()) {
        resetFocusCards();
        return;
      }
      if (!focusRaf) {
        focusRaf = requestAnimationFrame(updateFocusCards);
      }
    }

    function smoothScrollBy(delta) {
      if (reduced) {
        track.scrollLeft += delta;
        updateEdges();
        scheduleFocus();
        return;
      }
      track.scrollBy({ left: delta, behavior: 'smooth' });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', function () {
        smoothScrollBy(-cardStep());
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', function () {
        smoothScrollBy(cardStep());
      });
    }

    track.addEventListener('scroll', function () {
      updateEdges();
      scheduleFocus();
    }, { passive: true });
    window.addEventListener('resize', function () {
      updateEdges();
      scheduleFocus();
    });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        smoothScrollBy(-cardStep());
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        smoothScrollBy(cardStep());
      }
    });

    track.addEventListener(
      'wheel',
      function (e) {
        if (!e.shiftKey) return;
        if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
        e.preventDefault();
        track.scrollLeft += e.deltaY;
      },
      { passive: false }
    );

    function stopMomentum() {
      if (drag.momentumRaf) {
        cancelAnimationFrame(drag.momentumRaf);
        drag.momentumRaf = 0;
      }
    }

    function momentumLoop() {
      drag.velocity *= 0.92;
      if (Math.abs(drag.velocity) < 0.25) {
        drag.momentumRaf = 0;
        updateEdges();
        scheduleFocus();
        return;
      }
      track.scrollLeft += drag.velocity;
      updateEdges();
      scheduleFocus();
      drag.momentumRaf = requestAnimationFrame(momentumLoop);
    }

    track.addEventListener('pointerdown', function (e) {
      if (!isMousePointer(e) || e.button !== 0) return;
      drag.active = true;
      drag.dragging = false;
      drag.suppressClick = false;
      drag.pointerId = e.pointerId;
      drag.startX = e.clientX;
      drag.scrollLeft = track.scrollLeft;
      drag.lastX = e.clientX;
      drag.lastT = performance.now();
      drag.velocity = 0;
      stopMomentum();
    });

    track.addEventListener('pointermove', function (e) {
      if (!isMousePointer(e) || !drag.active || e.pointerId !== drag.pointerId) return;
      var dx = e.clientX - drag.startX;
      if (!drag.dragging) {
        if (Math.abs(dx) <= DRAG_THRESHOLD) return;
        drag.dragging = true;
        drag.suppressClick = true;
        drag.scrollLeft = track.scrollLeft;
        drag.startX = e.clientX;
        dx = 0;
        track.classList.add('cs-more__track--dragging');
        try {
          track.setPointerCapture(e.pointerId);
        } catch (err) {}
      }
      track.scrollLeft = drag.scrollLeft - (e.clientX - drag.startX);
      var now = performance.now();
      var dt = now - drag.lastT;
      if (dt > 0) {
        drag.velocity = (-(e.clientX - drag.lastX) / dt) * 16;
      }
      drag.lastX = e.clientX;
      drag.lastT = now;
      updateEdges();
      scheduleFocus();
    });

    function endDrag(e) {
      if (!isMousePointer(e) || !drag.active || e.pointerId !== drag.pointerId) return;
      drag.active = false;
      track.classList.remove('cs-more__track--dragging');
      try {
        track.releasePointerCapture(e.pointerId);
      } catch (err2) {}
      if (drag.dragging && !reduced) {
        drag.momentumRaf = requestAnimationFrame(momentumLoop);
      }
      drag.dragging = false;
      drag.pointerId = null;
      updateEdges();
      scheduleFocus();
    }

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    track.addEventListener(
      'click',
      function (e) {
        if (drag.suppressClick) {
          e.preventDefault();
          e.stopPropagation();
          drag.suppressClick = false;
        }
      },
      true
    );

    function markVisible() {
      section.classList.add('cs-more-section--visible');
      window.setTimeout(function () {
        section.classList.add('cs-more-section--focus-ready');
        if (reduced) {
          var cards = track.querySelectorAll('.cs-more__card');
          for (var c = 0; c < cards.length; c++) {
            cards[c].style.setProperty('--cs-more-scale', '1');
            cards[c].style.setProperty('--cs-more-opacity', '1');
          }
        } else {
          scheduleFocus();
        }
      }, reduced ? 0 : 720);
    }

    if (reduced) {
      section.classList.add('cs-more-section--visible', 'cs-more-section--focus-ready');
      updateEdges();
      return;
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              markVisible();
              io.disconnect();
            }
          });
        },
        { threshold: 0, rootMargin: '0px' }
      );
      io.observe(section);
      requestAnimationFrame(function () {
        var r = section.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          markVisible();
          io.disconnect();
        }
      });
    } else {
      markVisible();
    }

    setTimeout(markVisible, 1200);

    updateEdges();
    scheduleFocus();
  }

  function init() {
    var mount = document.querySelector('.cs-more-mount');
    if (!mount) return;
    var pageKey = mount.getAttribute('data-current-page') || currentPageKey();
    var items = orderedForPage(pageKey);
    mount.innerHTML = buildSection(items);
    var csMore = mount.querySelector('.cs-more');
    if (csMore) {
      initCarousel(csMore);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
