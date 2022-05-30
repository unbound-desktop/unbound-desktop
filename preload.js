const { IPCEvents } = require('./src/modules/constants');
const { ipcRenderer } = require('electron');

const { windowOptions } = ipcRenderer.sendSync(IPCEvents.GET_WINDOW_OPTIONS);
if (!window.require && windowOptions.webPreferences.nativeWindowOpen) {
   ipcRenderer.invoke(IPCEvents.PROCESS_ISOLATED);
} else {
   require('./src/index');
   require('./src/fixes');
}
