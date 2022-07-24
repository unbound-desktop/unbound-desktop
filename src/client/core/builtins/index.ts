import { createLogger } from '@common/logger';
import * as Settings from '@common/settings';
import * as BuiltIns from './registry';
import { debounce } from '@utilities';

const Logger = createLogger('Built-In');

const handleSettingsChange = debounce(onSettingsChange, 250);

interface SettingsChange {
   key: string;
   value: boolean;
}

const started: Record<string, boolean> = {};

export async function initialize() {
   Settings.on('change', handleSettingsChange);

   const builtins = Object.keys(BuiltIns);
   for (let i = 0; i < builtins.length; i++) {
      const name = builtins[i];
      await start(name);
   }
}

export async function shutdown() {
   Settings.off('change', handleSettingsChange);

   const builtins = Object.keys(BuiltIns);
   for (let i = 0; i < builtins.length; i++) {
      const name = builtins[i];
      await stop(name);
   }
}

export async function start(name: string) {
   const instance = BuiltIns[name];

   if (!Settings.get('unbound', instance.data.id, instance.data.default)) {
      return;
   }

   if (started[instance.data.id] || !instance) {
      return;
   }

   try {
      if (instance.data.wait) {
         await instance.initialize();
      } else {
         instance.initialize();
      }

      started[instance.data.id] = true;
      Logger.log(`${instance.data.name} was initialized.`);
   } catch (e) {
      Logger.error(`Failed to start ${instance.data.name}.`, e.message);
   }
}

export async function stop(name: string) {
   const instance = BuiltIns[name];

   if (!started[instance.data.id] || !instance) {
      return;
   }

   try {
      if (instance.data.wait) {
         await instance.shutdown();
      } else {
         instance.shutdown();
      }

      delete started[instance.data.id];
      Logger.log(`${instance.data.name} was stopped.`);
   } catch (e) {
      Logger.error(`Failed to stop ${instance.data.name}.`, e.message);
   }
}

async function onSettingsChange({ key, value }: SettingsChange) {
   const payload = Object.entries(BuiltIns).find(([, v]) => v.data.id === key);
   if (!payload) return;

   if (!value) {
      await stop(payload[0]);
   } else {
      await start(payload[0]);
   }
}