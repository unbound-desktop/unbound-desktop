global.isUnbound = true;

require('./nullbyte');
require('./src/ipc/main');

const WindowPatcher = require('#kernel/core/patchers/BrowserWindowPatcher');

WindowPatcher.patch('unbound', (options) => {
   options.webPreferences ??= {};

   if (options.webPreferences.preload?.includes('splashScreenPreload')) return;

   options.webPreferences.contextIsolation = false;
   options.webPreferences.nodeIntegration = true;
});