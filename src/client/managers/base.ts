import { createLogger } from '@common/logger';
import * as Settings from '@common/settings';
import { resolve, basename } from 'path';
import * as Entities from '@entities';
import { Paths } from '@constants';
import Emitter from 'events';
import fs from 'fs';

interface ManagerOptions {
   name: string;
   entity: string;
   folder: string;
}

export type Author = {
   name: string;
   id?: number;
} | string;

export interface Manifest {
   id: string;
   name: string;
   description: string;
   authors: Author | Author[];
   version: string;
};

export interface Entity {
   started: boolean;
   failed: boolean;
   data: Manifest;
   folder: string;
   instance: any;
   path: string;
   id: string;
}

export type Resolveable = string | Entity;

class Manager extends Emitter {
   public logger: ReturnType<typeof createLogger>;
   public entities: Map<string, Entity> = new Map();
   public started: Set<string>;
   public entity: string;
   public folder: string;
   public name: string;
   public id: string;

   constructor({ name, entity, folder }: ManagerOptions) {
      super();

      this.logger = createLogger('Managers', name);
      this.entity = Entities[entity];
      this.name = name;

      this.started = new Set();

      if (!this.entity) {
         throw new Error('Invalid entity.');
      }

      if (!fs.existsSync(Paths.storage)) {
         fs.mkdirSync(Paths.storage);
      }

      this.id = folder;
      this.folder = resolve(Paths.storage, folder);
      if (!fs.existsSync(this.folder)) {
         fs.mkdirSync(this.folder);
      }
   }

   start(id: Resolveable) {
      let entity = this.resolve(id);

      if (!entity) {
         entity = this.load(id as string);
      }

      if (entity?.instance && !this.started.has(entity.data?.id)) {
         try {
            this.started.add(entity.data.id);
            entity.instance.start?.();
            this.logger.log(`${entity.data.name} was started.`);
         } catch (e) {
            this.started.delete(entity.data.id);
            this.logger.error(`Couldn't start ${entity.data.name}. You may face issues with your client.\n`, e);
         }
      }
   }

   stop(id: Resolveable) {
      const entity = this.resolve(id);
      if (entity?.instance && this.started.has(entity.data?.id)) {
         try {
            this.started.delete(entity.data.id);
            entity.instance._stop?.();
            this.logger.log(`${entity.data.name} was stopped.`);
         } catch (e) {
            this.started.add(entity.data.id);
            this.logger.error(`Couldn't stop ${entity.data.name}. You may face issues with your client.\n`, e);
         }
      }
   }

   reload(id: Resolveable): Entity {
      const entity = this.resolve(id);

      try {
         if (!entity) {
            return this.load(id as string);
         }

         this.unload(entity.folder);
         this.load(entity.folder);
      } catch (e) {
         this.logger.error(`Couldn't reload ${id}`, e);
      }

      return entity;
   }

   resolve(id: any): Entity | undefined {
      if (id.instance) return id;

      const storage = this.entities.get(id);
      if (storage) return storage;

      const entities = [...this.entities.values()];
      const other = entities.find(e => e.folder === id || e.id === id);
      if (other) return other;
   }

   loadMissing(): { loaded: any[], missing: any[]; } {
      const contents = fs.readdirSync(this.folder);
      const entities = contents.filter(id => {
         const path = resolve(this.folder, id);
         return fs.statSync(path).isDirectory() && !this.resolve(id);
      });

      const loaded = [];

      for (const id of entities) {
         try {
            const entity = this.load(id);
            loaded.push(entity);
         } catch (e) {
            this.logger.error(e);
         }
      }

      return { loaded, missing: entities };
   }

   initialize() {
      const status = { failed: 0 };

      const contents = fs.readdirSync(this.folder);
      const entities = contents.filter(e => {
         try {
            const item = resolve(this.folder, e);
            return fs.statSync(item).isDirectory();
         } catch {
            return false;
         }
      });

      for (const id of entities) {
         try {
            const entity = this.load(id);
            if (entity?.failed) status.failed++;
         } catch (e) {
            status.failed++;
            this.logger.error(e);
         }
      }
   }

