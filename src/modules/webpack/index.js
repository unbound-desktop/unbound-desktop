/**
*  @module Webpack
*  @description Unbound's webpack module, heavily inspired by HolyMod/PC-Compat.
*  @credit https://github.com/Strencher
*  @link https://github.com/strencher-kernel/pc-compat/blob/dev/src/renderer/modules/webpack.ts
*/

const { createLogger } = require('@modules/logger');
const modules = require('@data/modules');
const uuid = require('@utilities/uuid');

const Logger = createLogger('Webpack');
const common = {};

class Webpack {
   static instance = null;
   static listeners = new Set();
   static ready = new Promise(() => { });

   static get common() {
      return common;
   }

   static get stores() {
      return common.stores;
   }

   static get api() {
      return common.API;
   }

   static async init() {
      Webpack.onPush = Webpack.onPush.bind(this);

      await Webpack.#available.then(() => new Promise(async ready => {
         Webpack.push = window[Webpack.#global].push;
         Object.defineProperty(window[Webpack.#global], 'push', {
            configurable: true,
            get: () => Webpack.onPush,
            set: (push) => {
               Webpack.push = push;

               Object.defineProperty(window[Webpack.#global], 'push', {
                  value: Webpack.onPush,
                  configurable: true,
                  writable: true
               });
            }
         });

         const [
            Dispatcher,
            { ActionTypes } = {},
            { getCurrentUser } = {}
         ] = await Webpack.getByProps(
            ['dirtyDispatch'],
            ['API_HOST', 'ActionTypes'],
            ['getCurrentUser', 'getUser'],
            { cache: false, bulk: true, wait: true, forever: true }
         );

         const listener = function () {
            Logger.log('Initialization complete.');
            Dispatcher.unsubscribe(ActionTypes.ACCESSIBILITY_SYSTEM_PREFERS_REDUCED_MOTION_CHANGED, listener.bind(Webpack));

            const filters = [];
            for (const name in modules) {
               const mdl = modules[name];

               if (mdl.submodule) {
                  if (!mdl.items) continue;

                  const modules = {};
                  for (const entry in mdl.items) {
                     const item = mdl.items[entry];
                     const res = Webpack.#handleCommonModule(entry, item);
                     res.id = name;
                     res.map = (mdl) => {
                        modules[entry] = mdl;
                        return modules;
                     };

                     filters.push(res);
                  }
               } else {
                  const res = Webpack.#handleCommonModule(name, mdl);
                  filters.push(res);
               }
            }

            const results = Webpack.bulk(...filters.map(({ filter }) => filter));
            filters.map(({ id, map }, index) => {
               const mapper = map ?? (_ => _);
               const res = mapper(results[index]);
               Webpack.common[id] = res;
            });

            Webpack.ready = Promise.resolve();
            ready(true);
         };

         if (getCurrentUser?.() !== void 0) {
            return listener();
         } else {
            Dispatcher.subscribe(ActionTypes.ACCESSIBILITY_SYSTEM_PREFERS_REDUCED_MOTION_CHANGED, listener.bind(Webpack));
         }
      }));
   }

   static #handleCommonModule(name, module) {
      if (module.storeName) {
         return {
            id: name,
            filter: Webpack.filters.byFluxStore(module.storeName)
         };
      } else if (module.props) {
         if (module.props.every(props => Array.isArray(props))) {
            const found = [];

            return {
               id: name,
               filter: (mdl) => {
                  const res = module.props.some(props => props.every(p => mdl[p] !== void 0));
                  if (res && module.ensure && !module.ensure(mdl)) {
                     return false;
                  } else if (res) {
                     found.push(mdl);
                  }

                  return res;
               },
               map: () => Object.assign({}, ...found)
            };
         } else {
            return {
               id: name,
               filter: (mdl) => {
                  const res = Webpack.filters.byProps(...module.props)(mdl);
                  if (res && module.ensure && !module.ensure(mdl)) {
                     return false;
                  }

                  return res;
               }
            };
         }
      } else if (module.displayName) {
         return {
            id: name,
            filter: Webpack.filters.byDisplayName(module.displayName)
         };
      } else if (module.filter) {
         return {
            id: name,
            filter: module.filter
         };
      }
   }

   static addListener(listener) {
      Webpack.listeners.add(listener);
      return Webpack.removeListener.bind(this, listener);
   }

   static removeListener(listener) {
      return Webpack.listeners.delete(listener);
   }

   static onPush(chunk) {
      const [, modules] = chunk;

      for (const id in modules) {
         const orig = modules[id];

         modules[id] = (...args) => {
            const [, exports] = args;
            Reflect.apply(orig, null, args);
            if (!Webpack.listeners?.size) return;

            for (const listener of Webpack.listeners) {
               try {
                  listener(exports);
               } catch (e) {
                  Logger.error('Failed to fire listener.', e);
               }
            }
         };

         Object.assign(modules[id], orig, {
            toString: orig.toString.bind(orig),
            __original: orig
         });
      }

      return Reflect.apply(Webpack.push, window[Webpack.#global], [chunk]);
   }

   static getLazy(filter) {
      const cache = Webpack.getModule(filter);
      if (cache) return Promise.resolve(cache);

      return new Promise(resolve => {
         const listener = (m) => {
            const direct = filter(m);
            if (direct) {
               resolve(m);
               return void remove();
            }

            if (!m.default) return;
            const defaultMatch = filter(m.default);
            if (!defaultMatch) return;

            resolve(m.default);
            remove();
         };

         const remove = Webpack.addListener(listener);
      });
   }

   static #request(cache = true) {
      if (cache && Webpack.instance) {
         return Webpack.instance;
      }

      const res = window[Webpack.#global].push([[uuid()], [], p => p]);
      window[Webpack.#global].pop();

      return res;
   }

   static getModule(filter, { all = false, cache = true, default: defaultExport = true, traverse = [] } = {}) {
      if (typeof filter !== 'function') return void 0;

      const finder = Webpack.#request(cache);
      const found = [];

      if (!finder) return;

      const search = function (module, index) {
         try {
            return filter(module, index);
         } catch {
            return false;
         }
      };

      for (const id in finder.c) {
         const mdl = finder.c[id].exports;

         /*
          * Check if the module exists and make sure its not the window object
          * Checking for mdl.navigator is faster. Since none of the webpack modules
          * have a navigator property on them we can safely check if navigator
          * exists on the webpack module.
          */
         if (!mdl || mdl.navigator) continue;

         if (typeof mdl === 'object') {
            if (Array.isArray(traverse) && traverse.length) {
               function loop(mdl, esModule) {
                  if (esModule) {
                     loop(mdl.default, false);
                  }

                  for (const key in mdl) {
                     if (!mdl[key] || !traverse.includes(key)) {
                        continue;
                     }

                     const childKeys = Object.keys(mdl[key]);
                     if (childKeys.some(k => traverse.includes(k))) {
                        for (const childKey of childKeys) {
                           loop(mdl[key][childKey], false);
                        }
                     } else if (filter(mdl[key])) {
                        found.push(mdl[key]);
                        if (!all) break;
                     }
                  }
               }

               loop(mdl, mdl.__esModule);
            }

            if (search(mdl, id)) {
               if (!all) return mdl;
               found.push(mdl);
            }

            if (mdl.__esModule && mdl.default && search(mdl.default, id)) {
               const value = defaultExport ? mdl.default : mdl;

               if (!all) return value;
               found.push(value);
            }
         } else if (typeof mdl === 'function') {
            if (!search(mdl, id)) continue;
            if (!all) return mdl;
            found.push(mdl);
         }
      }

      return all ? found : found[0];
   }

   static getByKeyword(...options) {
      const [[keyword], { caseSensitive = false, all = false, ...rest }] = Webpack.#parseOptions(options);

      return Webpack.getModule(mdl => {
         const mdls = [...Object.keys(mdl), ...Object.keys(mdl.__proto__)];

         for (let i = 0; i < mdls.length; i++) {
            const instance = mdls[i];

            if (caseSensitive) {
               if (~instance.indexOf(keyword)) {
                  return true;
               }
            } else {
               const key = keyword.toLowerCase();

               if (~instance.toLowerCase().indexOf(key)) {
                  return true;
               }
            }
         }

         return false;
      }, { all, ...rest });
   };

   static getModules(filter) {
      return Webpack.getModule(filter, { all: true });
   }

   static #parseOptions(args, filter = o => typeof o === 'object' && !Array.isArray(o)) {
      return [args, filter(args[args.length - 1]) ? args.pop() : {}];
   }

   static getByDisplayName(...options) {
      const [names, { bulk = false, wait = false, deep = false, default: def = true, ...rest }] = Webpack.#parseOptions(options);

      const filter = deep ?
         Webpack.filters.byDisplayNameDeep(names[0]) :
         Webpack.filters.byDisplayName(names[0], def);

      if (!bulk && !wait) {
         return Webpack.getModule(filter, deep ? {
            traverse: ['type', 'render'],
            ...rest
         } : rest);
      }

      if (wait && !bulk) {
         return Webpack.#waitFor(filter, deep ? {
            traverse: ['type', 'render'],
            ...rest
         } : rest);
      }

      if (bulk) {
         const filters = names.map(name => {
            const handler = [deep ? 'byDisplayNameDeep' : 'byDisplayName'];
            if (Array.isArray(name)) {
               return Webpack.filters[handler](name[0], name[1]);
            }

            return Webpack.filters[handler](name, true);
         }).concat({ wait });

         return Webpack.bulk(...filters);
      }

      return null;
   }

   static getFluxStore(...options) {
      const [names, { bulk = false, wait = false, ...rest }] = Webpack.#parseOptions(options);

      if (!bulk && !wait) {
         return Webpack.getModule(Webpack.filters.byFluxStore(names[0]), { ...rest });
      }

      if (wait && !bulk) {
         return Webpack.#waitFor(Webpack.filters.byFluxStore(names[0]), { ...rest });
      }

      if (bulk) {
         const filters = names.map(p => Array.isArray(p)
            ? Webpack.filters.byFluxStore(...p)
            : Webpack.filters.byFluxStore(p)
         ).concat({ wait, ...rest });

         return Webpack.bulk(...filters);
      }

      return null;
   }

   static getByProps(...options) {
      const [props, { bulk = false, wait = false, ...rest }] = Webpack.#parseOptions(options);

      if (!bulk && !wait) {
         return Webpack.getModule(Webpack.filters.byProps(...props), rest);
      }

      if (wait && !bulk) {
         return Webpack.#waitFor(Webpack.filters.byProps(...props), rest);
      }

      if (bulk) {
         const filters = props.map(p => Array.isArray(p)
            ? Webpack.filters.byProps(...p)
            : Webpack.filters.byProps(p)
         ).concat({ wait, ...rest });

         return Webpack.bulk(...filters);
      }

      return null;
   }

   static getByString(...options) {
      const [strings, { bulk = false, default: defaultExport = true, wait = false, ...rest }] = Webpack.#parseOptions(options);

      if (!bulk && !wait) {
         return Webpack.getModule(Webpack.filters.byString(strings, defaultExport), rest);
      }

      if (wait && !bulk) {
         return Webpack.#waitFor(Webpack.filters.byString(strings, defaultExport), rest);
      }

      if (bulk) {
         const filters = strings.map(string => {
            if (Array.isArray(s)) {
               const defaultExport = string[string.length - 1];
               if (typeof defaultExport === 'boolean') {
                  return Webpack.filters.byString(string.splice(string.length, 1), defaultExport);
               };
            } else {
               return Webpack.filters.byString([string], defaultExport);
            }
         }).filter(Boolean).concat({ wait, ...rest });

         return Webpack.bulk(...filters);
      }

      return null;
   }

   static async #waitFor(filter, { retries = 100, all = false, forever = false, delay = 50 } = {}) {
      for (let i = 0; (i < retries || forever); i++) {
         const module = Webpack.getModule(filter, { all, cache: false });
         if (module) return module;
         await new Promise(res => setTimeout(res, delay));
      }
   }

   static bulk(...options) {
      const [filters, { wait = false, ...rest }] = Webpack.#parseOptions(options);

      const found = new Array(filters.length);
      const search = wait ? Webpack.#waitFor : Webpack.getModule;
      const wrapped = filters.map(filter => (m) => {
         try {
            return filter(m);
         } catch (error) {
            return false;
         }
      });

      const res = search.call(Webpack, (module) => {
         for (let i = 0; i < wrapped.length; i++) {
            const filter = wrapped[i];
            if (typeof filter !== 'function' || !filter(module) || found[i] != null) continue;

            found[i] = module;
         }

         return found.filter(String).length === filters.length;
      }, rest);

      if (wait) return res.then(() => found);

      return found;
   }

   static get filters() {
      return {
         byProps: (...mdls) => (mdl) => mdls.every(k => mdl[k] !== void 0),
         byDisplayName: (name, def = true) => (mdl) => {
            if (!def) {
               return typeof mdl.default === 'function' && mdl.default.displayName === name;
            } else {
               return typeof mdl === 'function' && mdl.displayName === name;
            }
         },
         byDisplayNameDeep: (name) => (mdl) => {
            return mdl.displayName?.includes(`(${name})`);
         },
         byString: (strings, def = true) => (mdl) => {
            if (!def) {
               return typeof mdl.default === 'function' && strings.every(s => mdl.default?.toString?.()?.includes?.(s));
            } else {
               return typeof mdl === 'function' && strings.every(s => mdl.toString?.()?.includes?.(s));
            }
         },
         byFluxStore: (name) => (mdl) => {
            return mdl.getName?.() === name;
         }
      };
   }

   static get #available() {
      return new Promise(async cb => {
         while (window[Webpack.#global] === void 0) {
            await new Promise(setImmediate);
         }

         cb();
      });
   }

   static get #global() {
      return 'webpackChunkdiscord_app';
   }
};

module.exports = {
   // Cringe
   get api() {
      return Webpack.common.API;
   },
   get stores() {
      return Webpack.common.stores;
   },
   get ready() {
      return Webpack.ready;
   },
   get instance() {
      return Webpack.instance;
   },
   set instance(instance) {
      return Webpack.instance = instance;
   },
   bulk: Webpack.bulk,
   init: Webpack.init,
   common: Webpack.common,
   get: Webpack.getModule,
   find: Webpack.getModule,
   getLazy: Webpack.getLazy,
   filters: Webpack.filters,
   findLazy: Webpack.getLazy,
   getModule: Webpack.getModule,
   findModule: Webpack.getModule,
   getModules: Webpack.getModules,
   getByProps: Webpack.getByProps,
   findByProps: Webpack.getByProps,
   findModules: Webpack.getModules,
   getByString: Webpack.getByString,
   findByString: Webpack.getByString,
   getFluxStore: Webpack.getFluxStore,
   getByKeyword: Webpack.getByKeyword,
   findFluxStore: Webpack.getFluxStore,
   findByKeyword: Webpack.getByKeyword,
   getByDisplayName: Webpack.getByDisplayName,
   findByDisplayName: Webpack.getByDisplayName
};
