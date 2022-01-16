const Patcher = require('#kernel/core/patchers/BrowserWindowPatcher');
const { ipcMain } = require('electron');

Patcher.patch('unbound', (_, [options]) => {
   options.webPreferences.contextIsolation = false;
   options.webPreferences.nodeIntegration = true;
});

ipcMain.on('UNBOUND_GET_WINDOW_DATA', (e) => e.returnValue = e.sender.kernelWindowData);