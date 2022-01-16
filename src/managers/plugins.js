const Manager = require('@structures/manager');

module.exports = new class Plugins extends Manager {
   constructor() {
      super('plugins', 'plugin');
   }
};