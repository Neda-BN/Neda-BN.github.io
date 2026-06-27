/* Page transition disabled — static page loads use normal browser navigation. */
(function (global) {
  global.nbPageTransition = {
    ENTER_KEY: 'nb_page_enter',
    hadEnterTransition: function () { return false; },
    isEnterPending: function () { return false; },
    afterEnter: function (fn) { if (typeof fn === 'function') fn(); }
  };
  try { sessionStorage.removeItem('nb_page_enter'); } catch (e) {}
})(window);
