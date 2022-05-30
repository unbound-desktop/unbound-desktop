global.isUnbound = true;

require('./nullbyte');
require('./src/ipc/main');

const WindowPatcher = require('#kernel/core/patchers/BrowserWindowPatcher');
const { IPCEvents } = require('./src/modules/constants');
const electron = require('electron');

WindowPatcher.patch('unbound', (options) => {
   options.webPreferences ??= {};

   if (options.webPreferences.preload?.includes('splashScreenPreload')) return;

   options.webPreferences.contextIsolation = false;
   options.webPreferences.nodeIntegration = true;
});

electron.ipcMain.on(IPCEvents.GET_WINDOW_OPTIONS, e => e.returnValue = e.sender.kernelWindowData);