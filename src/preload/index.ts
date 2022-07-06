import './compilers';
import './aliases';
import './fixes';

import { WebPreferences, ipcRenderer } from 'electron';
import { IPCEvents } from '@common/constants';
import { initialize } from '@webpack';

global.isUnbound = true;

interface WindowOptions {
  originalPreload: string;
  windowOptions: {
    webPreferences: WebPreferences;
  };
}

const { windowOptions }: WindowOptions = ipcRenderer.sendSync(IPCEvents.GET_WINDOW_OPTIONS);

if (!windowOptions.webPreferences.nativeWindowOpen) {
  window.__SPLASH__ = true;
  initialize().then(() => import('./splash'));
} else {
  window.__MAIN__ = true;
  initialize().then(() => import('@client'));
}



