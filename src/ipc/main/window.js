const { IPCEvents } = require('../../modules/constants');
const { ipcMain } = require('electron');

ipcMain.on(IPCEvents.GET_WINDOW_OPTIONS, (event) => {
   event.returnValue = event.sender.kernelWindowData;
});