const { logger } = require('@modules');
const Logger = new logger('APIs');
const Lodash = window._;

module.exports = class APIs {
   constructor() {
      this.entities = require('@api');
   }

   async start() {
      const apis = Lodash.cloneDeep(this.entities);
      for (const api in apis) {
         try {
            await this.entities[api].start?.();
            this[api] = apis[api];
         } catch (e) {
            Logger.error(`Could not start the ${api} API.`, e);
         }
      }

      Logger.log('Finished loading.');
   }

   async stop() {
      const apis = Lodash.cloneDeep(this.entities);
      for (const api in apis) {
         try {
            await this.entities[api].stop?.();
            delete this[api];
         } catch (e) {
            Logger.error(`Could not stop the ${api} API.`, e);
         }
      }
   }
};