(function () {
  var nav = document.getElementById('site-nav');
  if (!nav) return;
  nav.classList.add('anna-nav--intro-visible');
  function onScroll() {
    var scrolled = window.scrollY > 24;
    nav.classList.toggle('anna-nav--scrolled', scrolled);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
