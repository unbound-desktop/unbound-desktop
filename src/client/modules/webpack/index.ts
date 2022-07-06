import { createLogger } from '@common/logger';
import type { Common } from '@common/data/modules';
import modules from '@common/data/modules';
import splash from '@common/data/splash';

const Logger = createLogger('Webpack');

interface Options {
  all?: boolean;
  cache?: boolean;
  interop?: boolean;
  traverse?: string[];
}

/* SETUP */
export const listeners = new Set();
export const common: Record<Common, any> | Record<any, any> = {};
export const data = {
  initialized: false,
  global: 'webpackChunkdiscord_app',
  instance: null,
  push: null,
  sentry: {
    blocked: false,
    tries: 0
  },
};


/* FILTERS */
export const filters = {
  byProps: (...props) => (mdl) => {
    for (let i = 0, len = props.length; i < len; i++) {
      if (mdl[props[i]] === void 0) {
        return false;
      }
    }

    return true;
  },
  byPrototypes: (...props) => (mdl) => {
    for (let i = 0, len = props.length; i < len; i++) {
      if (mdl.prototype?.[props[i]] === void 0) {
        return false;
      }
    }

    return true;
  },
  byDisplayName: (name, def = true, deep = false, exact = true) => (mdl) => {
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
  },
  byString: (...strings) => (mdl) => {
    return typeof mdl === 'function' && mdl?.toString === Object.toString && strings.every(s => mdl.toString?.()?.includes?.(s));
  },
  byStoreName: (name) => (mdl) => {
    return mdl.getName?.() === name;
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
export function find(filter: (...args) => any, {
  all = false,
  cache = true,
  interop = true
}: Options = {}) {
  if (!filter) {
    throw new Error('Webpack searches require a filter to search by.');
  }

  const instance = request(cache);
  if (!instance) return;

  let error = false;
  const found = [];

  function search(mdl: any, index: number | string) {
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

  for (const id in instance.c) {
    const mdl = instance.c[id].exports;
    if (!mdl || mdl === window) continue;

    switch (typeof mdl) {
      case 'object':
        if (search(mdl, id)) {
          if (!all) return mdl;
          found.push(mdl);
        }

        if (mdl.default && search(mdl.default, id)) {
          const value = interop ? mdl.default : mdl;

          if (!all) return value;
          found.push(value);
        }

        break;
      case 'function':
        if (!search(mdl, id)) continue;
        if (!all) return mdl;
        found.push(mdl);

        break;
    }
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

export function findLazy(filter: (...args: any[]) => any, { all = false, interop = true } = {}) {
  const cache = find(filter, { all, interop });
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
      if (search(m)) {
        found.push(m);
      }

      if (m.default && search(m.default)) {
        const value = interop ? m.default : m;
        found.push(value);
      }

      if (found.length) {
        resolve(all ? found : found[0]);
        remove();
      }
    };

    const remove = addListener(listener);
  });
}

export function findByProps(...options: any[]): any {
  const [props, { bulk = false, wait = false, ...rest }] = parseOptions(options);

  if (bulk) {
    return exports.bulk(...props.map(p => filters.byProps(...p)), { wait, ...rest });
  } else if (wait) {
    return findLazy(filters.byProps(...props), rest);
  }

  return find(filters.byProps(...props), rest);
}

export function findByString(...options: any[]): any {
  const [strings, { bulk = false, iterop = true, wait = false, ...rest }] = parseOptions(options);

  if (bulk) {
    return exports.bulk(...strings.map(p => filters.byString(...p)), { wait, ...rest });
  } else if (wait) {
    return findLazy(filters.byString(...strings), rest);
  }

  return find(filters.byString(...strings), rest);
}

export function findByDisplayName(...options: any[]): any {
  const [displayName, { bulk = false, interop = true, deep = false, exact = true, wait = false, ...rest }] = parseOptions(options);

  if (bulk) {
    return bulk(displayName.map(filters.byDisplayName, interop, deep, exact), { wait, ...rest });
  } else if (wait) {
    return findLazy(filters.byDisplayName(displayName[0], interop, deep, exact), rest);
  }

  return find(filters.byDisplayName(displayName[0], interop, deep, exact), rest);
}

export function bulk(...options: any[]): any[] {
  const [filters, { wait = false, ...rest }] = parseOptions(options);
  if (!filters || !filters.length) return;

  let error = false;
  const found = new Array(filters.length);
  const search = wait ? findLazy : find;
  const wrapped = filters.map(filter => (mdl) => {
    try {
      return filter(mdl);
    } catch (e) {
      if (!error) {
        Logger.warn('Uncaught Exception with filter. This can cause lag spikes & slow startup times. Please handle any possible null cases in your filter.', e.message);
        error = true;
      }

      return false;
    }
  });

  const res = search((module) => {
    for (let i = 0; i < wrapped.length; i++) {
      const filter = wrapped[i];
      if (typeof filter !== 'function' || !filter(module) || found[i] != null) continue;

      found[i] = module;
    }

    return found.filter(String).length === filters.length;
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
    await findLazy(m => m.popLayer);
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

  try {
    await initializeModules();
  } catch (e) {
    Logger.error('Failed to initialize common modules.', e.message);
  }

  data.initialized = true;
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

async function initializeModules() {
  const filters = [];
  const payload = window.__SPLASH__ ? splash : modules;

  for (const name in payload) {
    const mdl = modules[name];

    if (mdl.submodule) {
      if (!mdl.items) continue;

      const modules = {};
      for (const entry in mdl.items) {
        const item = mdl.items[entry];
        const res = handleCommonModule(entry, item);
        res.id = name;

        const oResMap = res.map;
        res.map = (mdl) => {
          const res = oResMap?.(mdl) ?? mdl;
          modules[entry] = res;
          return modules;
        };

        filters.push(res);
      }
    } else {
      const res = handleCommonModule(name, mdl);
      filters.push(res);
    }
  }

  const results = bulk(...filters.map(({ filter }) => filter));
  filters.map(({ id, map }, index) => {
    const mapper = map ?? (_ => _);
    const res = mapper(results[index]);
    common[id] = res;
  });
}

function handleCommonModule(name: string, module: Record<string, any>): Record<string, any> {
  if (module.storeName) {
    return {
      id: name,
      filter: filters.byStoreName(module.storeName),
      map: module.prop ? (mdl) => mdl[module.prop] : null
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
          const res = filters.byProps(...module.props)(mdl);
          if (res && module.ensure && !module.ensure(mdl)) {
            return false;
          }

          return res;
        },
        map: module.prop ? (mdl) => mdl[module.prop] : null
      };
    }
  } else if (module.displayName) {
    return {
      id: name,
      filter: filters.byDisplayName(module.displayName, module.default ?? true),
      map: module.prop ? (mdl) => mdl[module.prop] : null
    };
  } else if (module.filter) {
    return {
      id: name,
      filter: module.filter,
      map: module.prop ? (mdl) => mdl[module.prop] : null
    };
  }
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

function parseOptions(args, filter = o => typeof o === 'object' && !Array.isArray(o)) {
  return [args, filter(args[args.length - 1]) ? args.pop() : {}];
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