(function () {
  var nav = document.getElementById('site-nav');
  if (!nav) return;
  nav.classList.add('anna-nav--intro-visible');
  function onScroll() {
    nav.classList.toggle('anna-nav--scrolled', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
