// Runder "Updates ueberpruefen"-Button oben rechts (links vom Einstellungen-
// Button), immer sichtbar - anders als die fruehere Version, die nur
// erschien, sobald bereits ein Update bekannt war. Ein Klick loest jetzt
// direkt einen Check aus (gleiche IPC wie der Button im Einstellungsfenster);
// ist bereits ein Update bekannt, oeffnet ein Klick stattdessen direkt das
// Update-Fenster. Gemeinsam von index.html/overview.html/trophies.html
// genutzt, analog zu theme.js.
(function () {
  function init() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'updateIndicatorBtn';
    btn.className = 'update-indicator-btn';
    btn.setAttribute('aria-label', 'Check for updates');
    document.body.appendChild(btn);

    const ICONS = { idle: '⟳', checking: '⟳', available: '⬆' };
    let knownState = 'idle'; // idle | checking | available (available deckt auch downloading/downloaded ab)

    function render() {
      btn.classList.toggle('checking', knownState === 'checking');
      btn.classList.toggle('update-available', knownState === 'available');
      btn.textContent = ICONS[knownState] || ICONS.idle;
      btn.title = knownState === 'available'
        ? 'Update available - click to install'
        : knownState === 'checking'
          ? 'Checking for updates…'
          : 'Check for updates';
    }
    render();

    // Kurzer Tooltip-Hinweis nach einem manuellen Check ohne Ergebnis
    // (schon aktuell / dev-mode / Fehler) - blendet sich von selbst wieder
    // auf den Normalzustand zurueck, statt dauerhaft anders auszusehen.
    let revertTimeoutId = null;
    function flashTooltip(text) {
      // render() zuerst, damit Icon/Klasse (z.B. "checking"-Drehung) sofort
      // auf den aktuellen knownState zurueckspringen, statt bis zum Timeout
      // unten weiterzulaufen - nur der Tooltip-Text bleibt kurz ueberschrieben.
      render();
      btn.title = text;
      if (revertTimeoutId) clearTimeout(revertTimeoutId);
      revertTimeoutId = setTimeout(() => { if (knownState !== 'available') render(); }, 3500);
    }

    btn.addEventListener('click', () => {
      if (knownState === 'available') {
        if (window.ttpMain && window.ttpMain.openUpdateWindow) window.ttpMain.openUpdateWindow();
        return;
      }
      if (!window.ttpMain || !window.ttpMain.checkForUpdatesNow) return;
      knownState = 'checking';
      render();
      window.ttpMain.checkForUpdatesNow();
    });

    function applyState(state) {
      const available = state === 'available' || state === 'downloading' || state === 'downloaded';
      knownState = available ? 'available' : (knownState === 'checking' ? 'checking' : 'idle');
      render();
    }

    if (!window.ttpMain) return;

    // Bei jedem (Neu-)Laden dieser Seite (auch nach Navigation zwischen den
    // Seiten) erst den aktuellen Stand abfragen, dann auf weitere Live-
    // Aenderungen hoeren - sonst waere ein bereits bekanntes Update nach
    // einer Seitennavigation faelschlich nicht mehr als verfuegbar markiert.
    if (window.ttpMain.getUpdateState) {
      window.ttpMain.getUpdateState().then(applyState);
    }
    if (window.ttpMain.onUpdateStatus) {
      window.ttpMain.onUpdateStatus(applyState);
    }

    if (window.ttpMain.onManualUpdateCheckStatus) {
      window.ttpMain.onManualUpdateCheckStatus((status, extra) => {
        if (status === 'checking') {
          knownState = 'checking';
          render();
        } else if (status === 'available') {
          knownState = 'available';
          render();
        } else if (status === 'not-available') {
          knownState = 'idle';
          flashTooltip('You are up to date.');
        } else if (status === 'dev-mode') {
          knownState = 'idle';
          flashTooltip('Not available in dev mode.');
        } else if (status === 'error') {
          knownState = 'idle';
          flashTooltip(`Check failed: ${extra || 'unknown error'}`);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
