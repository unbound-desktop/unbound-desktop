import type { Common } from '@common/data/modules';
import { createLogger } from '@common/logger';

const Logger = createLogger('Webpack');

interface Options {
   all?: boolean;
   cache?: boolean;
   interop?: boolean;
   traverse?: string[];
   initial?: any[];
   raw?: boolean;
}

interface LazyOptions {
   all?: boolean;
   interop?: boolean;
   raw?: boolean;
}

interface WaitOptions extends LazyOptions {
   wait: true;
}

type DebugOptions = (Options | WaitOptions) & {
   bulk?: boolean;
   wait?: boolean;
   short?: boolean;
};

type SearchFilter = (module: any, id?: string | number) => any;
type BulkFilter = SearchFilter | SearchFilter[] | [...SearchFilter[], Options | WaitOptions];

/* SETUP */
export const listeners = new Set();
export const common: Record<Common, any> | Record<any, any> = {};
export const data = {
   initialized: false,
   available: new Promise(() => { }),
   cache: {},
   global: 'webpackChunkdiscord_app',
   instance: null,
   push: null,
   sentry: {
      blocked: false,
      tries: 0
   },
};


/* FILTERS */
export namespace filters {
   /*
    * Searches a module for matching keys.
    */
   export function byProps(...props: string[]): SearchFilter {
      return (mdl) => {
         for (let i = 0, len = props.length; i < len; i++) {
            if (mdl[props[i]] === void 0) {
               return false;
            }
         }

         return true;
      };
   }

   /*
    * Searches a module for matching keys in its prototype.
    */
   export function byPrototypes(...props: string[]): SearchFilter {
      return (mdl) => {
         for (let i = 0, len = props.length; i < len; i++) {
            if (mdl.prototype?.[props[i]] === void 0) {
               return false;
            }
         }

         return true;
      };
   }

   /**
    * Searches a module for a string matching it's "displayName" property.
    *
    * @param name The displayName to search for.
    * @param def If true, it will check `exports.default`, manually making it export outside of `default`, making it patchable.
    * @param deep If true, will check `(exports|exports.default).type` and `(exports|exports.default).render`.
    * @param exact Only used when deep is true; will use an `indexOf() > -1` match instead of the normal strict-equal-to operator.
    */
   export function byDisplayName(name: string, def: boolean = true, deep: boolean = false, exact: boolean = true) {
      return (mdl: any) => {
         if (deep && mdl.type?.displayName) {
            return mdl.type.displayName === name || !exact && ~mdl.type.displayName.indexOf(name);
         } else if (deep && mdl.render?.displayName) {
            return mdl.render.displayName === name || !exact && ~mdl.render.displayName.indexOf(name);
         } else if (deep && mdl.displayName) {
            return mdl.displayName === name || !exact && ~mdl.displayName.indexOf(name);
         } else if (!def) {
            return typeof mdl.default === 'function' && mdl.default.displayName === name;
         } else {
            return typeof mdl === 'function' && mdl.displayName === name;
         }
      };
   }

   /*
    * Searches function modules by strings in their function body.
    */
   export function byStrings(...strings: string[]): SearchFilter {
      return (mdl) => {
         if (!mdl || typeof mdl !== 'function') {
            return false;
         }

         for (let i = 0, len = strings.length; i < len; i++) {
            if (!~(mdl.__original ?? mdl).toString?.()?.indexOf?.(strings[i])) {
               return false;
            }
         }

         return true;
      };
   };

   /*
    * Matches function modules by strings in their function body.
    */
   export function byRegex(...regex: string[]): SearchFilter {
      return (mdl) => {
         if (!mdl || typeof mdl !== 'function' || (mdl.__original?.toString ?? mdl.toString) !== Function.prototype.toString) {
            return false;
         }

         for (let i = 0, len = regex.length; i < len; i++) {
            if (!mdl.toString?.()?.match?.(regex[i])) {
               return false;
            }
         }

         return true;
      };
   };

   export function byStoreName(name: string, short: boolean = true): SearchFilter {
      return (mdl) => mdl.getName?.() === (short && !name.endsWith('Store') ? `${name}Store` : name);
   }

