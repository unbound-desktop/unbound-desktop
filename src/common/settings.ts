import { BuildInfo, Paths } from '@constants';
import { EventEmitter } from 'events';
import { debounce } from '@utilities';
import path from 'path';
import fs from 'fs';

const Events = new EventEmitter();
export const settings = {};

if (!fs.existsSync(Paths.storage)) {
   fs.mkdirSync(Paths.storage);
}

if (!fs.existsSync(Paths.settings)) {
   fs.mkdirSync(Paths.settings);
}

const folder = path.join(Paths.settings, BuildInfo.releaseChannel);
if (!fs.existsSync(folder)) fs.mkdirSync(folder);

const files = fs.readdirSync(folder).filter(f => f.endsWith('.json'));

for (const file of files) {
   const name = file.replace('.json', '');
   try {
      const data = require(path.resolve(folder, file));
      settings[name] = data;
   } catch {
      settings[name] = {};
   }
}

export function set(id: string, key: string, value: any): void {
   settings[id] ??= {};

   const data = {
      path: key.split('.'),
      res: settings[id]
   };

   for (let i = 0; i < data.path.length - 1; i++) {
      const segment = data.path[i];

      data.res[segment] ??= {};
      data.res = data.res[segment];
   }

   const prop = data.path[data.path.length - 1];

   if (value !== void 0) {
      data.res[prop] = value;
   } else {
      delete data.res[prop];
   }

   Events.emit('set', { id, key, value });
   Events.emit('change', { type: 'set', id, key, value });
}

export function toggle(id: string, key: string, defaultValue: boolean): void {
   const value = !(get(id, key) ?? defaultValue);
   settings[id] ??= {};

   const data = {
      path: key.split('.'),
      res: settings[id]
   };

   for (let i = 0; i < data.path.length - 1; i++) {
      const segment = data.path[i];

      data.res[segment] ??= {};
      data.res = data.res[segment];
   }

   const prop = data.path[data.path.length - 1];
   data.res[prop] = value;

   Events.emit('toggle', { id, key, value, defaultValue });
   Events.emit('change', { type: 'toggle', id, key, value, defaultValue });
}

export function get(id: string, key: string, defaultValue?: any): any {
   if (!settings[id]) {
      return defaultValue;
   }

   const data = {
      path: key.split('.'),
      res: settings[id]
   };

   for (let i = 0; i < data.path.length; i++) {
      const segment = data.path[i];
      data.res = data.res[segment];
      if (!data.res) break;
   }

   return data.res ?? defaultValue;
}

export function save({ id }) {
   if (!fs.existsSync(folder)) fs.mkdirSync(folder);

   try {
      const contents = JSON.stringify(settings[id], null, 2);
      fs.writeFileSync(path.join(folder, `${id}.json`), contents);
   } catch (e) {
      console.error(`Failed to save settings file for ${id}`, e);
   }
}

// Save settings to file on change
Events.on('change', debounce(save, 250));

export const prependOnceListener: typeof Events.prependOnceListener = Events.prependOnceListener.bind(Events);
export const prependListener: typeof Events.prependListener = Events.prependListener.bind(Events);
export const listeners: typeof Events.listeners = Events.listeners.bind(Events);
export const once: typeof Events.once = Events.once.bind(Events);
export const off: typeof Events.off = Events.off.bind(Events);
export const on: typeof Events.on = Events.on.bind(Events);