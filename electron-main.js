const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron');
const path = require('path');
const windowStateKeeper = require('electron-window-state');
const { autoUpdater } = require('electron-updater');

Menu.setApplicationMenu(null);

const ICON_PATH = path.join(__dirname, 'build', 'icon.ico');

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = false;

let updateWin = null;
let settingsWin = null;
let mainWin = null;
let serverPort = null;

function showUpdateWindow() {
  if (updateWin) return updateWin;
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
  // Ueber den lokalen Server (nicht loadFile) geladen, damit die Seite
  // dieselbe Origin wie das Hauptfenster hat und sich so das gewaehlte
  // Farbtheme (localStorage + theme.js) automatisch mit teilt/synchronisiert.
  updateWin.loadURL(`http://localhost:${serverPort}/update-window.html`);
  updateWin.on('closed', () => { updateWin = null; });
  return updateWin;
}

ipcMain.on('update-restart-now', () => autoUpdater.quitAndInstall());
ipcMain.on('update-later', () => { if (updateWin) updateWin.close(); });

function showSettingsWindow() {
  if (settingsWin) { settingsWin.focus(); return settingsWin; }
  settingsWin = new BrowserWindow({
    width: 460,
    height: 580,
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

autoUpdater.on('update-available', () => {
  const win = showUpdateWindow();
  win.webContents.once('did-finish-load', () => {
    win.webContents.send('update-status', 'downloading', { percent: 0 });
  });
});

autoUpdater.on('download-progress', (progress) => {
  if (updateWin) updateWin.webContents.send('update-status', 'downloading', { percent: progress.percent });
});

autoUpdater.on('update-downloaded', () => {
  const win = showUpdateWindow();
  win.webContents.send('update-status', 'ready');
});

autoUpdater.on('error', (err) => {
  // Kein Internet, GitHub nicht erreichbar etc. - App soll trotzdem normal
  // weiterlaufen, nur im Log sichtbar sein, kein Fenster fuer den Nutzer.
  console.error('Auto-update check failed:', err.message);
  if (updateWin) { updateWin.close(); }
});

function checkForUpdates() {
  if (!app.isPackaged) return; // im Dev-Modus (npm start) gibt es nichts zu pruefen
  autoUpdater.checkForUpdates().catch(err => {
    console.error('Auto-update check failed:', err.message);
  });
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

  const win = new BrowserWindow({
    x: winState.x,
    y: winState.y,
    width: winState.width,
    height: winState.height,
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
    // Update-Check erst NACH dem Hauptfenster starten, damit ein evtl.
    // vorhandenes Update-Fenster nie das allererste sichtbare Fenster des
    // Prozesses ist.
    win.webContents.once('did-finish-load', () => checkForUpdates());
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(PORT);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
