const { colors } = require('@constants');

module.exports = class Addon {
   constructor(instance) {
      this.instance = instance;
      this.started = false;
   }

   start() { }

   stop() { }

   load() { }

   get configurator() {
      return null;
   }

   get color() {
      return colors.primary;
   }

   get manifest() {
      return this.data;
   }

   get dependencies() {
      return this.data.dependencies;
   }
};