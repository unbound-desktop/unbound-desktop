import { patch } from '#kernel/core/patchers/BrowserWindowPatcher';
import { BrowserWindowConstructorOptions } from 'electron';
import * as CSP from './csp';

global.isUnbound = true;

require('./nullbyte');
require('../ipc/main');

patch('unbound', (options: BrowserWindowConstructorOptions) => {
  if (options.webPreferences?.preload?.includes('splash')) return;
  if (global.__ABORT__) return;

  options.webPreferences ??= {};
  options.webPreferences.contextIsolation = false;
  options.webPreferences.nodeIntegration = true;
});

try {
  CSP.remove();
} catch {
  console.error('Failed to remove CSP, expect issues.');
}