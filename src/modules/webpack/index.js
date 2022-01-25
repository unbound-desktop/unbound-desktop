/**
*  @module Webpack
*  @description Unbound's webpack module, heavily inspired by HolyMod/PC-Compat.
*  @credit https://github.com/Strencher
*  @link https://github.com/strencher-kernel/pc-compat/blob/dev/src/renderer/modules/webpack.ts
*/

const { uuid } = require('@utilities');
const modules = require('@data/modules');

const common = {};

module.exports = class Webpack {
   instance = null;

   static get common() {
      return common;
   }

   static async init() {
      return await Webpack.#available.then(() => new Promise(async ready => {
         const [Dispatcher, { ActionTypes } = {}] = await Webpack.getByProps(
            ['dirtyDispatch'], ['API_HOST', 'ActionTypes'],
            { cache: false, bulk: true, wait: true, forever: true }
         );

         const listener = function () {
            Dispatcher.unsubscribe(ActionTypes.START_SESSION, listener.bind(Webpack));

            const names = Object.keys(modules);
            const results = Webpack.bulk(...Object.values(modules).map(m => Webpack.filters.byProps(...m)));

            for (let i = 0; i < results.length; i++) {
               Webpack.common[names[i]] = results[i];
            }

            ready(true);
         };

         Dispatcher.subscribe(ActionTypes.START_SESSION, listener.bind(Webpack));
      }));
   }

   static #request(cache = true) {
      if (cache && Webpack.instance) return Webpack.instance;

      const res = window[Webpack.#global].push([[uuid()], [], p => p]);
      if (res) Webpack.instance = res;

      return res;
   }

   static getModule(filter, { all = false, cache = true, force = false, defaultExport = true } = {}) {
      if (typeof (filter) !== 'function') return void 0;

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
         if (!mdl || mdl === window) continue;

         if (typeof mdl == 'object') {
            if (search(mdl, id)) {
               if (!all) return mdl;
               found.push(mdl);
            }

            if (mdl.__esModule && mdl.default != null && search(mdl.default, id)) {
               if (!all) return defaultExport ? mdl.default : mdl;
               found.push(defaultExport ? mdl.default : mdl);
            }

            if (force && mdl.__esModule) for (const key in mdl) {
               if (!mdl[key]) continue;

               if (search(mdl[key], id)) {
                  if (!all) return mdl[key];
                  found.push(mdl[key]);
               }
            }
         } else if (typeof mdl == 'function') {
            if (search(mdl, id)) {
               if (!all) return mdl;
               found.push(mdl);
            }
         }
      }

      return all ? found : found[0];
   }

   static getModules(filter) {
      return Webpack.getModule(filter, { all: true });
   }

   static #parseOptions(args, filter = o => typeof (o) === 'object' && !Array.isArray(o)) {
      return [args, filter(args[args.length - 1]) ? args.pop() : {}];
   }

   static getByDisplayName(...options) {
      const [names, { bulk = false, default: defaultExport = true, wait = false, ...rest }] = Webpack.#parseOptions(options);

      if (!bulk && !wait) {
         return Webpack.getModule(Webpack.filters.byDisplayName(names[0]), { defaultExport, ...rest });
      }

      if (wait && !bulk) {
         return Webpack.#waitFor(Webpack.filters.byDisplayName(names[0]), { defaultExport, ...rest });
      }

      if (bulk) {
         const filters = names.map(filters.map(Webpack.filters.byDisplayName)).concat({ wait, cache });

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
         return Webpack.waitFor(Webpack.filters.byProps(...props), rest);
      }

      if (bulk) {
         const filters = props.map((propsArray) => Webpack.filters.byProps(...propsArray)).concat({ wait, ...rest });

         return Webpack.bulk(...filters);
      }

      return null;
   }

   static getByDefaultString(...options) {
      const [props, { bulk = false, wait = false, ...rest }] = Webpack.#parseOptions(options);

      if (!bulk && !wait) {
         return Webpack.getModule(Webpack.filters.byDefaultString(...props), rest);
      }

      if (wait && !bulk) {
         return Webpack.#waitFor(Webpack.filters.byDefaultString(...props), rest);
      }

      if (bulk) {
         const filters = props.map((propsArray) => Webpack.filters.byDefaultString(...propsArray)).concat({ wait, ...rest });

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
         byProps: (...mdls) => (mdl) => mdls.every(k => mdl[k]),
         byDisplayName: (name, def) => (mdl) => {
            if (!mdl || (def && !mdl.default)) return false;
            return typeof mdl === 'function' && mdl.displayName === name;
         },
         byDefaultString: (...strings) => (mdl) => {
            if (!mdl?.default) return false;
            return strings.every(s => mdl.default.toString().includes(s));
         }
      };
   }

   static get #available() {
      return new Promise(async cb => {
         while (typeof window[Webpack.#global] == 'undefined' || window[Webpack.#global].length < 1) {
            await new Promise(setImmediate);
         }

         cb();
      });
   }

   static get #global() {
      return 'webpackChunkdiscord_app';
   }

   static get findByProps() {
      return Webpack.getByProps;
   }

   static get findByDisplayName() {
      return Webpack.getByDisplayName;
   }

   static get findByDefaultString() {
      return Webpack.getByDefaultString;
   }

   static get findModule() {
      return Webpack.getModule;
   }

   static get findModules() {
      return Webpack.getModules;
   }
};