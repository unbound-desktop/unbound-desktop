const { logger } = require('@modules');
const { readdirSync } = require('fs');
const { basename } = require('path');
const Logger = new logger('Patches');

module.exports = class Patches {
   constructor() {
      this.patches = Object.fromEntries(readdirSync(__dirname).filter(f => f !== basename(__filename)).map(file => {
         const items = file.split('.');
         if (items.length != 1) items.splice(items.length - 1, 1);

         return [items.join('.'), require(`${__dirname}/${file}`)];
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