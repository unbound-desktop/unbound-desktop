const { ipcRenderer } = require('electron');
const alias = require('module-alias');
const path = require('path');

alias(path.resolve(__dirname, '..'));
require('./compilers');

const Webpack = require('@modules/webpack');

const { windowOptions } = ipcRenderer.sendSync('UNBOUND_GET_WINDOW_DATA');
if (!windowOptions.webPreferences.nativeWindowOpen) {
   window.__SPLASH__ = true;

   require('./splash');

   const Manager = require('@structures/manager');
   const Themes = new Manager('themes');
   Themes.loadAll();
}

Webpack.init().then(() => {
   const Unbound = require('@structures/unbound');

   global.unbound = new Unbound();
});