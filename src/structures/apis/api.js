const { logger } = require('@modules');

module.exports = class API {
   name = this.constructor.name;
   logger = new logger('API', this.name);

   start() { }
   stop() { }

   async reload() {
      await this.stop();
      await this.start();
   }
};