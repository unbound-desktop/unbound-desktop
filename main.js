global.isUnbound = true;

require('./nullbyte');
require('./src/ipc/main');

const WindowPatcher = require('#kernel/core/patchers/BrowserWindowPatcher');
const electron = require('electron');

WindowPatcher.patch('unbound', (options) => {
   options.webPreferences ??= {};

   if (options.webPreferences.preload?.includes('splashScreenPreload')) return;

   options.webPreferences.contextIsolation = false;
   options.webPreferences.nodeIntegration = true;
});

electron.app.whenReady().then(() => {
   electron.app.on('browser-window-created', (_, win) => {
      win.webContents.session.webRequest.onHeadersReceived((opts, callback) => {
         const { responseHeaders } = opts;

         delete responseHeaders['x-frame-options'];
         delete responseHeaders['content-security-policy'];
         delete responseHeaders['content-security-policy-report-only'];

         responseHeaders['access-control-allow-origin'] = '*';

         callback({ responseHeaders });
      });
   });
});