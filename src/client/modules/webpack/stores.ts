import { findStore } from '@webpack';

const cache: Record<string, any> = {};

export = new Proxy(cache, {
   get(_, prop: string) {
      const name = prop.endsWith('Store') ? prop.slice(0, prop.length - 5) : prop;

      if (!cache[name]) {
         cache[name] ??= findStore(name);
      }

      return cache[name];
   }
});