global.isUnbound = true;

require('./unisolate');

const Patcher = require('#kernel/core/patchers/BrowserWindowPatcher');
const electron = require('electron');

const orig = electron.app.commandLine.appendSwitch;
electron.app.commandLine.appendSwitch = (...args) => {
   const [key, value] = args;
   if (key == 'disable-features') {
      args[1] = `${value},HardwareMediaKeyHandling,HardMediaSessionService,Vulkan`;
   } else if (key == 'enable-features') {
      args[1] = `${value},BackForwardCache:TimeToLiveInBackForwardCacheInSeconds/300/should_ignore_blocklists/true/enable_same_site/true,ThrottleDisplayNoneAndVisibilityHiddenCrossOriginIframes,UseSkiaRenderer,WebAssemblyLazyCompilation`;
   }

   return orig(...args);
};

Patcher.patch('unbound', (_, [options]) => {
   options.webPreferences.contextIsolation = false;
   options.webPreferences.nodeIntegration = true;
});

electron.ipcMain.on('UNBOUND_GET_WINDOW_DATA', (e) => e.returnValue = e.sender.kernelWindowData);