import { basename, join, resolve } from 'path';
import * as Utilities from '@common/utilities';
import { createLogger } from '@common/logger';
import * as BuiltIns from '@core/builtins';
import * as Patches from '@core/patches';
import * as Managers from '@managers';
import * as Webpack from '@webpack';
import { createServer } from 'http';
import Patcher from '@patcher';
import * as APIs from '@api';

const Logger = createLogger();

class Unbound {
   #sockets: any = new Set();
   server: any;
   apis: Record<string, any>;
   utilities = Utilities;
   patcher = Patcher;
   webpack = Webpack;
   managers: {
      plugins: Managers.Plugins;
      themes: Managers.Themes;
   };

   async initialize(): Promise<void> {
      global.unbound = this;

      Logger.log('Initializing...');
      const start = performance.now();

      // Initialize core patches
      await Patches.initialize();

      // Initialize builtins
      await BuiltIns.initialize();

      // Initialize APIs
      this.apis = {};
      for (const api in APIs) {
         const name = api.toLowerCase();

         this.apis[name] = APIs[api];
         await this.apis[name].initialize?.();
      }

      this.managers = {
         plugins: new Managers.Plugins(),
         themes: new Managers.Themes()
      };

      this.managers.themes.initialize();
      this.managers.plugins.initialize();

      Logger.log(`Initialized in ${Math.round(performance.now() - start)}ms.`);

      // Offload server to another thread
      this.#setupServer();
   }

   async shutdown(): Promise<void> {
      // Destroy all pending HTTP sockets
      for (const socket of this.#sockets) {
         socket.destroy();
         this.#sockets.delete(socket);
      }

      this.server?.close?.(() => Logger.debug('Server closed'));

      Logger.log('Shutting down...');

      this.managers.plugins.shutdown();
      this.managers.themes.shutdown();

      for (const api in APIs) {
         const name = api.toLowerCase();

         this.apis[name] = APIs[api];
         await this.apis[name].shutdown?.();
      }

      await Patches.shutdown();
      await BuiltIns.shutdown();
      await Webpack.shutdown();

      // @ts-ignore Remove all styles related to unbound
      const styles = [...document.querySelectorAll('style[data-unbound="true"')];
      for (const style of styles) style.remove();

      // Clear require cache to allow for any code changes to apply
      const parent = basename(resolve(__dirname, '..', '..', '..'));
      const cache = Object.keys(require.cache).filter(c => ~c.indexOf(parent));

      for (let i = 0, len = cache.length; i < len; i++) {
         const mod = require.cache[cache[i]];
         delete require.cache[cache[i]];

         // Delete parent children to avoid memory leaks
         for (let k = 0; k < mod.parent.children.filter(Boolean).length; k++) {
            if (!mod.parent.children[k]) continue;
            if (~mod.parent.children[k].path.indexOf(parent)) {
               mod.parent.children.splice(k, 1);
               break;
            }
         }
      }

      delete global.unbound;
      (global.unbound as any) = {
         initialize: async () => {
            const Webpack = require('@webpack');
            await Webpack.initialize();

            const Client = require('@structures/unbound');
            const instance = new Client();
            await instance.initialize();
         },
         restart: () => global.unbound.initialize(),
         shutdown: () => { }
      };
   }

   async restart(): Promise<void> {
      await this.shutdown();
      await global.unbound?.initialize?.();
   }

   #setupServer() {
      this.server = createServer(this.#onRequest.bind(this));

      this.server.on('connection', (socket) => {
         this.#sockets.add(socket);

         this.server.once('close', () => {
            this.#sockets.delete(socket);
         });
      });

      this.server.listen(9859, () => Logger.debug('Server running at port 9859'));
   }

   #onRequest(req, res) {
      res.statusCode = 200;

      const method = req.method.toLowerCase();
      const path = req.url.split(/[?#]/);
      const query = path[1];
      const url = path[0];

      res.setHeader('Access-Control-Allow-Origin', '*');

      if (!url || url === '/') return res.end();

      const route = join(__dirname, '..', 'routes', url);
      if (!require.resolve(route)) {
         res.statusCode = 404;
         res.end();
      } else {
         try {
            const instance = require(route);

            // 405 Method Not Allowed
            if (!instance[method]) {
               res.statusCode = 405;
               return res.end();
            }

            instance[method](this, req, res, query);
         } catch (e) {
            // Well, shit.
            Logger.error(`Router failed to route request. (URL: ${url})`, e);
            res.statusCode = 500;
            res.end();
         }
      }
   }
};

export = Unbound;