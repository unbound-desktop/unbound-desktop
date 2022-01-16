const Addon = require('@structures/addon');
const { logger } = require('@modules');

module.exports = class Plugin extends Addon {
   constructor(instance, data) {
      super(instance, data);

      this.logger = new logger('Plugin', data.name);
   }
};