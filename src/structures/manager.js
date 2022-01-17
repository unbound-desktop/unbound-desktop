const { lstatSync, existsSync, readdirSync, mkdirSync, readFileSync } = require('fs');
const { resolve, join, basename } = require('path');
const { logger, constants } = require('@modules');
const Emitter = require('events');

module.exports = class Manager extends Emitter {
   constructor(type) {
      super();

      this.type = type?.toLowerCase?.();
      this.path = resolve(__dirname, '..', '..', this.type);

      this.entities = new Map();
      this.logger = new logger('Manager', this.constructor.name);

      this.loadAll();
   }

   loadAll() {
      const files = this.fetch();

      for (const file of files) {
         const entry = resolve(this.path, file);

         const isDir = lstatSync(entry).isDirectory();
         if (!isDir) continue;

         const manifest = join(entry, 'manifest.json');
         if (!existsSync(manifest)) continue;

         try {
            const data = JSON.parse(readFileSync(manifest, 'utf-8'));
            if (!data.id || !data.name) continue;
            if (this.entities.has(data.id)) continue;

            const Entity = require(resolve(this.path, entry, data.main ?? ''));

            try {
               this.validateManifest(data);
            } catch (e) {
               this.logger.error('Invalid manifest', e);
               continue;
            }

            const res = {
               instance: constants.entities[this.type](Entity.__esModule ? Entity.default : Entity, data),
               path: entry
            };

            this.assignData(data, res, entry);
            this.assignData(data, res.instance, entry);

            res.instance?.start?.();
            this.entities.set(basename(entry), res);
            this.logger.log(`${data.name} was loaded.`);
         } catch (e) {
            this.logger.error(`Failed to start ${basename(entry)}`, e);
         }
      }
   }

   assignData(data, object, path) {
      Object.defineProperties(object, {
         data: {
            get: () => data,
            set: () => this.logger.error('Entity manifest changes are forbidden at runtime.')
         },
         id: {
            get: () => basename(path),
            set: () => this.logger.error('Entity ID changes are forbidden at runtime.')
         },
         path: {
            get: () => path,
            set: () => this.logger.error('Path changes are forbidden at runtime.')
         },
      });
   };

   validateManifest() {

   }

   load(entity) {

   }

   fetch() {
      if (!existsSync(this.path)) mkdirSync(this.path);

      return readdirSync(this.path);
   };
};