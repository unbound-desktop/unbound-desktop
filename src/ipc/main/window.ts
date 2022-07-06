import type { BrowserWindowConstructorOptions, WebContents } from 'electron';

import { IPCEvents } from '@common/constants';
import { ipcMain } from 'electron';

interface PatchedWebContents extends WebContents {
  kernelWindowData: {
    originalPreload: string;
    windowOptions: BrowserWindowConstructorOptions;
  };
}

ipcMain.on(IPCEvents.GET_WINDOW_OPTIONS, (event) => {
  const { kernelWindowData } = event.sender as PatchedWebContents;
  event.returnValue = kernelWindowData;
});