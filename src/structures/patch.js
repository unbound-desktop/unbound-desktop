const Logger = require('@modules/logger');

module.exports = class Patch {
   name = this.constructor.name;
   logger = new Logger('Patch', this.name);

   start() { }
   stop() { }

   async reload() {
      await this.stop();
      await this.start();
   }
};