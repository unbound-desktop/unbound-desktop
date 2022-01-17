const Addon = require('@structures/addon');
const { logger } = require('@modules');

module.exports = class Plugin extends Addon {
   constructor(instance, data) {
      super(instance, data);

      this.logger = new logger('Plugin', data.name);
      this.settingsTab = null;
   }

   registerSettings(component) {
      if (typeof component !== 'function') {
         throw new TypeError('first argument "component" should be of type function');
      }

      this.settingsTab = component;
   }

   unregisterSettings() {
      this.settingsTab = null;
   }
};