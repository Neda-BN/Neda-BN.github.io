/* Case-study margin bubbles (.aside-note--bubble) — wide screens only */
(function () {
  if (!document.body.classList.contains('case-study-page')) return;

  var bubbleMq = window.matchMedia('(min-width: 1320px)');
  var bubbleNotes = document.querySelectorAll('.aside-note--bubble');
  if (!bubbleNotes.length) return;

  var BUBBLE_W = 188;
  var BUBBLE_GAP = 56;
  var VIEW_PAD = 16;

  function layoutScope(note) {
    return (
      note.closest('.sb-wrap') ||
      note.closest('.section') ||
      note.closest('.mob-solution') ||
      note.closest('.screens-section') ||
      note.parentElement
    );
  }

  function textAlignLeft(note) {
    var scope = layoutScope(note);
    var textRef = scope && scope.querySelector('.sb-text');
    if (textRef) return textRef.getBoundingClientRect().left;
    if (scope) {
      var firstP = scope.querySelector(':scope > p:not(.aside-note--bubble)');
      if (firstP) return firstP.getBoundingClientRect().left;
    }
    return note.parentElement.getBoundingClientRect().left;
  }

  function layoutAsideBubbles() {
    if (!bubbleMq.matches) {
      bubbleNotes.forEach(function (note) {
        note.classList.remove('aside-note--bubble-margin-right');
        var bubble = note.querySelector('.aside-note__bubble');
        if (bubble) {
          bubble.style.removeProperty('--aside-bubble-top');
          bubble.style.top = '';
          bubble.style.right = '';
          bubble.style.left = '';
        }
      });
      return;
    }

    bubbleNotes.forEach(function (note) {
      var bubble = note.querySelector('.aside-note__bubble');
      var prev = note.previousElementSibling;
      if (!bubble || !prev) return;

      var parent = note.parentElement;
      var scope = layoutScope(note);
      var noteRect = note.getBoundingClientRect();
      var textMax = Math.min(parent.offsetWidth, 720);
      var textColLeft = textAlignLeft(note);
      var textColRight = textColLeft + textMax;
      var gutterLeft = parent.getBoundingClientRect().left;
      var spaceLeft = gutterLeft - VIEW_PAD;

      var preferLeft = note.classList.contains('aside-note--bubble-prefer-left');
      var preferRight = note.classList.contains('aside-note--bubble-prefer-right');
      var canLeft = spaceLeft >= BUBBLE_W + BUBBLE_GAP;
      var useLeftMargin = preferRight ? false : preferLeft ? canLeft : canLeft;

      note.classList.toggle('aside-note--bubble-margin-right', !useLeftMargin);

      var top = prev.offsetTop - note.offsetTop;
      bubble.style.setProperty('--aside-bubble-top', top + 'px');
      bubble.style.top = top + 'px';
      bubble.style.right = '';
      bubble.style.left = '';

      if (useLeftMargin) {
        var targetBubbleRight = textColLeft - BUBBLE_GAP;
        bubble.style.right = 'calc(100% + 56px)';
        var b0 = bubble.getBoundingClientRect();
        var shiftX = targetBubbleRight - b0.right;
        if (Math.abs(shiftX) > 0.5) {
          bubble.style.right = 'auto';
          bubble.style.left = b0.left - noteRect.left + shiftX + 'px';
        }
      } else {
        bubble.style.left = 'calc(min(100%, var(--cs-text-max, 720px)) + 56px)';
        var br0 = bubble.getBoundingClientRect();
        if (br0.right > window.innerWidth - VIEW_PAD) {
          bubble.style.left =
            window.innerWidth - VIEW_PAD - br0.width - noteRect.left + 'px';
        }
      }

      var maxTop = top;
      var step = 12;
      var limit = 480;
      var marginRight = !useLeftMargin;

      for (var n = 0; n < limit; n += 1) {
        var br = bubble.getBoundingClientRect();
        var hit = false;
        scope.querySelectorAll('p, ul, ol, figure, .quote-block, .cs-quote, h2, h3, .section-header, .sb-changes, img').forEach(function (el) {
          if (hit || el === note || el === prev || note.contains(el)) return;
          if (el.contains(note) || el.contains(bubble)) return;
          var r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) return;
          if (r.top < br.top + 8) return;
          var isMedia = el.tagName === 'FIGURE' || el.tagName === 'IMG' || el.classList.contains('sb-scroll-x');
          if (isMedia) {
            var imgEl = el.tagName === 'IMG' ? el : el.querySelector('img');
            if (imgEl) r = imgEl.getBoundingClientRect();
          } else if (marginRight && br.left >= textColRight - 8) {
            r = {
              left: textColLeft,
              right: textColRight,
              top: r.top,
              bottom: r.bottom,
              width: textColRight - textColLeft,
              height: r.height
            };
          } else if (!marginRight && br.right <= textColLeft - 8) {
            r = {
              left: textColLeft,
              right: Math.min(r.right, textColRight),
              top: r.top,
              bottom: r.bottom,
              width: Math.min(r.right, textColRight) - textColLeft,
              height: r.height
            };
          }
          if (r.width < 2 || r.height < 2) return;
          if (r.right <= br.left + 4 || r.left >= br.right - 4) return;
          var overlap = !(br.bottom < r.top + 4 || br.top > r.bottom - 4);
          if (overlap) hit = true;
        });
        if (!hit) break;
        maxTop += step;
        bubble.style.top = maxTop + 'px';
        bubble.style.setProperty('--aside-bubble-top', maxTop + 'px');
      }

      if (useLeftMargin) {
        var bRect = bubble.getBoundingClientRect();
        if (bRect.left < VIEW_PAD) {
          noteRect = note.getBoundingClientRect();
          bubble.style.right = 'auto';
          bubble.style.left = VIEW_PAD - noteRect.left + 'px';
        }
      }
    });
  }

  layoutAsideBubbles();
  window.addEventListener('resize', layoutAsideBubbles);
  if (bubbleMq.addEventListener) bubbleMq.addEventListener('change', layoutAsideBubbles);
  else bubbleMq.addListener(layoutAsideBubbles);
})();
