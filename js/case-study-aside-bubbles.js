/* Case-study margin bubbles (.aside-note--bubble) — wide screens only */
(function () {
  if (!document.body.classList.contains('case-study-page')) return;

  var bubbleMq = window.matchMedia('(min-width: 1320px)');
  var bubbleNotes = document.querySelectorAll('.aside-note--bubble');
  if (!bubbleNotes.length) return;

  var BUBBLE_W = 188;
  var BUBBLE_GAP = 56;
  /** Extra clearance so soft glow / arrow does not sit on the text column */
  var BUBBLE_GLOW_PAD = 40;
  var VIEW_PAD = 16;
  /** Keep margin bubbles off the viewport edge on wide screens */
  var VIEW_EDGE_INSET = 48;

  function bubbleGap(note) {
    var gap = BUBBLE_GAP;
    if (note.classList.contains('aside-note--bubble-gap-wide')) gap += 28;
    if (note.classList.contains('aside-note--bubble-clear-copy')) gap += 24;
    return gap;
  }

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
      var textTrackRight = textColLeft + textMax;
      var parentRect = parent.getBoundingClientRect();
      var scopeRect = scope.getBoundingClientRect();
      /* Full-width blocks (e.g. .mob-solution cards) can exceed the 720px copy track */
      var textColRight = Math.max(textTrackRight, parentRect.right, scopeRect.right);
      var gutterLeft = parentRect.left;
      var spaceLeft = gutterLeft - VIEW_PAD;

      var preferLeft = note.classList.contains('aside-note--bubble-prefer-left');
      var preferRight = note.classList.contains('aside-note--bubble-prefer-right');
      if (preferRight) {
        textColRight = textTrackRight;
        if (note.classList.contains('aside-note--bubble-clear-copy') && prev) {
          textColRight = Math.max(textTrackRight, prev.getBoundingClientRect().right);
        }
      }
      var gap = bubbleGap(note);
      var canLeft = spaceLeft >= BUBBLE_W + gap;
      var useLeftMargin = preferRight ? false : preferLeft ? canLeft : canLeft;

      note.classList.toggle('aside-note--bubble-margin-right', !useLeftMargin);

      var top = prev.offsetTop - note.offsetTop;
      if (note.classList.contains('aside-note--bubble-nudge-down')) {
        var nudge = note.classList.contains('aside-note--bubble-nudge-down-lg') ? 64 : 48;
        top = prev.offsetTop - note.offsetTop + nudge;
      }
      bubble.style.setProperty('--aside-bubble-top', top + 'px');
      bubble.style.top = top + 'px';
      bubble.style.right = '';
      bubble.style.left = '';

      if (useLeftMargin) {
        var targetBubbleRight = textColLeft - gap;
        bubble.style.right = 'calc(100% + ' + gap + 'px)';
        var b0 = bubble.getBoundingClientRect();
        var shiftX = targetBubbleRight - b0.right;
        if (Math.abs(shiftX) > 0.5) {
          bubble.style.right = 'auto';
          bubble.style.left = b0.left - noteRect.left + shiftX + 'px';
        }
      } else {
        var minLeftViewport = textColRight + gap + BUBBLE_GLOW_PAD;
        var minLeftRel = minLeftViewport - noteRect.left;
        var maxBubbleRight = window.innerWidth - Math.max(VIEW_PAD, VIEW_EDGE_INSET);
        var leftRel = minLeftRel;
        if (noteRect.left + leftRel + BUBBLE_W > maxBubbleRight) {
          leftRel = maxBubbleRight - BUBBLE_W - noteRect.left;
        }
        bubble.style.left = Math.max(minLeftRel, leftRel) + 'px';
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
