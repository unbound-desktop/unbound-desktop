const Logger = require('@modules/logger');

module.exports = class API {
   name = this.constructor.name;
   logger = new Logger('API', this.name);

   start() { }
   stop() { }

   async reload() {
      await this.stop();
      await this.start();
   }
};