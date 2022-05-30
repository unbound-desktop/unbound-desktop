const { ipcRenderer } = require('electron');
const alias = require('module-alias');
const Module = require('module');
const path = require('path');

Module.globalPaths.push(path.resolve(__dirname, '..', 'node_modules'));

alias(path.resolve(__dirname, '..'));
require('./compilers');

global.isUnbound = true;

const Webpack = require('@modules/webpack');
const { IPCEvents } = require('@constants');

const { windowOptions } = ipcRenderer.sendSync(IPCEvents.GET_WINDOW_OPTIONS);
if (!windowOptions.webPreferences.nativeWindowOpen) {
   window.__SPLASH__ = true;

   require('./splash');

   const Manager = require('@structures/managers/entities');
   const Themes = new Manager('themes');
   Themes.loadAll();
}

Webpack.init().then(() => {
   const Unbound = require('@structures/unbound');
   const instance = new Unbound();

   instance.start();
});