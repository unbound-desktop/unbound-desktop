const { lstatSync, existsSync, readdirSync, mkdirSync, readFileSync } = require('fs');
const { constants, utilities: { capitalize } } = require('@modules');
const { resolve, join, basename } = require('path');
const Logger = require('@modules/logger');
const Emitter = require('events');

module.exports = class Manager extends Emitter {
   constructor(type) {
      super();

      this.type = type?.toLowerCase?.();
      this.path = resolve(__dirname, '..', '..', this.type);

      this.entities = new Map();
      this.logger = new Logger('Manager', capitalize(this.type));
   }

   loadAll() {
      const files = this.fetch();

      for (const file of files) {
         if (this.entities.get(file)) continue;
         this.load(file);
      }
   }

   assignData(data, object, path) {
      Object.defineProperties(object, {
         data: {
            get: () => data,
            set: () => this.logger.error('Entity manifest changes are forbidden at runtime.')
         },
         id: {
            get: () => data.id,
            set: () => this.logger.error('Entity ID changes are forbidden at runtime.')
         },
         path: {
            get: () => path,
            set: () => this.logger.error('Path changes are forbidden at runtime.')
         },
      });
   };

   validateManifest(data) {
      const keys = ['name', 'id', 'author', 'version'];
      const missing = keys.filter(k => !data[k]);

      if (missing?.length) {
         throw `${data.name} is missing the following manifest keys: ${missing.join(', ')}`;
      }
   }

   load(id) {
      if (!existsSync(resolve(this.path, id))) {
         throw new Error(`That entity doesn't exist in the ${this.type} folder.`);
      }

      const entry = resolve(this.path, id);
      const isDir = lstatSync(entry).isDirectory();
      if (!isDir) throw new Error(`${id} isn't a directory.`);

      const manifest = join(entry, 'manifest.json');
      if (!existsSync(manifest)) throw new Error(`${id} is missing a manifest.`);

      try {
         const data = JSON.parse(readFileSync(manifest, 'utf-8'));
         if (!data?.id || !data?.name) {
            throw new Error(`${id} is missing the manifest keys "name" or "id"`);
         }

         const Entity = require(resolve(this.path, entry, data.main ?? ''));
         const id = basename(entry);

         try {
            this.validateManifest(data);
         } catch (e) {
            return this.logger.error(e);
         }

         const res = {
            instance: constants.entities[this.type](Entity.__esModule ? Entity.default : Entity, data),
            path: entry
         };

         this.assignData(data, res, entry);
         this.assignData(data, res.instance, entry);

         res.instance?.load?.();

         this.entities.set(id, res);
         this.emit('load', id, res);

         return res;
      } catch (e) {
         this.logger.error(`Failed to start ${id}`, e);
         return null;
      }
   }

   start(id) {
      let entity = this.entities.get(id);
      if (!entity) entity = this.load(id);

      if (entity && entity.instance && !entity.started) {
         entity.instance.start?.();
         entity.started = true;
      }
   }

   stop(id) {
      const entity = this.entities.get(id);
      if (entity && entity.instance && entity.started) {
         entity.instance.stop?.();
         entity.started = false;
      }
   }

   unload(id) {
      const entity = this.entities.get(id);
      if (entity) {
         try {
            entity?.instance?.stop?.();
         } catch (e) {
            this.logger.error(`FATAL: ${id} was not able to unload properly, a reload using CTRL+R is recommended.`);
         }

         this.entities.delete(id);
      }
   }

   fetch() {
      if (!existsSync(this.path)) mkdirSync(this.path);

      return readdirSync(this.path);
   };
};