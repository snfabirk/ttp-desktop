const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const windowStateKeeper = require('electron-window-state');
const { autoUpdater } = require('electron-updater');

Menu.setApplicationMenu(null);

const ICON_PATH = path.join(__dirname, 'build', 'icon.ico');

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = false;

autoUpdater.on('update-downloaded', async () => {
  const { response } = await dialog.showMessageBox({
    type: 'info',
    title: 'Update verfuegbar',
    message: 'Eine neue Version wurde heruntergeladen. Jetzt installieren?',
    buttons: ['Jetzt neu starten', 'Spaeter'],
    defaultId: 0,
    cancelId: 1
  });
  if (response === 0) autoUpdater.quitAndInstall();
});

autoUpdater.on('error', (err) => {
  // Kein Internet, GitHub nicht erreichbar etc. - App soll trotzdem normal
  // weiterlaufen, nur im Log sichtbar sein.
  console.error('Auto-update check failed:', err.message);
});

function checkForUpdates() {
  if (!app.isPackaged) return; // im Dev-Modus (npm start) gibt es nichts zu pruefen
  autoUpdater.checkForUpdates().catch(err => {
    console.error('Auto-update check failed:', err.message);
  });
}

function createWindow(port) {
  // Merkt sich Groesse/Position im userData-Ordner und stellt sie beim
  // naechsten Start wieder her - nur beim allerersten Start (keine
  // gespeicherte Position) wird das Fenster stattdessen zentriert geoeffnet.
  const winState = windowStateKeeper({ defaultWidth: 1400, defaultHeight: 960 });
  const isFirstRun = winState.x === undefined;

  const win = new BrowserWindow({
    x: winState.x,
    y: winState.y,
    width: winState.width,
    height: winState.height,
    title: 'Three-Trick-Pony',
    autoHideMenuBar: true,
    icon: ICON_PATH
  });

  winState.manage(win);
  if (isFirstRun) win.center();

  win.loadURL(`http://localhost:${port}`);
}

app.whenReady().then(() => {
  // Startet den Express-Server im selben Prozess (kein sichtbares Fenster,
  // keine .bat mehr noetig) und oeffnet das App-Fenster erst, wenn er bereit ist.
  const { ready, PORT } = require('./server/server.js');
  ready.then(() => {
    createWindow(PORT);
    checkForUpdates();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(PORT);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
