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

const headers = {
   delete: [
      'x-frame-options',
      'content-security-policy',
      'content-security-policy-report-only'
   ],
   append: [
      {
         name: 'access-control-allow-origin',
         value: '*',
         exists: {
            name: 'access-control-allow-credentials',
            condition: false
         }
      }
   ]
}

electron.app.whenReady().then(() => {
   electron.app.on('browser-window-created', (_, win) => {
      win.webContents.session.webRequest.onHeadersReceived((opts, callback) => {
         const { responseHeaders } = opts;
         const orig = Object.keys(responseHeaders);

         for (let i = 0; i < headers.delete.length; i++) {
            const header = headers.delete[i];
            if (!header) continue;

            const name = orig.find(o => o.toLowerCase() === header.toLowerCase());
            if (!name) continue;

            delete responseHeaders[name];
         }

         for (let i = 0; i < headers.append.length; i++) {
            const data = headers.append[i];
            if (!data) continue;

            if (data.exists?.name) {
               const res = orig.find(r => r.toLowerCase() === data.exists.name);
               
               if (data.exists.condition !== Boolean(res)) {
                  continue;
               }
            }

            const name = orig.find(o => o.toLowerCase() === data.name.toLowerCase());
            if (!name) continue;

            responseHeaders[name] = data.value;
         }

         callback({ responseHeaders });
      });
   });
});