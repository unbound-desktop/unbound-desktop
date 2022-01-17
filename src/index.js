const { ipcRenderer } = require('electron');
const alias = require('module-alias');
const path = require('path');

alias(path.resolve(__dirname, '..'));
require('./compilers');
require('./fixes');

const Unbound = require('@structures/unbound');
const Webpack = require('@modules/webpack');


const { windowOptions } = ipcRenderer.sendSync('UNBOUND_GET_WINDOW_DATA');

if (!windowOptions.webPreferences.nativeWindowOpen) {
   window.__SPLASH__ = true;
   require('@managers/themes');
}

Webpack.ready.then(() => window.unbound = new Unbound());