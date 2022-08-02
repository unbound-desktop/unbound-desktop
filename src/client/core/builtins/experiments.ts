import { Constants } from '@webpack/common';
import { Users } from '@webpack/stores';
import { create } from '@patcher';

const Patcher = create('unbound-experiments');

export const data = {
   name: 'Experiments',
   id: 'dev.experiments',
   default: false,
   restart: true,
   wait: false
};

export function initialize() {
   const unpatch = Patcher.after(Users, 'getCurrentUser', (_, __, res) => {
      if (!res) return;

      return new Proxy({}, {
         get(_, prop) {
            if (prop === 'hasFlag') {
               return function (flag) {
                  if (flag === Constants.UserFlags.STAFF) {
                     unpatch();
                     return true;
                  }

                  return res.hasFlag.call(this, flag);
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