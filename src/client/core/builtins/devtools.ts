import { filters, bulk } from '@webpack';
import { Locale } from '@webpack/common';

const Modules = bulk(
  filters.byString('devtools-closed'),
  filters.byProps('hideToken'),
  { wait: true }
);

export const data = {
  name: 'DevTools Warning',
  id: 'dev.devtoolsWarning',
  default: false,
  wait: false
};

export async function initialize() {
  await Modules;
  DiscordNative.window.setDevtoolsCallbacks(() => { }, () => { });
}

export async function shutdown() {
  const [setDevToolsCallback, Manager] = await Modules;
  setDevToolsCallback(Locale, Manager, DiscordNative);
}