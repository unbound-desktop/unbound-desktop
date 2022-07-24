import { findByDisplayName } from '@webpack';

const cache = {};

export = new Proxy({}, {
   get: function (_, prop) {
      if (cache[prop]) return cache[prop];

      const name = prop.toString().replace('Raw', '');
      const res = findByDisplayName(name, { interop: !prop.toString().startsWith('Raw') ?? true });

      if (res) cache[prop] = res;

      return res;
   }
});