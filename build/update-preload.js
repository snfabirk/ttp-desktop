const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ttpUpdater', {
  onStatus: (callback) => {
    ipcRenderer.on('update-status', (event, state, payload) => callback(state, payload));
  },
  restartNow: () => ipcRenderer.send('update-restart-now'),
  later: () => ipcRenderer.send('update-later')
});
