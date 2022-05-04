global.isUnbound = true;

require('./unisolate');
require('./src/ipc/main');

const WindowPatcher = require('#kernel/core/patchers/BrowserWindowPatcher');
const electron = require('electron');

WindowPatcher.patch('unbound', (options) => {
   options.webPreferences ??= {};
   options.webPreferences.contextIsolation = false;
   options.webPreferences.nodeIntegration = true;
});

electron.ipcMain.on('UNBOUND_GET_WINDOW_DATA', e => e.returnValue = e.sender.kernelWindowData);
