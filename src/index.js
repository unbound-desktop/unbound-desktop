const { ipcRenderer } = require('electron');
const alias = require('module-alias');
const Module = require('module');
const path = require('path');

Module.globalPaths.push(path.resolve(__dirname, '..', 'node_modules'));

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

   new Unbound().start();
});