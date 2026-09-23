const { app, BrowserWindow, Menu, Tray, ipcMain, screen } = require('electron');
const path = require('path');
const windowStateKeeper = require('electron-window-state');
const { autoUpdater } = require('electron-updater');

Menu.setApplicationMenu(null);

const ICON_PATH = path.join(__dirname, 'build', 'icon.ico');

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = false;

// Nur eine laufende Instanz gleichzeitig - wichtig jetzt, wo die App per
// Autostart UND manuell gestartet werden kann: ohne Sperre wuerde ein
// zweiter Prozess versuchen, denselben Server-Port zu belegen (EADDRINUSE).
// Ein zweiter Start-Versuch zeigt stattdessen einfach das Fenster der schon
// laufenden Instanz.
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
  return;
}

let updateWin = null;
let settingsWin = null;
let mainWin = null;
let tray = null;
let serverPort = null;

// Wird nur beim echten Beenden (Tray-Menu "Quit" oder der Beenden-Button in
// der App) auf true gesetzt - unterscheidet "Fenster-X gedrueckt" (soll nur
// verstecken) von einem tatsaechlich gewollten kompletten Beenden.
app.isQuitting = false;

function showMainWindow() {
  if (!mainWin || mainWin.isDestroyed()) {
    if (serverPort) createWindow(serverPort);
    return;
  }
  if (mainWin.isMinimized()) mainWin.restore();
  mainWin.show();
  mainWin.focus();
}

app.on('second-instance', () => showMainWindow());

function createTray() {
  tray = new Tray(ICON_PATH);
  tray.setToolTip('Three-Trick-Pony');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open', click: () => showMainWindow() },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } }
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('click', () => showMainWindow());
}

ipcMain.on('app-quit', () => { app.isQuitting = true; app.quit(); });

ipcMain.handle('get-start-with-windows', () => app.getLoginItemSettings().openAtLogin);

ipcMain.on('set-start-with-windows', (event, enabled) => {
  // --hidden sorgt dafuer, dass die App bei einem per Autostart ausgeloesten
  // Start nicht sofort das Fenster aufreisst, sondern nur im Tray erscheint
  // (siehe createWindow weiter unten).
  app.setLoginItemSettings({ openAtLogin: Boolean(enabled), args: ['--hidden'] });
});

// Aktueller Update-Stand, unabhaengig davon ob das Update-Fenster gerade
// offen ist - wird gebraucht, damit (a) das kleine Update-Symbol im
// Hauptfenster den richtigen Zustand zeigt, auch nach einer Seiten-
// navigation (index.html <-> overview.html, frisch geladenes DOM/Skript),
// und (b) ein neu geoeffnetes Update-Fenster sofort den richtigen Stand
// zeigt statt bei 0% neu zu starten.
let updateState = 'none'; // 'none' | 'available' | 'downloading' | 'downloaded'
let updateProgressPercent = 0;

function notifyMainWindowUpdateStatus(state) {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.webContents.send('main-update-status', state);
  }
  // Auch das Einstellungsfenster braucht den Stand, damit der "Check for
  // Updates"-Button dort live zu "Update Now" wechseln kann, sobald ein
  // Update gefunden wird - unabhaengig davon, wer den Check ausgeloest hat.
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.webContents.send('main-update-status', state);
  }
}

function pushCurrentStateToUpdateWindow(win) {
  if (updateState === 'available' || updateState === 'downloading') {
    win.webContents.send('update-status', 'downloading', { percent: updateProgressPercent });
  } else if (updateState === 'downloaded') {
    win.webContents.send('update-status', 'ready');
  }
}

