/* Margin aside bubbles: runtime placement (is-left / is-right / is-inline) */
(function () {
  var MQ = '(min-width: 1320px)';
  var BUBBLE_W = 188;
  var BUBBLE_H = 180;
  var ARROW_W = 40;
  var GAP = 24;
  var NEEDED = BUBBLE_W + ARROW_W + GAP;
  var SAFE = 24;
  var NUDGE = 12;
  var NUDGE_MAX = 520;

  var mq = window.matchMedia(MQ);
  var debounceTimer;

  function debounce(fn) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fn, 150);
  }

  function rectsOverlap(a, b, pad) {
    pad = pad || 4;
    return !(
      a.right <= b.left + pad ||
      a.left >= b.right - pad ||
      a.bottom <= b.top + pad ||
      a.top >= b.bottom - pad
    );
  }

  function clearBubbleStyles(bubble) {
    if (!bubble) return;
    bubble.style.removeProperty('top');
    bubble.style.removeProperty('--aside-bubble-top');
    bubble.style.removeProperty('left');
    bubble.style.removeProperty('right');
  }

  function obstacleRects(note, paragraph, bubbleEl) {
    var scope =
      note.closest('.sb-wrap') ||
      note.closest('.section') ||
      note.closest('.content') ||
      document.body;
    var list = [];
    scope.querySelectorAll(
      'p, ul, ol, figure, table, .quote-block, .cs-quote, h1, h2, h3, h4, .section-header, img, .cs-card-grid, .results-grid, .cs-stat-grid, .ab-grid, .cs-compare-grid, .data-table, .aside-note--bubble'
    ).forEach(function (el) {
      if (el === note || el === paragraph || note.contains(el) || el.contains(note)) return;
      if (bubbleEl && (el === bubbleEl || bubbleEl.contains(el))) return;
      if (el.classList && el.classList.contains('aside-note--bubble') && el !== note) {
        var otherBubble = el.querySelector('.aside-note__bubble');
        if (otherBubble) {
          var br = otherBubble.getBoundingClientRect();
          if (br.width > 2 && br.height > 2) list.push(br);
        }
        return;
      }
      var r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      if (el.tagName === 'FIGURE' || el.tagName === 'IMG') {
        var imgEl = el.tagName === 'IMG' ? el : el.querySelector('img');
        if (imgEl) r = imgEl.getBoundingClientRect();
      }
      if (r.width < 2 || r.height < 2) return;
      list.push(r);
    });
    return list;
  }

  function hasOverlap(br, obstacles) {
    for (var i = 0; i < obstacles.length; i += 1) {
      if (rectsOverlap(br, obstacles[i])) return true;
    }
    return false;
  }

  function layoutNote(note) {
    var bubble = note.querySelector('.aside-note__bubble');
    var paragraph = note.previousElementSibling;
    note.classList.remove('is-left', 'is-right', 'is-inline');
    clearBubbleStyles(bubble);

    if (!bubble || !paragraph) return;

    if (!mq.matches) {
      note.classList.add('is-inline');
      return;
    }

    var pRect = paragraph.getBoundingClientRect();
    var spaceLeft = pRect.left - SAFE;
    var spaceRight = window.innerWidth - pRect.right - SAFE;

    var sides = [];
    if (spaceLeft >= NEEDED) sides.push('left');
    if (spaceRight >= NEEDED) sides.push('right');

    if (!sides.length) {
      note.classList.add('is-inline');
      return;
    }

    function trySide(side) {
      note.classList.remove('is-left', 'is-right');
      note.classList.add(side === 'left' ? 'is-left' : 'is-right');

      var top = paragraph.offsetTop - note.offsetTop;
      bubble.style.top = top + 'px';
      bubble.style.setProperty('--aside-bubble-top', top + 'px');

      var obstacles = obstacleRects(note, paragraph, bubble);
      var maxTop = top;

      for (var n = 0; n < NUDGE_MAX; n += 1) {
        var br = bubble.getBoundingClientRect();
        if (br.width < 2) break;
        if (!hasOverlap(br, obstacles)) return true;
        maxTop += NUDGE;
        bubble.style.top = maxTop + 'px';
        bubble.style.setProperty('--aside-bubble-top', maxTop + 'px');
      }
      return false;
    }

    for (var s = 0; s < sides.length; s += 1) {
      clearBubbleStyles(bubble);
      if (trySide(sides[s])) return;
    }

    note.classList.remove('is-left', 'is-right');
    clearBubbleStyles(bubble);
    note.classList.add('is-inline');
  }

  function layoutAll() {
    document.querySelectorAll('.aside-note--bubble').forEach(layoutNote);
  }

  layoutAll();
  window.addEventListener('resize', function () {
    debounce(layoutAll);
  });
  if (mq.addEventListener) mq.addEventListener('change', layoutAll);
  else mq.addListener(layoutAll);

  window.addEventListener('load', layoutAll);
  document.querySelectorAll('img').forEach(function (img) {
    if (!img.complete) img.addEventListener('load', function () {
      debounce(layoutAll);
    });
  });
})();
