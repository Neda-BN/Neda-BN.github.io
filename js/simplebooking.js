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
