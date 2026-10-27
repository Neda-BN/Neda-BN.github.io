(function () {
  'use strict';

  var CASE_STUDIES = [
    {
      href: 'simplebooking.html',
      meta: 'CASE 01 · FINTECH · 2026–PRESENT',
      title: 'Simple Booking',
      role: 'Sole Product Designer · Research → Design → Code',
      imgPos: 'center top',
      picture: [{ src: 'sb-hero.webp', type: 'image/webp' }],
      img: { src: 'sb-hero.png', width: 2400, height: 1300, alt: '' },
      titleLong: false
    },
    {
      href: 'healthcare.html',
      meta: 'CASE 02 · HEALTHTECH · 2025–2026',
      title: 'Healthcare Survey Platform',
      role: 'Sole Product Designer · Discovery → Front-end',
      imgPos: 'center',
      img: { src: 'healthcare-provider-thumbnail.png?v=20260324', width: 1024, height: 725, alt: '' },
      titleLong: true
    },
    {
      href: 'pos-app.html',
      meta: 'CASE 03 · RETAIL PAYMENTS · 2024–2025',
      title: 'Cashier POS App',
      role: 'Product Designer · Mobile POS',
      imgPos: 'center top',
      img: { src: 'pos-app-thumbnail.png', width: 1024, height: 767, alt: '' },
      titleLong: false
    },
    {
      href: 'mobile-app.html',
      meta: 'CASE 04 · RETAIL · B2C · 2023–2024',
      title: 'Mobile Shopping App',
      role: 'Sole Product Designer',
      imgPos: 'center',
      img: { src: 'mobile-customer-shopping-app-thumbnail.png', width: 1024, height: 576, alt: '' },
      titleLong: false
    },
    {
      href: 'backoffice.html',
      meta: 'CASE 05 · RETAIL · B2B SAAS · 2023–2025',
      title: 'Focalpay Back-office',
      role: 'Product Designer · Replenishment and Campaigns',
      imgPos: 'center top',
      img: { src: 'Backoffice-Dashboard.png', width: 1200, height: 900, alt: '' },
      titleLong: false
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
      return '<picture>' + sources + imgTag + '</picture>';
    }
    return imgTag;
  }

  function cardHtml(item, index) {
    var titleClass = item.titleLong ? ' cs-more__title--long' : '';
    return (
      '<a class="cs-more__card" href="' +
      escapeHtml(item.href) +
      '" style="--cs-more-i:' +
      index +
      '" aria-label="' +
      escapeHtml(item.title + ' — read case study') +
      '">' +
      '<div class="cs-more__media">' +
      mediaHtml(item) +
      '</div>' +
      '<p class="cs-more__meta">' +
      escapeHtml(item.meta) +
      '</p>' +
      '<h3 class="cs-more__title' +
      titleClass +
      '">' +
      escapeHtml(item.title) +
      '</h3>' +
      '<p class="cs-more__role">' +
      escapeHtml(item.role) +
      '</p>' +
      '<span class="cs-more__link">Read case study <span class="cs-more__arrow" aria-hidden="true">→</span></span>' +
      '</a>'
    );
  }

  function buildSection(items) {
    var cards = items.map(cardHtml).join('');
    return (
      '<div class="cs-more">' +
      '<div class="cs-more__header">' +
      '<div class="cs-more__headings">' +
      '<p class="section-subtitle">Keep exploring</p>' +
      '<h2 class="section-chapter" id="cs-more-heading">More case studies</h2>' +
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

  function initCarousel(root) {
    var track = root.querySelector('.cs-more__track');
    var viewport = root.querySelector('.cs-more__viewport');
    var btnPrev = root.querySelector('.cs-more__arrow-btn--prev');
    var btnNext = root.querySelector('.cs-more__arrow-btn--next');
    if (!track || !viewport) return;

    var reduced = prefersReducedMotion();
    var drag = {
      active: false,
      moved: false,
      startX: 0,
      scrollLeft: 0,
      lastX: 0,
      lastT: 0,
      velocity: 0,
      raf: 0
    };

    function cardStep() {
      var card = track.querySelector('.cs-more__card');
      if (!card) return 360;
      var gap = 20;
      try {
        gap = parseFloat(getComputedStyle(track).gap) || 20;
      } catch (e2) {}
      return card.offsetWidth + gap;
    }

    function scrollBounds() {
      return {
        max: Math.max(0, track.scrollWidth - track.clientWidth)
      };
    }

    function updateEdges() {
      var max = scrollBounds().max;
      var sl = track.scrollLeft;
      var atStart = sl <= 2;
      var atEnd = sl >= max - 2;
      viewport.classList.toggle('cs-more__viewport--at-start', atStart);
      viewport.classList.toggle('cs-more__viewport--at-end', atEnd);
      viewport.classList.toggle('cs-more__viewport--scrollable', max > 2);
      if (btnPrev) {
        btnPrev.disabled = atStart;
      }
      if (btnNext) {
        btnNext.disabled = atEnd;
      }
    }

    function smoothScrollBy(delta) {
      if (reduced) {
        track.scrollLeft += delta;
        updateEdges();
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

    track.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);

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
      if (drag.raf) {
        cancelAnimationFrame(drag.raf);
        drag.raf = 0;
      }
    }

    function momentumLoop() {
      drag.velocity *= 0.92;
      if (Math.abs(drag.velocity) < 0.25) {
        drag.raf = 0;
        updateEdges();
        return;
      }
      track.scrollLeft += drag.velocity;
      updateEdges();
      drag.raf = requestAnimationFrame(momentumLoop);
    }

    track.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      var cardLink = e.target.closest('.cs-more__card');
      if (cardLink && e.target.closest('a')) {
        /* allow focus; drag handled on track */
      }
      drag.active = true;
      drag.moved = false;
      drag.startX = e.clientX;
      drag.scrollLeft = track.scrollLeft;
      drag.lastX = e.clientX;
      drag.lastT = performance.now();
      drag.velocity = 0;
      stopMomentum();
      track.setPointerCapture(e.pointerId);
      track.classList.add('cs-more__track--dragging');
    });

    track.addEventListener('pointermove', function (e) {
      if (!drag.active) return;
      var dx = e.clientX - drag.startX;
      if (Math.abs(dx) > 4) {
        drag.moved = true;
      }
      track.scrollLeft = drag.scrollLeft - dx;
      var now = performance.now();
      var dt = now - drag.lastT;
      if (dt > 0) {
        drag.velocity = (-(e.clientX - drag.lastX) / dt) * 16;
      }
      drag.lastX = e.clientX;
      drag.lastT = now;
      updateEdges();
    });

    function endDrag(e) {
      if (!drag.active) return;
      drag.active = false;
      track.classList.remove('cs-more__track--dragging');
      try {
        track.releasePointerCapture(e.pointerId);
      } catch (err) {}
      if (!reduced && drag.moved) {
        drag.raf = requestAnimationFrame(momentumLoop);
      }
      updateEdges();
    }

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    track.addEventListener(
      'click',
      function (e) {
        if (drag.moved) {
          e.preventDefault();
          e.stopPropagation();
          drag.moved = false;
        }
      },
      true
    );

    var section = root.closest('.cs-more-section') || root;
    if (reduced) {
      section.classList.add('cs-more-section--visible');
      updateEdges();
      return;
    }

    function markVisible() {
      section.classList.add('cs-more-section--visible');
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
        { threshold: 0, rootMargin: '0px 0px 15% 0px' }
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
