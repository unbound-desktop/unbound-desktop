const { createLogger } = require('@modules/logger');
const { memoize } = require('@utilities/');
const Logger = createLogger('APIs');

const getEntities = memoize(() => require('@api'));

module.exports = class APIs {
   async start() {
      const entities = getEntities();

      for (const api in entities) {
         try {
            await entities[api].start?.();

            Object.defineProperty(this, api, {
               get: () => entities[api],
               configurable: true
            });
         } catch (e) {
            Logger.error(`Could not start the ${api} API.`, e);
         }
      }

      Logger.log('Finished loading.');
   }

   async stop() {
      const entities = getEntities();

      for (const api in entities) {
         try {
            await entities[api].stop?.();
            delete this[api];
         } catch (e) {
            Logger.error(`Could not stop the ${api} API.`, e);
         }
      }

      Logger.log('Finished unloading.');
   }
};