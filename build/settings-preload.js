const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ttpSettings', {
  getWindowInfo: () => ipcRenderer.invoke('settings-get-window-info'),
  setWindowSize: (width, height) => ipcRenderer.send('settings-set-window-size', { width, height }),
  closeWindow: () => ipcRenderer.send('settings-close')
});
