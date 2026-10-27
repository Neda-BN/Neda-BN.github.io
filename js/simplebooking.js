/* Simple Booking case study — optional enhancement.
   Clicking a before/after image opens it in a full-screen viewer that can be
   scrolled and panned. Without this script (or without <dialog> support),
   the same links simply open the full-size image in a new tab. */
(function () {
  var root = document.querySelector('.sb-case');
  if (!root || typeof HTMLDialogElement !== 'function') return;

  var dialog = document.createElement('dialog');
  dialog.className = 'sb-lightbox';
  dialog.setAttribute('aria-label', 'Before and after comparison, full size');
  dialog.innerHTML =
    '<div class="sb-lightbox-bar"><span class="sb-lightbox-title"></span>' +
    '<button type="button" class="sb-lightbox-close">Close</button></div>' +
    '<div class="sb-lightbox-stage"><img alt=""></div>';
  root.appendChild(dialog);

  var title = dialog.querySelector('.sb-lightbox-title');
  var img = dialog.querySelector('img');
  var stage = dialog.querySelector('.sb-lightbox-stage');
  var lastTrigger = null;

  function close() { dialog.close(); }
  dialog.querySelector('.sb-lightbox-close').addEventListener('click', close);
  dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });
  dialog.addEventListener('close', function () {
    img.removeAttribute('src');
    if (lastTrigger) lastTrigger.focus();
  });

  /* Margin aside bubbles (wide screens): align with paragraph above, avoid overlap */
  var bubbleMq = window.matchMedia('(min-width: 1320px)');
  var bubbleNotes = root.querySelectorAll('.aside-note--bubble');

  function layoutAsideBubbles() {
    if (!bubbleMq.matches) {
      bubbleNotes.forEach(function (note) {
        var bubble = note.querySelector('.aside-note__bubble');
        if (bubble) {
          bubble.style.removeProperty('--aside-bubble-top');
          bubble.style.top = '';
          bubble.classList.remove('is-visible');
        }
      });
      return;
    }

    bubbleNotes.forEach(function (note) {
      var bubble = note.querySelector('.aside-note__bubble');
      var prev = note.previousElementSibling;
      if (!bubble || !prev) return;

      var top = prev.offsetTop - note.offsetTop;
      bubble.style.setProperty('--aside-bubble-top', top + 'px');
      bubble.style.top = top + 'px';

      var maxTop = top;
      var step = 12;
      var limit = 480;
      var parent = note.parentElement;
      var textColRight =
        parent.getBoundingClientRect().left + Math.min(parent.offsetWidth, 720);

      for (var n = 0; n < limit; n += 1) {
        var br = bubble.getBoundingClientRect();
        var hit = false;
        parent.querySelectorAll('p, ul, ol, figure, .quote-block, .cs-quote, h3, .sb-changes, img').forEach(function (el) {
          if (hit || el === note || el === prev || note.contains(el)) return;
          if (el.contains(note) || el.contains(bubble)) return;
          var r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) return;
          if (r.top < br.top + 8) return;
          var isMedia = el.tagName === 'FIGURE' || el.tagName === 'IMG' || el.classList.contains('sb-scroll-x');
          var boxRight = isMedia ? r.right : Math.min(r.right, textColRight);
          var boxLeft = r.left;
          if (boxRight <= br.left + 4 || boxLeft >= br.right - 4) return;
          var overlap = !(br.bottom < r.top + 4 || br.top > r.bottom - 4);
          if (overlap) hit = true;
        });
        if (!hit) break;
        maxTop += step;
        bubble.style.top = maxTop + 'px';
        bubble.style.setProperty('--aside-bubble-top', maxTop + 'px');
      }

      var pad = 16;
      var bRect = bubble.getBoundingClientRect();
      if (bRect.right > window.innerWidth - pad) {
        var noteLeft = note.getBoundingClientRect().left;
        var fitLeft = window.innerWidth - pad - bRect.width - noteLeft;
        bubble.style.left = Math.max(0, fitLeft) + 'px';
      }
    });
  }

  if (bubbleNotes.length && 'IntersectionObserver' in window) {
    var bubbleIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { root: null, threshold: 0.35 }
    );
    bubbleNotes.forEach(function (note) {
      var bubble = note.querySelector('.aside-note__bubble');
      if (bubble) bubbleIo.observe(bubble);
    });
  }

  layoutAsideBubbles();
  window.addEventListener('resize', layoutAsideBubbles);
  if (bubbleMq.addEventListener) bubbleMq.addEventListener('change', layoutAsideBubbles);
  else bubbleMq.addListener(layoutAsideBubbles);

  root.querySelectorAll('a.sb-zoom').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // allow "open in new tab"
      e.preventDefault();
      lastTrigger = link;
      var source = link.querySelector('img');
      img.src = link.getAttribute('href');
      img.alt = source ? source.alt : '';
      title.textContent = link.getAttribute('data-title') || 'Before and after';
      dialog.showModal();
      stage.scrollTo(0, 0);
    });
  });
})();
