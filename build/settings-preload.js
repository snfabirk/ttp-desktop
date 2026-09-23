const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ttpSettings', {
  getWindowInfo: () => ipcRenderer.invoke('settings-get-window-info'),
  setWindowSize: (width, height) => ipcRenderer.send('settings-set-window-size', { width, height }),
  closeWindow: () => ipcRenderer.send('settings-close'),
  checkForUpdatesNow: () => ipcRenderer.send('check-for-updates-now'),
  onManualUpdateCheckStatus: (callback) => {
    ipcRenderer.on('manual-update-check-status', (event, status, extra) => callback(status, extra));
  }
});
