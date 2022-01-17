const { logger } = require('@modules');

module.exports = class Unbound {
   constructor() {
      this.init();

      this.logger = new logger('Core');
      // this.modules = require('../core/modules');
   }

   async init() {
      this.webpack = require('@webpack');

      this.apis = require('@structures/apis/manager');
      await this.apis.start();

      this.utilities = require('@utilities');
      this.constants = require('@constants');

      this.managers = {
         plugins: require('@managers/plugins'),
         themes: require('@managers/themes')
      };
   }
};