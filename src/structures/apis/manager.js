const { logger } = require('@modules');
const Logger = new logger('APIs');

module.exports = class APIs {
   constructor() {
      this.apis = require('@api');
   }

   async start() {
      for (const api in this.apis) {
         try {
            await this.apis[api].start?.();
         } catch (e) {
            Logger.error(`Could not start the ${api} API.`, e);
         }
      }

      Logger.log('Finished loading.');
   }

   async stop() {
      for (const api in this.apis) {
         try {
            await this.apis[api].stop?.();
         } catch (e) {
            Logger.error(`Could not stop the ${api} API.`, e);
         }
      }
   }
};