   /**
    * A utility function for combining filters efficiently (by not recreating functions).
    */
   export function combine(...filters: SearchFilter[]): SearchFilter {
      return (mdl, id) => {
         for (let i = 0, len = filters.length; i < len; i++) {
            if (!filters[i](mdl, id)) {
               return false;
            }
         }

         return true;
      };
   };

   /**
    * A utility function to traverse down a prop or an collection of props before running the filter.
    */
   export function traverse(filter: SearchFilter, props: string | string[]): SearchFilter {
      return (mdl, id) => {
         if (Array.isArray(props)) {
            for (let i = 0, len = props.length; i < len; i++) {
               const prop = mdl[props[i]];
               if (prop === undefined) {
                  return false;
               }

               mdl = prop;
            }
         } else {
            const prop = mdl[props];
            if (prop === undefined) {
               return false;
            }

            mdl = prop;
         }

         return filter(mdl, id);
      };
   }
};



/* CHUNK LISTENERS */
export function addListener(listener: (...args) => any) {
   listeners.add(listener);
   return removeListener.bind(this, listener);
}

export function removeListener(listener: (...args) => any) {
   return listeners.delete(listener);
}



/* FILTER FINDERS */
export function find(...filters: SearchFilter[]): any;
export function find(...args: [...filters: SearchFilter[], options: Options]): any;
export function find(...args: [...filters: SearchFilter[], options: Options] | SearchFilter[]): any {
   const [search, { all, cache = true, raw = false, interop = true, initial }] = parseOptions<Options, SearchFilter[]>(args);

   if (!search?.length) {
      throw new Error('Webpack searches require a filter to search by.');
   }

   const instance = request(true);
   if (!instance) return;

   let error = false;
   const found = initial ?? [];

   const filter = filters.combine(...search);
   const validate: SearchFilter = (mdl, index) => {
      try {
         return filter(mdl, index);
      } catch (e) {
         if (!error) {
            Logger.warn('Uncaught Exception with filter. This can cause lag spikes & slow startup times. Please handle any possible null cases in your filter.', e.message);
            error = true;
         }

         return false;
      }
   };

   const payload = cache ? data.cache : instance.c;
   for (const id in payload) {
      const mdl = instance.c[id].exports;
      if (!mdl || mdl === window || ~found.indexOf(interop && mdl.default ? mdl.default : mdl)) {
         continue;
      }

      switch (typeof mdl) {
         case 'object':
            if (validate(mdl, id)) {
               data.cache[id] = instance.c[id];

               const payload = raw ? instance.c[id] : mdl;
               if (!all) return payload;
               found.push(payload);
            }

            if (mdl.default && validate(mdl.default, id)) {
               data.cache[id] = instance.c[id];
               const value = raw ? instance.c[id] : interop ? mdl.default : mdl;

               if (!all) return value;
               found.push(value);
            }

            const descriptors = Object.getOwnPropertyDescriptors(mdl);
            const getters = Object.keys(descriptors).filter(e => descriptors[e].get);

            if (getters) {
               for (const getter of getters) {
                  const wrapped = mdl[getter];
                  if (!wrapped) continue;

                  if (wrapped.__esModule && wrapped.default && validate(wrapped.default, id)) {
                     const value = raw ? mdl : interop ? wrapped.default : wrapped;

                     if (!all) return value;
                     found.push(value);
                  }

                  if (validate(wrapped, id)) {
                     const value = raw ? mdl : wrapped;

                     if (!all) return value;
                     found.push(value);
                  }
               }
            }

            break;
         default:
            if (!validate(mdl, id)) continue;
            data.cache[id] = instance.c[id];

            const payload = raw ? instance.c[id] : mdl;
            if (!all) return payload;
            found.push(payload);

            break;
      }
   }

   if (cache && !all && !found.length) {
      return find(filter, { all, raw, cache: false, interop });
   } else if (cache && all) {
      return find(filter, { all, raw, cache: false, interop, initial: found });
   }

   return all ? found : found[0];
}

