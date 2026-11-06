(function () {
  var allowed = ['ember', 'sage', 'citrus', 'rose', 'original'];
  try {
    var params = new URLSearchParams(window.location.search);
    var p = params.get('palette');
    if (p === 'reset') {
      try {
        localStorage.removeItem('palettePreview');
      } catch (e2) {}
      document.documentElement.removeAttribute('data-palette');
      return;
    }
    if (p && allowed.indexOf(p) !== -1) {
      if (p === 'ember') {
        document.documentElement.removeAttribute('data-palette');
      } else {
        document.documentElement.setAttribute('data-palette', p);
      }
      try {
        localStorage.setItem('palettePreview', p);
      } catch (e3) {}
      return;
    }
    var stored = localStorage.getItem('palettePreview');
    if (stored && allowed.indexOf(stored) !== -1 && stored !== 'ember') {
      document.documentElement.setAttribute('data-palette', stored);
    }
  } catch (e) {}
})();