   load(id: string): Entity {
      if (this.resolve(id)) return;

      const root = resolve(this.folder, id);
      if (!fs.existsSync(root)) {
         throw new Error(`${id} doesn't exist in the ${this.name} folder.`);
      }

      if (!fs.lstatSync(root).isDirectory()) {
         throw new Error(`${id} isn't an ASAR package.`);
      };

      const manifest = resolve(root, 'manifest.json');
      if (!fs.existsSync(manifest)) {
         throw new Error(`${id} is missing a manifest.`);
      }

      const data = require(manifest);
      this.#validateManifest(data);

      const isSplash = window.__SPLASH__;
      if (isSplash && !data.splash) return;

      if (this.entities.get(data.id)) {
         throw new Error(`${id} is a taken ID, therefore it won't be loaded/overriden.`);
      }

      const res = {
         instance: null,
         failed: false,
         started: null,
         data: null
      } as Entity;

      this.#assignData(data, res, root);

      try {
         const Constructor = this.resolvePayload(root, data, isSplash);
         this.#assignData(data, Constructor.prototype, root);
         res.instance = new Constructor();
      } catch (e) {
         res.failed = true;
         this.logger.error(`Failed to load addon ${id}, registering it with an empty instance.`, e);
      }

      if (res.instance) {
         this.#assignData(data, res.instance, root);
      }

      try {
         res.instance?.load?.();
      } catch (e) {
         this.logger.error(`Failed to run load() method in ${id}.`);
      }

      this.entities.set(data.id, res);
      this.emit('load', data.id, res);
      this.emit('updated');

      if (this.isEnabled(data.id)) {
         this.start(data.id);
      }

      return res;
   }

   unload(id: Resolveable) {
      const addon: Entity = this.resolve(id);
      if (!addon) throw new Error('Invalid addon');

      this.stop(addon);
      const cache = Object.keys(require.cache).filter(c => ~c.indexOf(addon.path));

      try {
         this.stop(addon);

         for (let i = 0, len = cache.length; i < len; i++) {
            const mod = require.cache[cache[i]];
            delete require.cache[cache[i]];

            // Delete parent children to avoid memory leaks
            for (let k = 0; k < mod.parent.children.filter(Boolean).length; k++) {
               if (!mod.parent.children[k]) continue;
               if (~mod.parent.children[k].path.indexOf(addon.path)) {
                  mod.parent.children.splice(k, 1);
                  break;
               }
            }
         }

         this.entities.delete(addon.id);
         this.emit('updated');
      } catch (e) {
         this.logger.error(`FATAL: ${addon.id} was not able to unload properly, a reload using CTRL+R is recommended.`, e);
      }
   }

   shutdown() {
      for (const entity of this.entities.values()) {
         try {
            this.unload(entity);
         } catch (e) {
            this.logger.error(`Failed to stop ${entity.id}. Skipping.`, e.message);
            continue;
         }
      }
   }

   disable(id: string) {
      const addon = this.resolve(id);
      if (!addon) throw new Error('Invalid addon.');

      const addons = Settings.get('unbound', 'addon-states', {});
      addons[this.id] ??= {};
      addons[this.id][addon.id] = false;

      if (addon.started) {
         this.stop(addon);
      }

      return Settings.set('unbound', 'addon-states', addons);
   }

   enable(id: string) {
      const addon = this.resolve(id);
      if (!addon) throw new Error('Invalid addon.');

      const addons = Settings.get('unbound', 'addon-states', {});
      addons[this.id] ??= {};
      addons[this.id][addon.id] = true;

      if (!addon.started) {
         this.start(addon.folder);
      }

      return Settings.set('unbound', 'addon-states', addons);
   }

   toggle(id: string) {
      const addon = this.resolve(id);
      if (!addon) throw new Error('Invalid addon.');

      const addons = Settings.get('unbound', 'addon-states', {});
      addons[this.id] ??= {};
      addons[this.id][addon.id] = !(addons[this.id][addon.id] ?? false);

      if (addons[this.id][addon.id]) {
         this.start(addon);
      } else {
         this.stop(addon);
      }

      Settings.set('unbound', 'addon-states', addons);
      this.emit('toggle');
   }

   isEnabled(id: string): boolean {
      const addon = this.resolve(id);
      if (!addon) throw new Error('Invalid addon.');

      return Settings.get('unbound', 'addon-states', {})[this.id]?.[addon.id] ?? false;
   }

   resolvePayload(root: string, data: Record<string, any>, isSplash: boolean = false) {
      const path = resolve(root, isSplash ? data.splash : data.main ?? '');
      const payload = require(path);

      return payload.__esModule ? payload.default : payload;
   }

   #validateManifest(data: Record<string, any>): void | Error {
      const keys = ['name', 'id', 'authors', 'version'];
      const missing = keys.filter(k => !data[k]);

      if (missing?.length) {
         throw new Error(`${data.name} is missing the following manifest keys: ${missing.join(', ')}`);
      }
   }

   #assignData(data, object, path) {
      if (!object) return;
      if (['data', 'started', 'id', 'path', 'folder'].every(p => object[p] !== undefined)) {
         return;
      }

      Object.defineProperties(object, {
         data: {
            get: () => data,
            set: () => this.logger.error('Entity manifest changes are forbidden at runtime.')
         },
         started: {
            get: () => this.started.has(data.id),
            set: () => this.logger.error('Entity started state changes are forbidden at runtime.')
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
}

// @ts-ignore
export = Manager;