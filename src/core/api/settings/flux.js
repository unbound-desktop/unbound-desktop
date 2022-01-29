const { Flux, Dispatcher } = require('@webpack/common');
const { logger } = require('@modules');
const { resolve, join } = require('path');
const { writeFileSync } = require('fs');
const { paths } = require('@constants');
const fs = require('fs');

const Logger = new logger('Settings', 'Store');

const settings = {};

if (!fs.existsSync(paths.settings)) {
   fs.mkdirSync(paths.settings);
} else {
   const files = fs.readdirSync(paths.settings).filter(f => f.endsWith('.json'));

   for (const file of files) {
      const name = file.replace(/\.json/, '');
      try {
         const data = require(resolve(paths.settings, file));
         settings[name] = data;
      } catch {
         settings[name] = {};
      }
   }
}

class Settings extends Flux.Store {
   constructor(Dispatcher, listeners) {
      super(Dispatcher, listeners);

      this.addChangeListener(this.save);
   }

   getSetting(file, setting, defaults) {
      return settings[file][setting] ?? defaults;
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
            writeFileSync(join(paths.settings, `${file}.json`), contents);
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

      if (value == void 0) {
         delete settings[file][setting];
      } else {
         settings[file][setting] = value;
      }
   },

   'UNBOUND_TOGGLE_SETTING': ({ file, setting, defaults }) => {
      if (!settings[file]) settings[file] = {};

      if (settings[file][setting] == void 0) {
         settings[file][setting] = !defaults;
      } else {
         settings[file][setting] = !settings[file][setting];
      }
   }
};

module.exports = new Settings(Dispatcher, Events);