import { findByDisplayName } from '@webpack';

const cache: Record<string, any> = {};

export = new Proxy(cache, {
   get(_, prop: string) {
      if (!cache[prop]) {
         const name = prop.toString().replace('Raw', '');
         const interop = !prop.toString().startsWith('Raw') ?? true;

         cache[prop] ??= findByDisplayName(name, { interop });
      }

      return cache[prop];
   }
});