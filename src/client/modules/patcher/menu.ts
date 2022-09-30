import { createLogger } from '@common/logger';
import { forceRender } from '@utilities';
import * as Webpack from '@webpack';
import Patcher from '.';

const Logger = createLogger('Patcher', 'Menu');

export const patches = {};

export function before(caller: string, menu: string, callback: Fn) {
   validateArguments(caller, menu, callback);
   push('before', caller, menu, callback);
}

export function after(caller: string, menu: string, callback: Fn) {
   validateArguments(caller, menu, callback);
   push('after', caller, menu, callback);
}

export function instead(caller: string, menu: string, callback: Fn) {
   validateArguments(caller, menu, callback);
   push('instead', caller, menu, callback);
}

export function create(caller) {
   return {
      before: (menu: string, callback: Fn) => before(caller, menu, callback),
      after: (menu: string, callback: Fn) => after(caller, menu, callback),
      instead: (menu: string, callback: Fn) => instead(caller, menu, callback),
      unpatchAll: () => unpatchAll(caller)
   };
}

export function unpatchAll(caller: string) {
   for (const menu in patches) {
      const collection = patches[menu];
      patches[menu] = collection.filter(e => e.caller !== caller);
   }

   return Patcher.unpatchAll(caller);
}

function validateArguments(caller: string, menu: string, callback: Fn) {
   if (!caller || typeof caller !== 'string') {
      throw new TypeError('first argument caller does not exist or is not of type string');
   } else if (!menu || typeof menu !== 'string') {
      throw new TypeError('second argument menu does not exist or is not of type string');
   } else if (!callback || typeof callback !== 'function') {
      throw new TypeError('third argument callback does not exist or is not of type function');
   }
}

function push(type: string, caller: string, menu: string, callback: Fn) {
   patches[menu] ??= [];
   patches[menu].push({
      type,
      caller,
      menu,
      callback,
      applied: false,
   });
}

function handleMenu(props, render) {
   let res = render(props);

   try {
      // Detect non-wrapped context menus
      if (res.type.displayName?.endsWith('ContextMenu')) {
         const displayName = res.type?.displayName;
         const pending = patches[displayName];
         if (!pending?.length) return res;

         for (const patch of pending) {
            Patcher[patch.type](patch.caller, res, 'type', (_, args, res) => {
               try {
                  return patch.callback.apply(_, [_, args, res]);
               } catch (e) {
                  Logger.error(`Failed to run context menu patch on ${displayName} of caller ${patch.caller}.`, e);
               }
            }, true);
         }

         return res;
      }

      const payload = forceRender(res.type)(res.props);
      if (!payload) return res;

      // Detect context menus only wrapped once
      const menu = payload.props.children;
      if (menu.type?.displayName?.endsWith('ContextMenu')) {
         const displayName = menu.type?.displayName;
         const pending = patches[displayName];
         if (!pending?.length) return res;

         for (const patch of pending) {
            Patcher[patch.type](patch.caller, menu, 'type', (_, args, res) => {
               try {
                  return patch.callback.apply(_, [_, args, res]);
               } catch (e) {
                  Logger.error(`Failed to run context menu patch on ${displayName} of caller ${patch.caller}.`, e);
               }
            }, true);
         }

         return menu;
      }

      // Detect context menus wrapped in analytics contexts
      const forced = forceRender(menu.type)(menu.props);
      if (forced.type.displayName === 'AnalyticsContext') {
         const payload = forced.props.children;

         const displayName = payload.type?.displayName;
         const pending = patches[displayName];
         if (!pending?.length) return res;

         for (const patch of pending) {
            Patcher[patch.type](patch.caller, payload, 'type', (_, args, res) => {
               try {
                  return patch.callback.apply(_, [_, args, res]);
               } catch (e) {
                  Logger.error(`Failed to run context menu patch on ${displayName} of caller ${patch.caller}.`, e);
               }
            }, true);
         }

         return payload;
      }
   } catch { }

   return res;
}

function initialize() {
   return;
   const Opener = Webpack.findByProps('openContextMenuLazy');

   Patcher.instead('unbound-menu-patcher', Opener, 'openContextMenuLazy', (self, args, orig) => {
      if (!args[1].__unbound) {
         const old = args[1];
         args[1] = async (...args) => {
            const render = await old(args[0]);
            return (props) => handleMenu(props, render);
         };

         args[1].__unbound = true;
      }

      return orig.call(self, ...args);
   });
}

// Offload patch to another thread as its not instantly needed
if (!window.__SPLASH__) {
   setImmediate(() => Webpack.data.available.then(initialize));
}

export default { instead, create, before, after, patches };