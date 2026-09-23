const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ttpMain', {
  restoreFocus: () => ipcRenderer.send('restore-window-focus'),
  openSettings: () => ipcRenderer.send('open-settings'),
  openUpdateWindow: () => ipcRenderer.send('open-update-window'),
  getUpdateState: () => ipcRenderer.invoke('get-update-state'),
  onUpdateStatus: (callback) => {
    ipcRenderer.on('main-update-status', (event, state) => callback(state));
  },
  quitApp: () => ipcRenderer.send('app-quit')
});
