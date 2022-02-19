global.isUnbound = true;

const { readdirSync, copyFileSync, existsSync, unlinkSync, readFileSync } = require('fs');
const { join } = require('path');

const { uuid } = require('./src/modules/utilities');

const script = join(__dirname, 'unisolate', `unisolate-${process.platform}.node`);
const temp = join(__dirname, 'unisolate', `.unisolate.${uuid(10)}.node`);

if (!existsSync(script)) {
   throw new Error(`${process.platform} is not supported.`);
}

if (process.platform === 'win32') {
   try {
      const files = readdirSync(join(__dirname, 'unisolate'));

      for (const file of files) {
         if (file.indexOf('.unisolate.')) continue;
         try {
            unlinkSync(join(__dirname, 'unisolate', file));
         } catch { }
      }
   } catch { }
}

try {
   if (process.platform === 'win32') {
      copyFileSync(script, temp);
   }

   const exec = require(process.platform === 'win32' ? temp : script);

   exec.patch(readFileSync(join(__dirname, 'unisolate', 'unisolate.data')));
} catch (err) {
   console.error('Failed memory patching!', err);
}


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