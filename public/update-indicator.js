// Kleines Update-Symbol oben rechts (links vom Zahnrad), erscheint sobald
// ein Update gefunden wurde - klicken oeffnet das eigentliche Update-Fenster.
// Gemeinsam von index.html und overview.html genutzt, analog zu theme.js.
(function () {
  function init() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'updateIndicatorBtn';
    btn.className = 'update-indicator-btn';
    btn.title = 'Update available - click to install';
    btn.setAttribute('aria-label', 'Update available');
    btn.textContent = '⬆';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      if (window.ttpMain && window.ttpMain.openUpdateWindow) window.ttpMain.openUpdateWindow();
    });

    function applyState(state) {
      const visible = state === 'available' || state === 'downloaded';
      btn.classList.toggle('visible', visible);
    }

    if (!window.ttpMain) return;

    // Bei jedem (Neu-)Laden dieser Seite (auch nach Navigation zwischen
    // index.html/overview.html) erst den aktuellen Stand abfragen, dann auf
    // weitere Live-Aenderungen hoeren - sonst waere das Symbol nach einer
    // Seitennavigation faelschlich wieder weg, obwohl der Hauptprozess
    // bereits ein Update kennt.
    if (window.ttpMain.getUpdateState) {
      window.ttpMain.getUpdateState().then(applyState);
    }
    if (window.ttpMain.onUpdateStatus) {
      window.ttpMain.onUpdateStatus(applyState);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
