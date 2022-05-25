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

   static getLazy(filter, { all = false, default: defaultExport = true, traverse = [] } = {}) {
      const cache = Webpack.find(filter, { all, default: defaultExport, traverse });
      if (cache) return Promise.resolve(cache);

      const search = function (module) {
         try {
            return filter(module);
         } catch {
            return false;
         }
      };

      const found = [];

      return new Promise(resolve => {
         const listener = (m) => {
            if (traverse?.length) {
               function loop(mdl, esModule) {
                  if (esModule) {
                     loop(mdl.default, false);
                  }

                  for (const key in mdl) {
                     if (!mdl[key] || !traverse.includes(key)) {
                        continue;
                     }

                     const childKeys = Object.keys(mdl[key]);
                     if (childKeys.some(k => ~traverse.indexOf(k))) {
                        for (const childKey of childKeys) {
                           loop(mdl[key][childKey], false);
                        }
                     } else if (filter(mdl[key])) {
                        found.push(mdl[key]);
                        if (!all) break;
                     }
                  }
               }

               loop(m, m.__esModule);
            }

            if (search(m)) {
               found.push(m);
            }

            if (m.default && search(m.default)) {
               const value = defaultExport ? m.default : m;
               found.push(value);
            }

            if (found.length) {
               resolve(all ? found : found[0]);
               remove();
            }
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
      Webpack.instance = res;

      return res;
   }

   static find(filter, { all = false, cache = true, default: defaultExport = true, traverse = [] } = {}) {
      if (typeof filter !== 'function') return null;

      const finder = Webpack.#request(cache);
      const data = { error: null };
      const found = [];

      if (!finder) return;

      const search = function (module, index) {
         try {
            return filter(module, index);
         } catch (error) {
            data.error ??= ['Uncaught Exception with filter. This can cause lag spikes & slow startup times. Please handle any possible null cases in your filter.', error.message];
            return false;
         }
      };

      const keys = Object.keys(finder.c);
      resolver: for (let i = 0; i < keys.length; i++) {
         const id = keys[i];
         const mdl = finder.c[id].exports;
         if (!mdl || mdl === window) continue;

         // If traverse is present, traverse through any keys given and run the filter
         // on each of the children.
         if (traverse?.length) {
            function loop(mdl, esModule) {
               if (esModule) {
                  loop(mdl.default, false);
               }

               for (const key in mdl) {
                  if (!mdl[key] || !traverse.includes(key)) {
                     continue;
                  }

                  const childKeys = Object.keys(mdl[key]);
                  if (childKeys.some(k => ~traverse.indexOf(k))) {
                     for (const childKey of childKeys) {
                        loop(mdl[key][childKey], false);
                     }
                  } else if (filter(mdl[key])) {
                     found.push(mdl[key]);
                     if (!all) return mdl[key];
                  }
               }
            }

            const res = loop(mdl, mdl.__esModule);
            if (!all && res) break resolver;
         }

         switch (typeof mdl) {
            case 'object':
               if (search(mdl, id)) {
                  found.push(mdl);
                  if (!all) break resolver;
               }

               if (mdl.default && search(mdl.default, id)) {
                  const value = defaultExport ? mdl.default : mdl;

                  found.push(value);
                  if (!all) break resolver;
               }
            case 'function':
               if (!search(mdl, id)) continue;
               found.push(mdl);
               if (!all) break resolver;
         }
      }

      if (data.error) {
         Logger.warn(...data.error);
      }

      return all ? found : found[0];
   }

   static getByKeyword(...options) {
      const [[keyword], { caseSensitive = false, all = false, ...rest }] = Webpack.#parseOptions(options);

      return Webpack.find(mdl => {
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

   static getModules(filter, options = {}) {
      return Webpack.find(filter, { ...options, all: true });
   }

   static #parseOptions(args, filter = o => typeof o === 'object' && !Array.isArray(o)) {
      return [args, filter(args[args.length - 1]) ? args.pop() : {}];
   }

   static getByDisplayName(...options) {
      const [names, { bulk = false, wait = false, deep = false, default: def = true, ...rest }] = Webpack.#parseOptions(options);

      const filter = Webpack.filters.byDisplayName(names[0], def, deep);

      if (!bulk && !wait) {
         return Webpack.find(filter, rest);
      }

      if (wait && !bulk) {
         return Webpack.getLazy(filter, rest);
      }

      if (bulk) {
         const filters = names.map(name => {
            if (Array.isArray(name)) {
               return Webpack.filters.byDisplayName(name[0], name[1], name[2] ?? deep);
            }

            return Webpack.filters.byDisplayName(name, true, deep);
         }).concat({ wait });

         return Webpack.bulk(...filters);
      }

      return null;
   }

   static getFluxStore(...options) {
      const [names, { bulk = false, wait = false, ...rest }] = Webpack.#parseOptions(options);

      if (!bulk && !wait) {
         return Webpack.find(Webpack.filters.byFluxStore(names[0]), { ...rest });
      }

      if (wait && !bulk) {
         return Webpack.getLazy(Webpack.filters.byFluxStore(names[0]), { ...rest });
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
         return Webpack.find(Webpack.filters.byProps(...props), rest);
      }

      if (wait && !bulk) {
         return Webpack.getLazy(Webpack.filters.byProps(...props), rest);
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

   static getByPrototype(...options) {
      const [props, { bulk = false, wait = false, ...rest }] = Webpack.#parseOptions(options);

      if (!bulk && !wait) {
         return Webpack.find(Webpack.filters.byPrototype(...props), rest);
      }

      if (wait && !bulk) {
         return Webpack.getLazy(Webpack.filters.byPrototype(...props), rest);
      }

      if (bulk) {
         const filters = props.map(p => Array.isArray(p)
            ? Webpack.filters.byPrototype(...p)
            : Webpack.filters.byPrototype(p)
         ).concat({ wait, ...rest });

         return Webpack.bulk(...filters);
      }

      return null;
   }

   static getByString(...options) {
      const [strings, { bulk = false, default: defaultExport = true, wait = false, ...rest }] = Webpack.#parseOptions(options);

      if (!bulk && !wait) {
         return Webpack.find(Webpack.filters.byString(strings, defaultExport), rest);
      }

      if (wait && !bulk) {
         return Webpack.getLazy(Webpack.filters.byString(strings, defaultExport), rest);
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

   static bulk(...options) {
      const [filters, { wait = false, ...rest }] = Webpack.#parseOptions(options);
      if (!filters || !filters.length) return;

      const data = { error: null };
      const found = new Array(filters.length);
      const search = wait ? Webpack.getLazy : Webpack.find;
      const wrapped = filters.map(filter => (m) => {
         try {
            return filter(m);
         } catch (error) {
            data.error ??= ['Uncaught Exception with filter. This can cause lag spikes & slow startup times. Please handle any possible null cases in your filter.', error.message];
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

      if (data.error) {
         Logger.warn(...data.error);
      }

      if (wait) return res.then(() => found);

      return found;
   }

   static get filters() {
      return {
         byProps: (...props) => (mdl) => props.every(k => mdl[k] !== void 0),
         byPrototype: (...props) => (mdl) => props.every(p => mdl.prototype?.[p] !== void 0),
         byDisplayName: (name, def = true, deep = false) => (mdl) => {
            if (deep && mdl.type) {
               const displayName = mdl.type?.displayName;
               return displayName === name || displayName?.includes(`(${name})`);
            } else if (deep && mdl.render) {
               const displayName = mdl.render?.displayName;
               return displayName === name || displayName?.includes(`(${name})`);
            } else if (!def) {
               return typeof mdl.default === 'function' && mdl.default.displayName === name;
            } else {
               return typeof mdl === 'function' && mdl.displayName === name;
            }
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

const out = {
   getByProps: {
      aliases: [
         'findByProps',
         'fetchByProps'
      ],
   },
   getByPrototype: {
      aliases: [
         'findByPrototype',
         'fetchByPrototype'
      ],
   },
   find: {
      aliases: [
         'getModule',
         'get',
         'fetch',
         'findModule',
         'fetchModule'
      ]
   },
   bulk: {
      aliases: [
         'batch'
      ]
   },
   init: {},
   common: {},
   getLazy: {
      aliases: [
         'findLazy',
         'fetchLazy'
      ]
   },
   filters: {},
   getModules: {
      aliases: [
         'findAll',
         'getAll',
         'fetchAll'
      ]
   },
   getByString: {
      aliases: [
         'findByString',
         'fetchByString'
      ]
   },
   getFluxStore: {
      aliases: [
         'findFluxStore',
         'fetchFluxStore'
      ]
   },
   getByKeyword: {
      aliases: [
         'findByKeyword',
         'fetchByKeyword'
      ]
   },
   getByDisplayName: {
      aliases: [
         'findByDisplayName',
         'fetchByDisplayName'
      ]
   },
   api: {
      get: () => Webpack.common.API
   },
   stores: {
      get: () => Webpack.common.stores
   },
   ready: {
      get: () => Webpack.ready
   },
   instance: {
      get: () => Webpack.instance,
      set: (instance) => Webpack.instance = instance,
      configurable: true
   }
};

// Getters/Setters
Object.entries(out).map(([name, options]) => {
   const target = Webpack[name];
   const instance = target?.bind?.(Webpack) ?? target;
   if (!instance && !options.get && !options.set) {
      return;
   }

   if (options.get || options.set) {
      Object.defineProperty(module.exports, name, options);
   } else {
      module.exports[name] = instance;
   };

   if (!options.aliases) return;
   for (const alias of options.aliases) {
      module.exports[alias] = instance;
   }
});