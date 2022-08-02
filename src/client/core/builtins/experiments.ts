import { Users } from '@webpack/stores';
import { create } from '@patcher';

const Patcher = create('unbound-experiments');

export const data = {
   name: 'Experiments',
   id: 'dev.experiments',
   default: false,
   wait: false
};

export function initialize() {
   const unpatch = Patcher.after(Users, 'getCurrentUser', (_, __, res) => {
      if (!res) return;

      return new Proxy({}, {
         get(_, prop) {
            if (prop === 'hasFlag') {
               return function (...args) {
                  if (args[0] === 1) {
                     unpatch();
                     return true;
                  }

                  return res.hasFlag.apply(this, args);
               };
            }

            return res[prop];
         }
      });
   });
}

export function shutdown() {
   Patcher.unpatchAll();
}