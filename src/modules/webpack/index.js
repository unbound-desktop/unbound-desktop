/**
*  @module Webpack
*  @description Unbound's webpack module, heavily inspired by HolyMod/PC-Compat.
*  @credit https://github.com/Strencher
*  @link https://github.com/strencher-kernel/pc-compat/blob/dev/src/renderer/modules/webpack.ts
*/

const { uuid, bindAll } = require('@utilities');
const modules = require('@data/modules');

module.exports = new class Webpack {
   constructor() {
      this.instance = null;

      this.common = {};
      this.ready = this.available.then(() => new Promise(async ready => {
         const [Dispatcher, { ActionTypes } = {}] = await this.getByProps(
            ['dirtyDispatch'], ['API_HOST', 'ActionTypes'],
            { cache: false, bulk: true, wait: true, forever: true }
         );

         const listener = function () {
            Dispatcher.unsubscribe(ActionTypes.START_SESSION, listener.bind(this));

            const names = Object.keys(modules);
            const results = this.bulk(...Object.values(modules).map(m => this.filters.byProps(...m)));

            for (let i = 0; i < results.length; i++) {
               this.common[names[i]] = results[i];
            }

            ready(true);
         };

         Dispatcher.subscribe(ActionTypes.START_SESSION, listener.bind(this));
      }));

      bindAll(this, ['getByProps', 'getByDisplayName', 'getModule']);
   }

   request(cache = true) {
      if (cache && this.instance) return this.instance;

      const res = window[this.global].push([[uuid()], [], p => p]);
      if (res) this.instance = res;

      return res;
   }

   getModule(filter, { all = false, cache = true, force = false, defaultExport = false } = {}) {
      if (typeof (filter) !== 'function') return void 0;

      const finder = this.request(cache);
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
            if (!defaultExport && mdl.default != null && search(mdl.default, id)) {
               if (!all) return mdl;
               found.push(mdl);
            }

            if (search(mdl, id)) {
               if (!all) return mdl;
               found.push(mdl);
            }

            if (mdl.__esModule && mdl.default != null && search(mdl.default, id)) {
               if (!all) return mdl.default;
               found.push(mdl.default);
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

   getModules(filter) {
      return this.getModule(filter, { all: true });
   }

   parseOptions(args, filter = o => typeof (o) === 'object' && !Array.isArray(o)) {
      return [args, filter(args[args.length - 1]) ? args.pop() : {}];
   }

   getByDisplayName(...options) {
      const [names, { bulk = false, default: defaultExport = true, wait = false, ...rest }] = this.parseOptions(options);

      if (!bulk && !wait) {
         return this.getModule(this.filters.byDisplayName(names[0]), { defaultExport, ...rest });
      }

      if (wait && !bulk) {
         return this.waitFor(this.filters.byDisplayName(names[0]), { defaultExport, ...rest });
      }

      if (bulk) {
         const filters = names.map(filters.map(this.filters.byDisplayName)).concat({ wait, cache });

         return this.bulk(...filters);
      }

      return null;
   }

   getByProps(...options) {
      const [props, { bulk = false, wait = false, ...rest }] = this.parseOptions(options);

      if (!bulk && !wait) {
         return this.getModule(this.filters.byProps(...props), rest);
      }

      if (wait && !bulk) {
         return this.waitFor(this.filters.byProps(...props), rest);
      }

      if (bulk) {
         const filters = props.map((propsArray) => this.filters.byProps(...propsArray)).concat({ wait, ...rest });

         return this.bulk(...filters);
      }

      return null;
   }

   async waitFor(filter, { retries = 100, all = false, forever = false, delay = 50 } = {}) {
      for (let i = 0; (i < retries || forever); i++) {
         const module = this.getModule(filter, { all, cache: false });
         if (module) return module;
         await new Promise(res => setTimeout(res, delay));
      }
   }

   bulk(...options) {
      const [filters, { wait = false, ...rest }] = this.parseOptions(options);

      const found = new Array(filters.length);
      const search = wait ? this.waitFor : this.getModule;
      const wrapped = filters.map(filter => (m) => {
         try {
            return filter(m);
         } catch (error) {
            return false;
         }
      });

      const res = search.call(this, (module) => {
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

   get filters() {
      return {
         byProps: (...mdls) => (mdl) => mdls.every(k => mdl[k]),
         byDisplayName: (name, def) => (mdl) => {
            if (!mdl || (def && !mdl.default)) return false;
            return typeof mdl === 'function' && mdl.displayName === name;
         }
      };
   }

   get available() {
      return new Promise(async cb => {
         while (typeof window[this.global] == 'undefined' || window[this.global].length < 1) {
            await new Promise(setImmediate);
         }

         cb();
      });
   }

   get global() {
      return 'webpackChunkdiscord_app';
   }

   get findByProps() {
      return this.getByProps;
   }

   get findByDisplayName() {
      return this.getByDisplayName;
   }

   get findModule() {
      return this.getModule;
   }

   get findModules() {
      return this.getModules;
   }
};