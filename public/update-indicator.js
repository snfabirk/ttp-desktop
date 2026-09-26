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

    // Kleine, dismissbare Sprechblase unterhalb des Buttons - reines Icon
    // allein wird leicht uebersehen, siehe explizite Nutzeranfrage. Zeigt sich
    // automatisch, sobald ein Update erkannt wird, bleibt aber weg, wenn der
    // Nutzer sie fuer GENAU dieses eine gefundene Update schon per X
    // weggeklickt hat (persistiert in localStorage, ueberlebt also auch
    // Seitennavigation) - wird erst wieder scharf, sobald der Zustand
    // zwischendurch mal wieder "idle" war (also fuer das NAECHSTE Update).
    const TOAST_DISMISS_KEY = 'ttp_update_toast_dismissed_for';
    let toastEl = null;

    function removeToast() {
      if (toastEl) { toastEl.remove(); toastEl = null; }
    }

    function dismissToast() {
      removeToast();
      try { localStorage.setItem(TOAST_DISMISS_KEY, 'available'); } catch (e) {}
    }

    function showToast() {
      if (toastEl) return;
      toastEl = document.createElement('div');
      toastEl.className = 'update-toast';
      toastEl.innerHTML = `
        <button type="button" class="update-toast-close" aria-label="Dismiss">×</button>
        <div class="update-toast-text">Update available</div>
      `;
      document.body.appendChild(toastEl);
      toastEl.querySelector('.update-toast-close').addEventListener('click', (ev) => {
        ev.stopPropagation();
        dismissToast();
      });
      // Ein Frame verzoegern, damit die CSS-Transition (opacity/transform)
      // wirklich von der Startposition aus einblendet statt sofort fertig
      // dazustehen.
      requestAnimationFrame(() => { if (toastEl) toastEl.classList.add('visible'); });
    }

    function syncToast() {
      if (knownState !== 'available') {
        // Zustand ist wieder "idle" (Update installiert & neu gestartet, oder
        // noch nie eins gefunden) - Dismiss-Merker zuruecksetzen, damit das
        // NAECHSTE gefundene Update wieder eine frische Sprechblase zeigt.
        try { localStorage.removeItem(TOAST_DISMISS_KEY); } catch (e) {}
        removeToast();
        return;
      }
      let dismissed = false;
      try { dismissed = localStorage.getItem(TOAST_DISMISS_KEY) === 'available'; } catch (e) {}
      if (!dismissed) showToast();
    }

    function render() {
      btn.classList.toggle('checking', knownState === 'checking');
      btn.classList.toggle('update-available', knownState === 'available');
      btn.textContent = ICONS[knownState] || ICONS.idle;
      btn.title = knownState === 'available'
        ? 'Update available - click to install'
        : knownState === 'checking'
          ? 'Checking for updates…'
          : 'Check for updates';
      // syncToast() wird bewusst NICHT von hier aus aufgerufen: render() laeuft
      // auch fuer den allerersten, synchronen Bootstrap-Aufruf unten (bevor die
      // echte async getUpdateState()-Antwort da ist, mit knownState noch auf
      // dem Platzhalter "idle") und fuer den optimistischen "checking"-Klick-
      // Zustand - beides ist KEIN bestaetigtes "kein Update"-Ergebnis. Wuerde
      // syncToast() hier mitlaufen, wuerde der Dismiss-Merker bei JEDER
      // Seitennavigation sofort wieder geloescht, noch bevor die echte
      // Antwort ankommt, und die Sprechblase erschiene trotz Wegklicken immer
      // wieder. Stattdessen rufen nur die Stellen unten, die einen ECHTEN
      // bestaetigten Stand vom Hauptprozess kennen, syncToast() explizit auf.
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
        dismissToast();
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
      // Reflektiert immer einen echten, vom Hauptprozess bestaetigten Stand
      // (sowohl der initiale getUpdateState()-Abruf als auch jeder Live-Push
      // via onUpdateStatus) - hier IST syncToast() sicher.
      syncToast();
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
          syncToast();
        } else if (status === 'not-available') {
          knownState = 'idle';
          flashTooltip('You are up to date.');
          syncToast();
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
