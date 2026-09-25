const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ttpMain', {
  restoreFocus: () => ipcRenderer.send('restore-window-focus'),
  openSettings: () => ipcRenderer.send('open-settings'),
  openUpdateWindow: () => ipcRenderer.send('open-update-window'),
  getUpdateState: () => ipcRenderer.invoke('get-update-state'),
  onUpdateStatus: (callback) => {
    ipcRenderer.on('main-update-status', (event, state) => callback(state));
  },
  checkForUpdatesNow: () => ipcRenderer.send('check-for-updates-now'),
  onManualUpdateCheckStatus: (callback) => {
    ipcRenderer.on('manual-update-check-status', (event, status, extra) => callback(status, extra));
  },
  quitApp: () => ipcRenderer.send('app-quit')
});
