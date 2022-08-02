import { Constants, Dispatcher } from '@webpack/common';
import { Users } from '@webpack/stores';
import { sleep } from '@utilities';
import { create } from '@patcher';

const Patcher = create('unbound-experiments');

export const data = {
   name: 'Experiments',
   id: 'dev.experiments',
   default: false,
   restart: true,
   wait: false,

   cancelled: false
};

export async function initialize() {
   data.cancelled = false;

   // Wait for dispatcher handlers
   const events = Dispatcher._orderedActionHandlers;
   while (!events.CONNECTION_OPEN) await sleep(10);

   // Don't run code block incase experiments is toggled before the above resolves
   if (data.cancelled) return;

   // Grab handlers for CONNECTION_OPEN
   const Handlers = events['CONNECTION_OPEN'];

   // Spoof the staff flag
   const unpatch = Patcher.after(Users, 'getCurrentUser', (_, __, res) => {
      if (!res) return;

      return new Proxy({}, {
         get(_, prop) {
            if (prop === 'hasFlag') {
               return function (flag) {
                  if (flag === Constants.UserFlags.STAFF) {
                     return true;
                  }

                  return res.hasFlag.call(this, flag);
               };
            }

            return res[prop];
         }
      });
   });

   // Call the dispatcher action handler with the spoofed flags to internally allow bucket overrides
   const ExperimentStore = Handlers.find(h => h.name === 'ExperimentStore');
   if (ExperimentStore) ExperimentStore.actionHandler({
      type: 'CONNECTION_OPEN',
      guildExperiments: [],
      experiments: [],
      user: {
         ...Users.getCurrentUser(),
         flags: 1,
      }
   });

   // Call the dispatcher action handler to update isDeveloper internally
   const DeveloperExperimentStore = Handlers.find(h => h.name === 'DeveloperExperimentStore');
   if (DeveloperExperimentStore) DeveloperExperimentStore.actionHandler();

   unpatch();
}

export function shutdown() {
   data.cancelled = true;
   Patcher.unpatchAll();
}