/*
 * More limited version of the original unbound global.
 * It's duplicate code, but loading the original will
 * cause it to not load as there's APIs which rely on
 * webpack modules that aren't in the splash screen.
 */

import { createLogger } from '@common/logger';
import * as Settings from '@api/settings';
import { basename, resolve } from 'path';
import * as Managers from '@managers';
import * as Webpack from '@webpack';

const Logger = createLogger();

class Unbound {
  apis: Record<string, any>;
  webpack = Webpack;
  managers: {
    plugins: Managers.Plugins;
  };

  async initialize(): Promise<void> {
    (global.unbound as any) = this;

    Logger.log('Initializing...');
    const start = performance.now();

    this.apis = {
      settings: Settings
    };

    // Initialize APIs
    for (const api in this.apis) {
      const instance = this.apis[api];
      await instance.initialize();
    }

    this.managers = {
      plugins: new Managers.Plugins()
    };

    this.managers.plugins.initialize();

    Logger.log(`Initialized in ${Math.round(performance.now() - start)}ms.`);
  }

  async shutdown(): Promise<void> {
    Logger.log('Shutting down...');

    this.managers.plugins.shutdown();

    await Webpack.shutdown();

    // Clear require cache to allow for any code changes to apply
    const parent = basename(resolve(__dirname, '..', '..', '..'));
    const cache = Object.keys(require.cache).filter(c => ~c.indexOf(parent));
    cache.map(c => delete require.cache[c]);

    delete global.unbound;
    (global.unbound as any) = {
      initialize: async () => {
        const Webpack = require('@webpack');
        await Webpack.initialize();

        const Client = require('./unbound');
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
};

export = Unbound;