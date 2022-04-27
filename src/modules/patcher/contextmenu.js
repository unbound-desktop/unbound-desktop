const wrapInHooks = require('@utilities/wrapInHooks');
const { createLogger } = require('../logger');
const Webpack = require('@webpack');
const Patcher = require('.');

const Logger = createLogger('Patcher', 'Menu');

class MenuPatcher {
   static patches = {};

   static validateArguments(caller, menu, callback) {
      if (!caller || typeof caller !== 'string') {
         throw new TypeError('first argument caller does not exist or is not of type string');
      } else if (!menu || typeof menu !== 'string') {
         throw new TypeError('second argument menu does not exist or is not of type string');
      } else if (!callback || typeof callback !== 'function') {
         throw new TypeError('third argument callback does not exist or is not of type function');
      }
   }

   static push(type, caller, menu, callback) {
      MenuPatcher.patches[menu] ??= [];
      MenuPatcher.patches[menu].push({
         type,
         caller,
         menu,
         callback,
         applied: false,
      });
   }

   static before() {
      MenuPatcher.validateArguments(...arguments);
      MenuPatcher.push('before', ...arguments);
   }

   static after() {
      MenuPatcher.validateArguments(...arguments);
      MenuPatcher.push('after', ...arguments);
   }

   static instead() {
      MenuPatcher.validateArguments(...arguments);
      MenuPatcher.push('instead', ...arguments);
   }

   static create(caller) {
      return {
         before: (...args) => MenuPatcher.before(caller, ...args),
         after: (...args) => MenuPatcher.after(caller, ...args),
         instead: (...args) => MenuPatcher.instead(caller, ...args),
         unpatchAll: () => MenuPatcher.unpatchAll(caller),
      };
   }

   static unpatchAll(caller) {
      for (const menu in MenuPatcher.patches) {
         const patches = MenuPatcher.patches[menu];
         MenuPatcher.patches[menu] = patches.filter(e => e.caller !== caller);
      }

      return Patcher.unpatchAll(caller);
   }

   static patchOpener() {
      const Opener = Webpack.getByProps('openContextMenuLazy');

      Patcher.before('unbound-menu-patcher', Opener, 'openContextMenuLazy', (_, args) => {
         const Menu = args[1];

         args[1] = async () => {
            const render = await Menu(args[0]);
            return (props) => MenuPatcher.handleMenu(props, render);
         };

         return args;
      });
   }

   static handleMenu(props, render) {
      const res = render(props);
      const wrapped = typeof res.type === 'object' ? res.props.children : res;

      const menu = wrapped?.type?.displayName;
      const collection = MenuPatcher.patches[menu];
      const patches = collection?.filter(p => !p.applied);

      if (menu && patches?.length) {
         const Menu = Webpack.find(m => m.default?.displayName === menu);
         if (!Menu) return res;

         for (const patch of patches) {
            Patcher[patch.type](patch.caller, Menu, 'default', patch.callback);
            patch.applied = true;
         }

         res.type = Menu.default;
         delete MenuPatcher.patches[menu];
      } else if (!menu) {
         const rendered = wrapInHooks(wrapped.type)(wrapped.props);
         const displayName = rendered?.props?.children?.type?.displayName;
         const collection = MenuPatcher.patches[displayName];
         const patches = collection?.filter(p => !p.applied);

         const AnalyticsContext = Webpack.find(m => [m.default, m.default?.__original].includes(wrapped.type));
         if (!AnalyticsContext) return res;

         for (const patch of patches ?? []) {
            Patcher.after(patch.caller, AnalyticsContext, 'default', (_, args, res) => {
               try {
                  const child = res.props.children;
                  if (!child) return;
                  if (child.type?.displayName !== patch.menu) return;

                  const unpatch = Patcher[patch.type](patch.caller, res.props.children, 'type', (ctx, args, res) => {
                     unpatch();
                     return patch.callback.apply(ctx, [ctx, args, res]);
                  });
               } catch (e) {
                  Logger.error(`Failed to patch context menu ${displayName} of caller ${patch.caller}.`, e);
               }

               return res;
            });

            patch.applied = true;
         }

         wrapped.type = AnalyticsContext.default;
         delete MenuPatcher.patches[displayName];
      }

      return res;
   }
}

Webpack.ready.then(MenuPatcher.patchOpener);

module.exports = {
   get patches() { return MenuPatcher.patches; },
   unpatchAll: MenuPatcher.unpatchAll,
   instead: MenuPatcher.instead,
   create: MenuPatcher.create,
   before: MenuPatcher.before,
   after: MenuPatcher.after
};