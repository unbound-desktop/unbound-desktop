const { lstatSync, existsSync, readdirSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { constants, utilities: { capitalize } } = require('@modules');
const { resolve, join, basename } = require('path');
const Logger = require('@modules/logger');
const { paths } = require('@constants');
const { watch } = require('chokidar');
const Emitter = require('events');

module.exports = class Manager extends Emitter {
   constructor(type) {
      super();

      this.type = type?.toLowerCase?.();
      this.path = resolve(__dirname, '..', '..', this.type);

      this.entities = new Map();
      this.logger = new Logger('Manager', capitalize(this.type));
      this.settings = window.unbound ? window.unbound.apis.settings.makeStore('enabled-entities') : (() => {
         let store = {};

         const releaseChannel = window.DiscordSplash?.getReleaseChannel?.() ?? 'stable';
         if (!existsSync(paths.settings)) mkdirSync(paths.settings);

         const PATH = join(paths.settings, releaseChannel);
         if (!existsSync(PATH)) mkdirSync(PATH);

         try {
            store = JSON.parse(readFileSync(join(PATH, 'enabled-entities.json'), 'utf-8'));
         } catch { }

         const save = () => {
            writeFileSync(join(PATH, 'enabled-entities.json'), JSON.stringify(store, null, 2), 'utf-8');
         };

         return {
            settings: store,
            set: (setting, value) => {
               if (!setting || typeof setting != 'string') {
                  throw new TypeError('the second argument setting must be of type string');
               }

               if (value == void 0) {
                  delete store[setting];
               } else {
                  store[setting] = value;
               }

               save();
            },

            get: (setting, defaults) => {
               if (!setting || typeof setting != 'string') {
                  throw new TypeError('the second argument setting must be of type string');
               }

               return store[setting] ?? defaults;
            },

            toggle: (setting, defaults) => {
               if (!setting || typeof setting != 'string') {
                  throw new TypeError('the second argument setting must be of type string');
               } else if (!defaults || typeof defaults != 'boolean') {
                  throw new TypeError('the third argument defaults must be of type boolean');
               }

               store[setting] = !store[setting] ?? !defaults;

               save();
            }
         };
      })();

      this.panel = () => {
         const { Manager } = require('@core/components');
         const { React } = require('@webpack/common');

         return React.createElement(Manager, {
            type: this.type,
         });
      };

      this.watcher = watch(this.path, {
         ignored: /((^|[\/\\])\..|.git|node_modules)/,
         ignoreInitial: true,
         persistent: true
      });

      this.watcher.on('addDir', (path) => {
         try {
            this.reload(basename(path));
            this.emit('changed');
         } catch { }
      });

      this.watcher.on('unlinkDir', (path) => {
         try {
            this.unload(basename(path));
            this.emit('changed');
         } catch { }
      });

      window.addEventListener('unload', () => this.watcher.close());
   }

   resolve(idOrName) {
      if (!idOrName) {
         throw new TypeError('first argument idOrName must be of type string or object');
      }

      const direct = this.entities.get(idOrName.instance ? idOrName.instance.id : idOrName);
      if (direct) return direct;

      const folder = [...this.entities.values()].find(e => e.folder == idOrName);
      if (folder) return folder;
   }

   loadAll() {
      const files = this.fetch();

      for (const file of files) {
         if (this.resolve(file)) continue;
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
         folder: {
            get: () => basename(path),
            set: () => this.logger.error('Folder changes are forbidden at runtime.')
         }
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

         const Entity = require(window.__SPLASH__ && data.splash ?
            resolve(this.path, entry, data.splash) :
            resolve(this.path, entry, data.main ?? '')
         );

         try {
            this.validateManifest(data);
         } catch (e) {
            return this.logger.error(e);
         }

         const type = constants.entities[this.type];
         const res = {
            instance: type(Entity.__esModule ? Entity.default : Entity, data)
         };

         this.assignData(data, res, entry);
         this.assignData(data, res.instance, entry);

         res.instance?.load?.();

         this.entities.set(data.id, res);
         this.emit('load', data.id, res);

         if (this.isEnabled(data.id) || this.isEnabled(entry)) {
            this.start(data.id);
         }

         return res;
      } catch (e) {
         this.logger.error(`Failed to start ${basename(entry)}`, e);
         return null;
      }
   }

   start(id) {
      let entity = this.resolve(id);
      if (!entity) entity = this.load(id);

      if (entity && entity.instance && !entity.started) {
         try {
            entity.started = true;
            entity.instance.start();
            this.logger.log(`${entity.data.name} was started.`);
         } catch (e) {
            this.logger.error(`Couldn't start ${entity.data.name}`, e);
         }
      }
   }

   stop(id) {
      const entity = this.resolve(id);
      if (entity && entity.instance && entity.started) {
         try {
            entity.started = false;
            entity.instance.stop();
            this.logger.log(`${entity.data.name} was stopped.`);
         } catch (e) {
            this.logger.error(`Couldn't stop ${entity.data.name}`, e);
         }
      }
   }

   unload(id) {
      const entity = this.resolve(id);
      if (entity) {
         try {
            entity.instance?.stop?.();
            const cache = Object.keys(require.cache).filter(c => c.includes(entity.folder));
            cache.map(c => delete require.cache[c]);
            this.entities.delete(entity.id);
            this.emit('updated');
            this.logger.log(`${entity.data.name} was stopped & unloaded.`);
         } catch (e) {
            this.logger.error(`FATAL: ${entity.id} was not able to unload properly, a reload using CTRL+R is recommended.`, e);
         }
      }
   }

   unloadAll() {
      for (const id of this.entities.keys()) {
         this.unload(id);
      }
   }

   reload(id) {
      let entity = this.resolve(id);

      try {
         if (!entity) {
            return this.load(id);
         }

         this.unload(entity.folder);
         this.load(entity.folder);
      } catch (e) {
         this.logger.error(`Couldn't reload ${id}`, e);
      }

      return entity;
   }

   fetch() {
      if (!existsSync(this.path)) mkdirSync(this.path);

      return readdirSync(this.path);
   };

   isEnabled(id) {
      const settings = this.settings.get(this.type, []);
      const direct = this.resolve(id);

      return settings.includes(direct?.id);
   }

   enable(id) {
      const entity = this.resolve(id);

      try {
         const store = this.settings.get(this.type, []);
         store.push(entity.id);
         this.settings.set(this.type, store);
         this.start(entity.folder);
      } catch (e) {
         this.logger.error(`Failed to enable ${entity.id}`, e);
      }
   }

   disable(id) {
      const entity = this.resolve(id);

      try {
         const store = this.settings.get(this.type, []);
         const index = store.findIndex(e => e == entity.id);
         index > -1 && store.splice(index, 1);
         this.settings.set(this.type, store);
         this.stop(entity.id);
      } catch (e) {
         this.logger.error(`Failed to disable ${entity.id}`, e);
      }
   }

   toggle(id) {
      const entity = this.resolve(id);
      const isEnabled = this.isEnabled(entity);

      try {
         if (isEnabled) {
            this.disable(entity.id);
         } else {
            this.enable(entity.id);
         }

         this.emit('toggle', entity.id);
      } catch (e) {
         this.logger.error(`Failed to toggle ${entity.id}`, e);
      }
   }

   get get() {
      return this.resolve;
   }
};