export function findByIndex(id: number): any {
   if (!data.instance.c[id]) {
      try {
         data.instance.r(id);
      } catch (e) {
         return null;
      }
   }

   return data.instance.c[id];
}

export function findLazy(...filters: SearchFilter[]): Promise<any>;
export function findLazy(...args: [...filters: SearchFilter[], options: LazyOptions]): Promise<any>;
export function findLazy(...args: [...filters: SearchFilter[], options: LazyOptions] | SearchFilter[]) {
   const [search, { all = false, interop = true, raw = false }] = parseOptions<LazyOptions, SearchFilter[]>(args);
   const cache = find(...search, { all, interop });
   if (cache) return Promise.resolve(cache);

   const filter = filters.combine(...search);
   const validate: SearchFilter = (mdl, index) => {
      try {
         return filter(mdl, index);
      } catch {
         return false;
      }
   };

   const found = [];

   return new Promise(resolve => {
      const listener = (mdl: any) => {
         if (validate(mdl)) {
            found.push(mdl);
         }

         if (mdl.default && validate(mdl.default)) {
            const value = interop ? mdl.default : mdl;
            found.push(value);
         }

         const descriptors = Object.getOwnPropertyDescriptors(mdl);
         const getters = Object.keys(descriptors).filter(e => descriptors[e].get);

         if (getters) {
            for (const getter of getters) {
               const wrapped = mdl[getter];
               if (!wrapped) continue;

               if (wrapped.__esModule && wrapped.default && validate(wrapped.default)) {
                  const value = raw ? mdl : interop ? wrapped.default : wrapped;
                  found.push(value);
               }

               if (validate(wrapped)) {
                  const value = raw ? mdl : wrapped;
                  found.push(value);
               }
            }
         }

         if (found.length) {
            resolve(all ? found : found[0]);
            remove();
         }
      };

      const remove = addListener(listener);
   });
}

function _find(args: any[], options: DebugOptions, filter: Fn) {
   const { bulk: _, wait, ...rest } = options;

   if (options.bulk) {
      return bulk(...args.map(a => filter(...a)), options);
   } else if (wait) {
      return findLazy(filter(...args), rest as WaitOptions);
   } else {
      return find(filter(...args), rest);
   }
}

export function findByProps(...options: any[]): any {
   const [props, opts] = parseOptions(options);

   return _find(props, opts, filters.byProps);
}

export function findByPrototypes(...options: any[]): any {
   const [props, opts] = parseOptions(options);

   return _find(props, opts, filters.byPrototypes);
}

export function findByKeyword(...options: any[]): any {
   const [name, { caseSensitive = false, ...rest }] = parseOptions<Record<any, any>>(options);

   return _find(name, rest, (keyword) => (mdl) => {
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
   });
}

export function findStore(...options: any[]): any {
   const [name, { short = false, ...rest }] = parseOptions<Record<any, any>>(options);

   return _find(name, { short, ...rest }, filters.byStoreName);
}

export function findByStrings(...options: any[]): any {
   const [strings, { interop = true, ...rest }] = parseOptions<Record<any, any>>(options);

   return _find(strings, { interop, ...rest }, filters.byStrings);
}

export function findByRegex(...options: any[]): any {
   const [regex, { interop = true, ...rest }] = parseOptions<Record<any, any>>(options);

   return _find(regex, { interop, ...rest }, filters.byRegex);
}

export function findByDisplayName(...options: any[]): any {
   const [displayNames, { interop = true, deep = false, exact = true, ...rest }] = parseOptions<Record<any, any>>(options);

   return _find(displayNames, { interop, ...rest }, (displayName) => filters.byDisplayName(displayName, interop, deep, exact));
}

