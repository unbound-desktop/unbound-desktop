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
   const events = Object.values(Dispatcher._dependencyGraph.nodes);

   // Don't run code block incase experiments is toggled before the above resolves
   if (data.cancelled) return;

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

   function onDispatch() {
      // Call the dispatcher action handler with the spoofed flags to internally allow bucket overrides
      const ExperimentStore = events.find(h => h.name === 'ExperimentStore');
      console.log(ExperimentStore);
      if (ExperimentStore) ExperimentStore.actionHandler.CONNECTION_OPEN({
         type: 'CONNECTION_OPEN',
         guildExperiments: [],
         experiments: [],
         user: {
            ...Users.getCurrentUser(),
            flags: 1,
         }
      });

      // Call the dispatcher action handler to update isDeveloper internally
      const DeveloperExperimentStore = events.find(h => h.name === 'DeveloperExperimentStore');
      if (DeveloperExperimentStore) DeveloperExperimentStore.actionHandler.CONNECTION_OPEN();

      Dispatcher.unsubscribe('CONNECTION_OPEN', onDispatch);
      unpatch();
   }

   if (Users.getCurrentUser()) {
      onDispatch();
   } else {
      Dispatcher.subscribe('CONNECTION_OPEN', onDispatch);
   }

}

export function shutdown() {
   data.cancelled = true;
   Patcher.unpatchAll();
}