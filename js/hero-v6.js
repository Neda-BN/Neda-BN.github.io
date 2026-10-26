(function () {
  var ROLES = ['Product Designer', 'UX Researcher', 'UI Designer', 'Front-end Builder'];
  var roleEl = document.querySelector('.hero-v6__role-word');
  var hero = document.getElementById('hero');
  var glow = document.querySelector('.hero-v6__glow');
  var charsWrap = document.querySelector('.hero-v6__name-chars');
  var slogan = document.querySelector('.hero-v6__slogan');
  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  /* Role cycle */
  if (roleEl && !reduce) {
    var ri = 0;
    roleEl.textContent = ROLES[0];
    setInterval(function () {
      roleEl.classList.add('is-out');
      setTimeout(function () {
        ri = (ri + 1) % ROLES.length;
        roleEl.textContent = ROLES[ri];
        roleEl.classList.remove('is-out');
      }, 350);
    }, 2500);
  } else if (roleEl && reduce) {
    roleEl.textContent = 'Product Designer';
  }

  /* Name letter reveal */
  if (charsWrap) {
    var name = 'Neda Bagheri';
    charsWrap.innerHTML = '';
    name.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.textContent = ch === ' ' ? '\u00a0' : ch;
      s.style.setProperty('--i', String(i));
      charsWrap.appendChild(s);
    });
    requestAnimationFrame(function () {
      charsWrap.classList.add('is-ready');
      var delay = reduce ? 0 : name.length * 30 + 200;
      setTimeout(function () {
        if (slogan) slogan.classList.add('is-visible');
      }, delay);
    });
  }

  /* Mouse glow */
  if (hero && glow && !reduce) {
    var touch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (!touch) {
      glow.classList.add('hero-v6__glow--follow');
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        glow.style.left = e.clientX - r.left + 'px';
        glow.style.top = e.clientY - r.top + 'px';
      });
    }
  }
})();
