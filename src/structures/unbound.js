const { basename, resolve } = require('path');

const APIManager = require('@structures/apis/manager');
const Manager = require('@structures/manager');
const PatchManager = require('@core/patches');
const Logger = require('@modules/logger');
const Styles = require('@core/styles');

module.exports = class Unbound {
   static #styles = new Styles();

   constructor() {
      this.logger = new Logger('Core');
   }

   async start() {
      global.unbound = this;
      this.webpack = require('@webpack');

      Unbound.#styles.apply();

      this.apis = new APIManager();
      await this.apis.start();

      this.patches = new PatchManager();
      await this.patches.apply();

      this.utilities = require('@utilities');
      this.constants = require('@constants');

      this.managers = {
         plugins: new Manager('plugins'),
         themes: new Manager('themes')
      };

      this.managers.themes.loadAll();
      this.managers.plugins.loadAll();
   }

   async restart() {
      await this.shutdown();
      await global.unbound.start();
   }

   async shutdown() {
      const Patcher = require('@patcher');

      Unbound.#styles?.remove?.();
      await this.apis?.stop?.();
      await this.patches?.remove?.();

      Object.keys(this.managers ?? {}).map(m => {
         this.managers[m].unloadAll();
      });

      const temp = [];
      const callers = Patcher.patches?.filter(e => {
         if (temp.includes(e.caller)) return false;

         temp.push(e.caller);
         return true;
      }).map(p => p.caller);

      for (const caller of callers) {
         Patcher.unpatchAll(caller);
      }

      const parent = basename(resolve(__dirname, '..', '..'));
      const cache = Object.keys(require.cache).filter(c => ~c.indexOf(parent));
      cache.map(c => delete require.cache[c]);

      delete global.unbound;
      global.unbound = {
         start: async () => {
            const Webpack = require('@webpack');
            await Webpack.init();

            const Unbound = require('@structures/unbound');
            global.unbound = new Unbound();
            await unbound.start();
         }
      };
   }
};