export function bulk(...filters: BulkFilter[]): any[];
export function bulk(...args: [...filters: BulkFilter[], options: Options]): any[];
export function bulk(...args: [...filters: BulkFilter[], options: WaitOptions]): Promise<any[]>;
export function bulk(...args: [...filters: BulkFilter[], options: Options | WaitOptions] | BulkFilter[]): any[] | Promise<any[]> {
   const [search, { wait = false, ...rest }] = parseOptions<Options & WaitOptions, BulkFilter[]>(args);
   if (!search || !search.length) return;

   let error = false;
   const found = new Array(search.length);
   const get = wait ? findLazy : find;

   const wrapped: SearchFilter[] = search.map((filter) => {
      const searcher = Array.isArray(filter) ? filters.combine(...search as SearchFilter[]) : filter;
      return (mdl, id) => {
         try {
            return searcher(mdl, id);
         } catch (e) {
            if (!error) {
               Logger.warn('Uncaught Exception with filter. This can cause lag spikes & slow startup times. Please handle any possible null cases in your filter.', e.message);
               error = true;
            }

            return false;
         }
      };
   });

   const res = get((mdl, id) => {
      for (let i = 0; i < wrapped.length; i++) {
         const filter = wrapped[i];
         if (typeof filter !== 'function' || !filter(mdl, id) || found[i] != null) continue;

         found[i] = mdl;
      }

      return found.filter(String).length === search.length;
   }, rest);

   if (wait) {
      return res.then(() => found);
   }

   return found;
}



/* MISCELLANEOUS */
export async function initialize(): Promise<void> {
   if (data.initialized) return;

   if (!window.__SPLASH__) {
      await waitForGlobal();
      request();

      data.push = window[data.global].push;
      Object.defineProperty(window[data.global], 'push', {
         configurable: true,
         get: () => onPush,
         set: (push) => data.push = push
      });

      // Finish initialization when webpack modules are loaded
      await findLazy(filters.byPrototypes('getPredicateSections'));
   } else {
      const oCall = Function.prototype.call;

      await new Promise<void>((resolve) => {
         Function.prototype.call = function (...args) {
            try {
               const payload = args[3];

               if (payload?.c && payload.m && payload.name !== '__webpack_require__') {
                  data.instance = payload;
                  Function.prototype.call = oCall;
                  resolve();
               }
            } catch (err) {
               Logger.error('Failed to fetch.', err);
               Function.prototype.call = oCall;
            }

            return oCall.apply(this, args);
         };
      });
   }

   data.initialized = true;
   data.available = Promise.resolve();
}

export function shutdown(): void {
   if (!data.initialized) return;
   delete window[data.global].push;

   Object.defineProperty(window[data.global], 'push', {
      configurable: true,
      get: () => data.push,
      set: (push) => {
         delete window[data.global].push;
         window[data.global].push = push;
      }
   });
}

export function request(cache = true) {
   if (cache && data.instance) {
      return data.instance;
   }

   const res = window[data.global].push([[Symbol()], {}, e => e]);
   window[data.global].pop();

   if (res) data.instance = res;

   return res;
}

function parseOptions<O, A extends any[] = string[]>(
   args: [...A, any] | A,
   filter = (last) => typeof last === 'object' && !Array.isArray(last),
   fallback = {}
): [A, O] {
   return [args as A, filter(args[args.length - 1]) ? args.pop() : fallback];
}

function waitForGlobal(): Promise<void> {
   if (window[data.global]) {
      return Promise.resolve();
   }

   return new Promise(resolve => {
      Object.defineProperty(window, data.global, {
         get: () => undefined,
         configurable: true,
         set: (payload) => {
            delete window[data.global];
            window[data.global] = payload;
            resolve();
         }
      });
   });
}

function onPush(chunk) {
   const modules = chunk[1];

   if (data.sentry.tries < 5 && !data.sentry.blocked) {
      data.sentry.tries++;

      if (Object.values(modules).find(m => ~m.toString().indexOf('BetterDiscord'))) {
         return data.sentry.blocked = true;
      };
   }

   for (const id in modules) {
      const orig = modules[id];

      modules[id] = (...args) => {
         const payload = args[1];
         orig.apply(null, args);
         if (!listeners?.size) return;

         for (const listener of listeners) {
            try {
               (listener as (...args) => any)(payload);
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

   return Reflect.apply(data.push, window[data.global], [chunk]);
}