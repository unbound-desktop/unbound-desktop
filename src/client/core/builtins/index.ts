import { showConfirmModal } from '@api/modals';
import { createLogger } from '@common/logger';
import * as Settings from '@common/settings';
import { Locale } from '@webpack/common';
import * as BuiltIns from './registry';
import { debounce } from '@utilities';

const Logger = createLogger('Built-In');

const handleSettingsChange = debounce(onSettingsChange, 250);

interface SettingsChange {
   key: string;
   value: boolean;
}

interface BuiltInData {
   restart?: boolean;
   default: boolean;
   wait?: boolean;
   name: string,
   id: string,
}

interface Instance extends BuiltInData {
   initialize: Fn;
   shutdown: Fn;
   [key: string]: any;
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
         await instance.initialize?.();
      } else {
         instance.initialize?.();
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
         await instance.shutdown?.();
      } else {
         instance.shutdown?.();
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

   const [builtin, instance] = payload as unknown as [string, Instance];

   if (instance.data.restart) {
      return showConfirmModal({
         header: Locale.Messages.UNBOUND_RESTART,
         content: Locale.Messages.UNBOUND_RESTART_SETTING_DESC,
         confirmText: Locale.Messages.UNBOUND_RESTART,
         cancelText: Locale.Messages.CANCEL,
         onConfirm: () => window.location.reload()
      });
   };

   if (!value) {
      await stop(builtin);
   } else {
      await start(builtin);
   }
}