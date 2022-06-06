const { Flux, Dispatcher } = require('@webpack/common');
const { createLogger } = require('@modules/logger');
const { resolve, join } = require('path');
const { writeFileSync } = require('fs');
const { paths } = require('@constants');
const fs = require('fs');

const Lodash = window._;
const Logger = createLogger('Settings', 'Store');

const settings = {};

const PATH = join(paths.settings, GLOBAL_ENV.RELEASE_CHANNEL);

if (!fs.existsSync(paths.settings)) {
   fs.mkdirSync(paths.settings);
} else {
   if (!fs.existsSync(PATH)) fs.mkdirSync(PATH);
   const files = fs.readdirSync(PATH).filter(f => f.endsWith('.json'));

   for (const file of files) {
      const name = file.replace(/\.json/, '');
      try {
         const data = require(resolve(PATH, file));
         settings[name] = data;
      } catch {
         settings[name] = {};
      }
   }
}

class Settings extends Flux.Store {
   static id = 'UNBOUND_SETTINGS';

   constructor(Dispatcher, listeners) {
      super(Dispatcher, listeners);

      this.addChangeListener(Lodash.debounce(this.save, 200));
   }

   get id() {
      return Settings.id;
   }

   getSetting(file, setting, defaults) {
      return settings[file]?.[setting] ?? defaults;
   }

   get(file) {
      return settings[file] ?? {};
   }

   getAll() {
      return settings;
   }

   save() {
      for (const file in settings) {
         try {
            const contents = JSON.stringify(settings[file], null, 2);
            writeFileSync(join(paths.settings, GLOBAL_ENV.RELEASE_CHANNEL, `${file}.json`), contents);
         } catch (e) {
            Logger.error(`Failed to save settings file ${file}`, e);
         }
      }
   }
};

const Events = {
   'UNBOUND_GET_SETTING': ({ file, setting, defaults }) => {
      return settings[file][setting] ?? defaults;
   },

   'UNBOUND_SET_SETTING': ({ file, setting, value }) => {
      if (!settings[file]) settings[file] = {};

      if (typeof setting === 'object') {
         Object.assign(settings[file], setting);
      } else if (value == void 0) {
         delete settings[file][setting];
      } else {
         settings[file][setting] = value;
      }
   },

   'UNBOUND_TOGGLE_SETTING': ({ file, setting, defaults }) => {
      if (!settings[file]) settings[file] = {};

      if (settings[file][setting] === void 0) {
         settings[file][setting] = !defaults;
      } else {
         settings[file][setting] = !settings[file][setting];
      }
   }
};

module.exports = Flux.Store.getAll().find(s => s.id === Settings.id) ?? new Settings(Dispatcher, Events);