function showUpdateWindow() {
  if (updateWin) { updateWin.focus(); return updateWin; }
  updateWin = new BrowserWindow({
    width: 380,
    height: 230,
    resizable: false,
    minimizable: false,
    maximizable: false,
    center: true,
    frame: false,
    show: false,
    title: 'Three-Trick-Pony Update',
    icon: ICON_PATH,
    webPreferences: {
      preload: path.join(__dirname, 'build', 'update-preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  updateWin.once('ready-to-show', () => updateWin.show());
  updateWin.webContents.once('did-finish-load', () => pushCurrentStateToUpdateWindow(updateWin));
  // Ueber den lokalen Server (nicht loadFile) geladen, damit die Seite
  // dieselbe Origin wie das Hauptfenster hat und sich so das gewaehlte
  // Farbtheme (localStorage + theme.js) automatisch mit teilt/synchronisiert.
  updateWin.loadURL(`http://localhost:${serverPort}/update-window.html`);
  updateWin.on('closed', () => { updateWin = null; });
  return updateWin;
}

ipcMain.on('update-restart-now', () => autoUpdater.quitAndInstall());
ipcMain.on('update-later', () => { if (updateWin) updateWin.close(); });
// Das kleine Update-Symbol im Hauptfenster oeffnet das eigentliche
// Update-Fenster erst bei Klick - siehe autoUpdater-Events weiter unten,
// die das Fenster nicht mehr automatisch aufreissen.
ipcMain.on('open-update-window', () => showUpdateWindow());
ipcMain.handle('get-update-state', () => updateState);

// Manueller "Check for Updates"-Button im Einstellungsfenster - merkt sich,
// welches Fenster den Check angefordert hat, um genau dorthin (und nur
// dorthin) eine Antwort zu schicken, sobald das Ergebnis feststeht (die
// autoUpdater-Events feuern global, nicht pro Anfrage).
let manualCheckWin = null;

function replyManualCheck(status, extra) {
  if (manualCheckWin && !manualCheckWin.isDestroyed()) {
    manualCheckWin.webContents.send('manual-update-check-status', status, extra);
  }
  manualCheckWin = null;
}

ipcMain.on('check-for-updates-now', (event) => {
  manualCheckWin = BrowserWindow.fromWebContents(event.sender);
  if (!app.isPackaged) {
    replyManualCheck('dev-mode');
    return;
  }
  if (manualCheckWin && !manualCheckWin.isDestroyed()) {
    manualCheckWin.webContents.send('manual-update-check-status', 'checking');
  }
  checkForUpdates();
});

function showSettingsWindow() {
  if (settingsWin) { settingsWin.focus(); return settingsWin; }
  settingsWin = new BrowserWindow({
    width: 460,
    height: 725,
    resizable: false,
    minimizable: false,
    maximizable: false,
    parent: mainWin || undefined,
    title: 'Settings',
    icon: ICON_PATH,
    webPreferences: {
      preload: path.join(__dirname, 'build', 'settings-preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  settingsWin.loadURL(`http://localhost:${serverPort}/settings.html`);
  settingsWin.on('closed', () => { settingsWin = null; });
  return settingsWin;
}

ipcMain.on('open-settings', () => showSettingsWindow());
ipcMain.on('settings-close', () => { if (settingsWin) settingsWin.close(); });

ipcMain.handle('settings-get-window-info', () => {
  if (!mainWin) return { width: 1400, height: 960, screenWidth: 1920, screenHeight: 1080 };
  const bounds = mainWin.getBounds();
  const display = screen.getDisplayMatching(bounds);
  return {
    width: bounds.width,
    height: bounds.height,
    screenWidth: display.workArea.width,
    screenHeight: display.workArea.height
  };
});

ipcMain.on('settings-set-window-size', (event, { width, height }) => {
  if (!mainWin) return;
  const w = Math.round(Number(width));
  const h = Math.round(Number(height));
  if (w > 0 && h > 0) mainWin.setSize(w, h);
});

// Electron/Chromium-Eigenheit: nach einem nativen window.confirm()/alert()
// verliert das BrowserWindow manchmal den echten OS-Tastaturfokus - Text-
// Eingabefelder reagieren dann nicht mehr, bis das Fenster ihn explizit
// zurueckbekommt. window.focus() im Renderer reicht dafuer nicht zuverlaessig;
// win.blur()+win.focus() auf Electron-Ebene schon.
ipcMain.on('restore-window-focus', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.blur();
    win.focus();
  }
});

// Kein automatisches Aufreissen des Update-Fensters mehr (war bei einem im
// Hintergrund laufenden periodischen Check zu aufdringlich) - stattdessen
// nur ein kleines Symbol im Hauptfenster (siehe public/update-indicator.js),
// das der Nutzer anklicken kann, wann es ihm passt. Heruntergeladen wird
// trotzdem sofort im Hintergrund (autoDownload = true oben).
autoUpdater.on('update-available', () => {
  updateState = 'available';
  notifyMainWindowUpdateStatus('available');
  replyManualCheck('available');
});

autoUpdater.on('update-not-available', () => {
  replyManualCheck('not-available');
});

autoUpdater.on('download-progress', (progress) => {
  updateState = 'downloading';
  updateProgressPercent = progress.percent;
  if (updateWin) updateWin.webContents.send('update-status', 'downloading', { percent: progress.percent });
});

autoUpdater.on('update-downloaded', () => {
  updateState = 'downloaded';
  notifyMainWindowUpdateStatus('downloaded');
  if (updateWin) updateWin.webContents.send('update-status', 'ready');
});

autoUpdater.on('error', (err) => {
  // Kein Internet, GitHub nicht erreichbar etc. - App soll trotzdem normal
  // weiterlaufen, nur im Log sichtbar sein, kein Fenster fuer den Nutzer.
  console.error('Auto-update check failed:', err.message);
  if (updateWin) { updateWin.close(); }
  replyManualCheck('error', err.message);
});

function checkForUpdates() {
  if (!app.isPackaged) return; // im Dev-Modus (npm start) gibt es nichts zu pruefen
  autoUpdater.checkForUpdates().catch(err => {
    console.error('Auto-update check failed:', err.message);
  });
}

// Zusaetzlich zum Check beim Start: alle paar Stunden erneut pruefen, damit
// ein Update auch bemerkt wird, wenn die App tagelang durchlaeuft (PC nur im
// Standby statt neu gestartet). Kein sekuendliches/minuetliches Pollen -
// und sobald einmal ein Update bekannt ist, wird nicht weiter nachgefragt
// (bis zum naechsten echten App-Neustart), da sich der Stand bis zum
// Neustart/Installieren ohnehin nicht mehr aendert.
const PERIODIC_UPDATE_CHECK_MS = 4 * 60 * 60 * 1000; // alle 4 Stunden
function periodicCheckForUpdates() {
  if (updateState !== 'none') return;
  checkForUpdates();
}

// Hintergrund-Aktualisierung von Stats/LP alle 15 Minuten - laeuft im
// Hauptprozess, damit es KEINEN Unterschied macht ob das Fenster gerade
// offen, versteckt (Tray) oder auf einer anderen Seite (index.html statt
// overview.html) ist. localStorage liegt zwar im Renderer, ist aber
// Origin- nicht Seiten-gebunden, deshalb funktioniert das Auslesen ueber
// executeJavaScript unabhaengig davon, welche der beiden Seiten gerade
// geladen ist. Die eigentliche Datenabfrage laeuft direkt gegen den lokalen
// Server (Node-fetch), ganz ohne dass irgendeine Seite sichtbar sein muss -
// das aktualisiert einfach den Server-seitigen Match-Cache/Rank-Verlauf,
// den die UI beim naechsten Anzeigen dann vorfindet.
let backgroundRefreshInProgress = false;

async function readChallengeStateFromRenderer() {
  if (!mainWin || mainWin.isDestroyed()) return null;
  try {
    const raw = await mainWin.webContents.executeJavaScript(`
      JSON.stringify({
        since: localStorage.getItem('ttp_challenge_start') || '',
        summoner: localStorage.getItem('ttp_summoner_name') || '',
        champsRaw: localStorage.getItem('ttp_selected_champs') || '[]'
      })
    `);
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

async function backgroundStatsRefresh() {
  if (backgroundRefreshInProgress || !serverPort) return;

  const state = await readChallengeStateFromRenderer();
  if (!state || !state.since) return; // keine laufende Challenge - nichts zu tun

  const summonerParts = state.summoner.trim().split('#');
  if (summonerParts.length !== 2 || !summonerParts[0] || !summonerParts[1]) return;

  let champs;
  try { champs = JSON.parse(state.champsRaw); } catch (e) { champs = []; }
  const champsWithKeys = Array.isArray(champs)
    ? champs.map(c => ({ key: c.key, role: c.role || '' })).filter(c => c.key)
    : [];
  if (champsWithKeys.length === 0) return;

  backgroundRefreshInProgress = true;
  try {
    const base = `http://localhost:${serverPort}`;
    const accountParams = new URLSearchParams({ gameName: summonerParts[0], tagLine: summonerParts[1] });
    const accountRes = await fetch(`${base}/api/account?${accountParams}`);
    const accountData = await accountRes.json();
    if (!accountRes.ok) return;

    const startRes = await fetch(`${base}/api/summary-batch/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ puuid: accountData.puuid, champions: champsWithKeys, since: state.since })
    });
    const startData = await startRes.json();
    if (!startRes.ok) return;

    // Auf denselben Job warten wie beim manuellen Laden (overview.html
    // pollJobUntilDone), nur ohne UI - mit Sicherheitsnetz gegen eine
    // theoretische Endlosschleife, falls der Job nie fertig wird.
    for (let attempt = 0; attempt < 200; attempt++) {
      const statusRes = await fetch(`${base}/api/summary-batch/status/${startData.jobId}`);
      const status = await statusRes.json();
      if (!statusRes.ok || status.status === 'error' || status.status === 'done') break;
      await new Promise(r => setTimeout(r, 600));
    }
  } catch (e) {
    console.error('Background stats refresh failed:', e.message);
  } finally {
    backgroundRefreshInProgress = false;
  }
}

const QUARTER_HOUR_MS = 15 * 60 * 1000;
let statsRefreshTimeoutId = null;

// Exakt auf die naechste volle Viertelstunde (:00/:15/:30/:45) ausgerichtet,
// genau wie zuvor in overview.html - jetzt aber zentral im Hauptprozess,
// unabhaengig von jeder einzelnen Seite.
function scheduleNextBackgroundStatsRefresh() {
  if (statsRefreshTimeoutId) clearTimeout(statsRefreshTimeoutId);
  const now = new Date();
  const msIntoHour = (now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds();
  const msIntoQuarter = msIntoHour % QUARTER_HOUR_MS;
  const delay = QUARTER_HOUR_MS - msIntoQuarter;
  statsRefreshTimeoutId = setTimeout(async () => {
    await backgroundStatsRefresh();
    scheduleNextBackgroundStatsRefresh();
  }, delay);
}

function createWindow(port) {
  // Beim allerersten Start (keine gespeicherte Groesse/Position) ist die
  // Standardgroesse 70% Breite x 80% Hoehe der Bildschirmarbeitsflaeche statt
  // fixer Pixelwerte - so passt es auch auf kleineren/groesseren Monitoren.
  //
  // Ultrawide-Ausnahme: 70% Breite eines 21:9/32:9-Monitors waere absurd
  // breit fuer eine App wie diese. Deshalb wird die Breite zusaetzlich auf
  // ein maximales Seitenverhaeltnis (relativ zur bereits berechneten Hoehe)
  // gedeckelt - auf einem normalen 16:9-Monitor greift dieser Deckel nicht
  // (70% Breite ist dort ohnehin schmaler als das Cap), auf einem Ultrawide-
  // Monitor verhindert er ein unnatuerlich breites Fenster.
  const MAX_ASPECT_RATIO = 16 / 9;
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const defaultHeight = Math.round(screenHeight * 0.8);
  const uncappedWidth = Math.round(screenWidth * 0.7);
  const defaultWidth = Math.min(uncappedWidth, Math.round(defaultHeight * MAX_ASPECT_RATIO));

  // Merkt sich Groesse/Position im userData-Ordner und stellt sie beim
  // naechsten Start wieder her - nur beim allerersten Start (keine
  // gespeicherte Position) wird das Fenster stattdessen zentriert geoeffnet.
  const winState = windowStateKeeper({ defaultWidth, defaultHeight });
  const isFirstRun = winState.x === undefined;

  const windowTitle = `Three-Trick-Pony ${app.getVersion()}`;

  // Beim Windows-Autostart (--hidden, siehe set-start-with-windows) soll die
  // App nur im Tray erscheinen, nicht sofort das Fenster aufreissen.
  const startHidden = process.argv.includes('--hidden');

  const win = new BrowserWindow({
    x: winState.x,
    y: winState.y,
    width: winState.width,
    height: winState.height,
    show: !startHidden,
    title: windowTitle,
    autoHideMenuBar: true,
    icon: ICON_PATH,
    webPreferences: {
      preload: path.join(__dirname, 'build', 'main-preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Die geladene Seite hat einen eigenen <title> ("League of Legends"), der
  // sonst den hier gesetzten Fenstertitel ueberschreiben wuerde.
  win.on('page-title-updated', (event) => {
    event.preventDefault();
    win.setTitle(windowTitle);
  });

  // Fenster-X schliesst nicht wirklich - die App laeuft im Tray weiter, bis
  // ueber den Beenden-Button in der App oder das Tray-Menu "Quit" wirklich
  // beendet wird (app.isQuitting). So bleibt der Hintergrund-Scheduler
  // (Stats/LP alle 15min, Update-Check alle 4h) durchgehend aktiv.
  win.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });

  winState.manage(win);
  if (isFirstRun) win.center();

  win.loadURL(`http://localhost:${port}`);
  win.on('closed', () => { if (mainWin === win) mainWin = null; });
  mainWin = win;
  return win;
}

app.whenReady().then(() => {
  // Sagt dem Server, wo er den Riot API Key update-fest speichern soll
  // (ausserhalb des Installationsordners, der bei jedem Auto-Update
  // komplett neu geschrieben wird - siehe server/lib/envStore.js).
  process.env.TTP_USER_DATA_DIR = app.getPath('userData');

  // Startet den Express-Server im selben Prozess (kein sichtbares Fenster,
  // keine .bat mehr noetig) und oeffnet das App-Fenster erst, wenn er bereit ist.
  const { ready, PORT } = require('./server/server.js');
  serverPort = PORT;
  ready.then(() => {
    const win = createWindow(PORT);
    createTray();
    // Update-Check erst NACH dem Hauptfenster starten, damit ein evtl.
    // vorhandenes Update-Fenster nie das allererste sichtbare Fenster des
    // Prozesses ist.
    win.webContents.once('did-finish-load', () => checkForUpdates());
    setInterval(periodicCheckForUpdates, PERIODIC_UPDATE_CHECK_MS);
    scheduleNextBackgroundStatsRefresh();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(PORT);
    else showMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
