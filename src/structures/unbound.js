const { basename, resolve, join } = require('path');
const http = require('http');
const Lodash = window._;

const EntityManager = require('@structures/managers/entities');
const PatchManager = require('@structures/managers/patches');
const StyleManager = require('@structures/managers/styles');
const APIManager = require('@structures/managers/api');
const CoreCommands = require('@core/commands');
const Updater = require('@core/updater');
const Patcher = require('@patcher');

const { createLogger } = require('@modules/logger');

const Logger = createLogger();

module.exports = class Unbound {
   static #styles = new StyleManager();
   static #patches = new PatchManager();
   static #commands = new CoreCommands();

   async start() {
      const start = new Date();
      Logger.log('Initializing client...');
      global.unbound = this;

      // Apply core styles
      Unbound.#styles.apply();

      // Initialize webpack instance & core APIs
      this.webpack = require('@webpack');
      this.apis = new APIManager();
      await this.apis.start();

      // Apply internal patches
      await Unbound.#patches.apply();

      // Export miscellaneous
      this.utilities = require('@utilities');
      this.constants = require('@constants');
      this.patcher = Patcher;

      // Initialize built-in managers
      this.managers = {
         plugins: new EntityManager('plugins'),
         themes: new EntityManager('themes')
      };

      // Load all entities
      this.managers.themes.loadAll();
      this.managers.plugins.loadAll();

      // Register core commands
      Unbound.#commands.register(this);

      const end = new Date() - start;
      Logger.log(`Initialized in ${end >= 1000 ? end / 1000 : `${end}m`}s.`);

      this.setupServer();
      this.checkForUpdates();
   }

   async setupServer() {
      this.server = http.createServer((req, res) => {
         res.statusCode = 200;

         const path = req.url.split(/[?#]/);
         const url = path[0];
         const query = path[1];

         res.setHeader('Access-Control-Allow-Origin', '*');

         const route = join(__dirname, '..', 'routes', url);
         if (!require.resolve(route)) {
            res.statusCode = 404;
            res.end();
         } else {
            try {
               const instance = require(route);
               instance(this, req, res, query);
            } catch (e) {
               console.log(e);
               // Well, shit.
               res.statusCode = 500;
               res.end();
            }
         }
      });

      this.server.listen(5858, () => {
         Logger.success(`Server running at port 5858`);
      });
   }

   async checkForUpdates() {
      Logger.log('Checking for updates...');

      try {
         const updates = await Updater.fetch();

         const { SettingsActions } = this.webpack.common || {};

         if (updates?.length && this.apis?.toasts && this.apis?.i18n) {
            const { strings } = this.apis.i18n;

            this.apis.toasts.open({
               title: strings.UPDATER_REMINDER_TITLE,
               content: strings.UPDATER_REMINDER_DESC,
               icon: 'UpdateAvailable',
               buttons: [
                  {
                     color: 'green',
                     text: strings.UPDATER_REMINDER_BUTTON,
                     onClick: () => {
                        SettingsActions?.open?.('unbound-updater');
                     }
                  }
               ],
               color: 'var(--info-positive-foreground)'
            });
         }

         Logger.log('Update check complete.');
      } catch (e) {
         Logger.error('Failed to check entity updates on startup.');
      }
   }

   async restart() {
      await this.shutdown();

      // Use global instead which has the "require" inside so
      // that way, the cache gets refreshed and any edited code
      // is applied on this restartart
      await global.unbound.start();
   }

   async shutdown() {
      this.server?.close();
      Object.keys(this.managers ?? {}).map(m => {
         this.managers[m].destroy();
      });

      // Remove commands
      Unbound.#commands.remove();

      Unbound.#styles?.remove?.();
      await this.apis?.stop?.();
      await Unbound.#patches.remove();

      // Get all patcher callers for unpatching
      const callers = Lodash.uniq(Patcher.patches.map(a => a.caller));
      for (const caller of callers) {
         Patcher.unpatchAll(caller);
      }

      // Remove unbound's head
      const head = document.querySelector('unbound-head');
      head?.remove?.();

      // Clear require cache to allow for any code changes to apply
      const parent = basename(resolve(__dirname, '..', '..'));
      const cache = Object.keys(require.cache).filter(c => ~c.indexOf(parent));
      cache.map(c => delete require.cache[c]);

      // Replace the global with a new one
      delete global.unbound;
      global.unbound = {
         start: async () => {
            const Webpack = require('@webpack');
            await Webpack.init();

            const Unbound = require('@structures/unbound');
            const instance = new Unbound();
            await instance.start();
         },
         shutdown: () => { },
         restart: () => global.unbound.start()
      };
   }
};