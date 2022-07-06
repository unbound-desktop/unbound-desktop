import { Headers } from '@constants';
import { app } from 'electron';

export function remove() {
  app.on('browser-window-created', (e, window) => {
    const { session } = window.webContents;

    session.webRequest.onHeadersReceived((opts, callback) => {
      const { responseHeaders } = opts;
      const orig = Object.keys(responseHeaders);

      for (let i = 0; i < Headers.delete.length; i++) {
        const header = Headers.delete[i];
        if (!header) continue;

        const name = orig.find(o => o.toLowerCase() === header.toLowerCase());
        if (!name) continue;

        delete responseHeaders[name];
      }

      for (let i = 0; i < Headers.append.length; i++) {
        const data = Headers.append[i];
        if (!data) continue;

        if (data.exists?.name) {
          const res = orig.find(r => r.toLowerCase() === data.exists.name);

          if (data.exists.condition !== Boolean(res)) {
            continue;
          }
        }

        const name = orig.find(o => o.toLowerCase() === data.name.toLowerCase());
        if (!name) continue;

        responseHeaders[name] = [data.value];
      }

      callback({ responseHeaders });
    });
  });
};