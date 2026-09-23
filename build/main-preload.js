const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ttpMain', {
  restoreFocus: () => ipcRenderer.send('restore-window-focus'),
  openSettings: () => ipcRenderer.send('open-settings')
});
