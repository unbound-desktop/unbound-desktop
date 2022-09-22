import { findStore, common } from '@webpack';

const out: Record<string, any> = common.Stores;

export = new Proxy(out, {
   get(_, prop: string) {
      if (!out[prop]) {
         const payload = findStore(prop);

         if (payload) out[prop] ??= payload;

         return payload;
      }

      return out[prop];
   }
});