const APIManager = require('@structures/apis/manager');
const Manager = require('@structures/manager');
const Logger = require('@modules/logger');

module.exports = class Unbound {
   constructor() {
      this.logger = new Logger('Core');

      this.init();
   }

   async init() {
      this.webpack = require('@webpack');
      require('@core/patches');

      const APIs = new APIManager();
      await APIs.start();
      this.apis = APIs.apis;

      this.utilities = require('@utilities');
      this.constants = require('@constants');

      this.managers = {
         plugins: new Manager('plugins'),
         themes: new Manager('themes')
      };

      this.managers.themes.loadAll();
      this.managers.plugins.loadAll();
   }
};