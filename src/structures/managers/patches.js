const { createLogger } = require('@modules/logger');
const { readdirSync } = require('fs');
const { resolve } = require('path');

const Logger = createLogger('Core', 'Patches');

module.exports = class Patches {
   constructor() {
      const path = resolve(__dirname, '..', '..', 'core', 'patches');
      const entities = readdirSync(path).filter(f => f !== 'index.js');

      this.patches = Object.fromEntries(entities.map(file => {
         const items = file.split('.');
         if (items.length != 1) items.splice(items.length - 1, 1);

         return [items.join('.'), require(`${path}/${file}`)];
      }));

      this.entities = new Map();
   }

   async apply() {
      for (const patch in this.patches) {
         try {
            const instance = new this.patches[patch]();
            instance.id = patch;

            instance.apply();
            this.entities.set(patch, instance);
         } catch (e) {
            Logger.error(`Could not apply the ${patch} patch.`, e);
         }
      }

      Logger.log('Internal patches applied.');
   }

   async remove() {
      for (const patch of [...this.entities.values()]) {
         try {
            patch.remove();
            this.entities.delete(patch.id);
         } catch (e) {
            Logger.error(`Could not remove the ${patch} patch.`, e);
         }
      }

      Logger.log('Internal patches removed.');
   }
};