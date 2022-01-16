const { logger } = require('@modules');
const Logger = new logger('Core');

module.exports = class Unbound {
   constructor() {
      this.init();

      // this.modules = require('../core/modules');
   }

   async init() {
      this.webpack = require('@webpack');

      this.apis = require('@structures/apis/manager');
      await this.apis.start();

      this.managers = {
         plugins: require('@managers/plugins'),
         themes: require('@managers/themes')
      };

      this.constants = require('@constants');
      this.utilities = require('@utilities');
   }
};