// Wendet das gespeicherte Theme an - synchron im <head> eingebunden, damit es
// VOR dem ersten Paint passiert (kein Farbflackern beim Laden). Reagiert
// zusaetzlich live auf Aenderungen aus einem ANDEREN Fenster (Einstellungen),
// da 'storage' nur in fremden Fenstern derselben Origin feuert, nicht im
// Fenster, das den Wert selbst gesetzt hat.
(function () {
  var THEME_KEY = 'ttp_theme';

  function applyStoredTheme() {
    try {
      var theme = localStorage.getItem(THEME_KEY) || 'classic';
      if (theme === 'classic') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    } catch (e) {
      // localStorage nicht verfuegbar - bleibt beim Classic-Standard
    }
  }

  applyStoredTheme();
  window.addEventListener('storage', function (e) {
    if (e.key === THEME_KEY) applyStoredTheme();
  });
})();
