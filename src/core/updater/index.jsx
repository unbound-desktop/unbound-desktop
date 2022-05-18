const { ConfirmModal } = require('@components/modals');
const { contributors, paths } = require('@constants');
const { Modals, Layers } = require('@webpack/common');
const { createLogger } = require('@modules/logger');
const Settings = require('@api/settings');
const sleep = require('@utilities/sleep');
const { strings } = require('@api/i18n');
const { Text } = require('@components');
const Git = require('@modules/git');
const React = require('react');

class Updater {
   settings = Settings.makeStore('unbound-updater');
   logger = createLogger('Updater');

   async fetch() {
      this.settings.set({ updates: [], status: 'checking', force: false });

      const fetched = await this.getUpdates();
      const updates = fetched?.sort((a, b) => b.name - a.name) ?? [];

      this.settings.set({ updates, status: null });
      return updates;
   }

   async install(updates = this.settings.get('updates', [])) {
      this.settings.set({ status: 'updating' });

      const status = { force: [] };
      await Promise.allSettled(updates.map(async update => {
         try {
            const force = this.settings.get('force', false);
            const needsForce = force && force.some(e => update.commits.some(u => u.longHash === e.longHash));

            await Git.pull(update.path, needsForce);

            const idx = updates.indexOf(update);
            if (idx > -1) updates.splice(idx, 1);

            if (update.type === 'Core') {
               this.#promptReload();
            }

            this.settings.set({ updates, force: needsForce ? false : force });
         } catch (e) {
            status.force.push(update.commits);
         }
      }));

      if (status.force.length) {
         this.settings.set('force', status.force.flat());
      }

      this.settings.set('status', null);
   }

   async getUpdates(entities) {
      const concurrency = this.settings.get('concurrency', true);
      const res = [];

      // Get all entity updates
      const store = entities ?? this.#entities;

      for (let { entities, type } of store) {
         // Handle Sets/Maps
         if (entities.values) entities = [...entities.values()];

         if (concurrency) {
            const callbacks = entities.map(entity => this.#handleEntity(entity, type));
            const updates = await Promise.allSettled(callbacks);

            const data = updates.map(u => u.value).flat().filter(Boolean);
            res.push(...data);
         } else {
            await entities.reduce((prev, entity) => prev.then(async () => {
               const metadata = this.#getMeta(entity, type);
               const updates = await this.fetchUpdates(metadata);

               if (updates?.length) res.push(...updates);
            }), Promise.resolve());
         }
      }

      // Get core updates
      try {
         const core = await this.fetchUpdates(this.#core);
         res.push(...core);
      } catch (e) {
         return this.logger.error(`Failed to fetch core updates.`, e);
      }

      return res;
   }

   async fetchUpdates({ path, name, authors, type }) {
      const updates = [];

      try {
         const isRepo = Git.isRepo(path);
         if (!isRepo) return;

         const branch = await Git.getBranch(path);
         const commits = await Git.getNewCommits(path, branch);
         const url = await Git.getURL(path);

         if (commits.length) {
            updates.push({ name, authors, commits, path, type, url });
         }
      } catch (e) {
         return this.logger.error(`Failed to fetch updates for ${name}`, e);
      }

      return updates;
   }

   async #handleEntity(entity, type) {
      const metadata = this.#getMeta(entity, type);
      const updates = await this.fetchUpdates(metadata);

      return updates;
   }

   #promptReload() {
      Modals.openModal(e => <ConfirmModal
         {...e}
         header={strings.RESTART}
         children={<Text>{strings.UPDATE_RESTART_DESC}</Text>}
         cancelText={strings.CANCEL}
         onConfirm={async () => {
            e.onClose();
            Layers.popAllLayers();

            // Wait for layer to pop, it dies if reloaded too early.
            await sleep(300);
            await unbound.restart();

            if (!window.unbound?.apis) return;

            unbound.apis?.toasts?.open({
               title: 'Restart Successful',
               content: 'Unbound restarted successfully, you may continue your previous task.',
               color: 'var(--info-positive-foreground)',
               timeout: 5000,
               icon: 'CheckmarkCircle'
            });
         }}
         confirmText={strings.RESTART}
      />);
   }

   #getMeta(entity, type) {
      return {
         authors: entity.manifest?.author ?? entity.data?.author ?? entity.data?.authors,
         name: entity.manifest?.name ?? entity.data?.name,
         path: entity.path,
         type
      };
   }

   get #entities() {
      return [
         {
            entities: unbound?.managers?.plugins?.entities,
            type: 'Plugin'
         },
         {
            entities: unbound?.managers?.themes?.entities,
            type: 'Theme'
         },
         {
            entities: window.powercord?.pluginManager?.addons,
            type: 'Plugin'
         },
         {
            entities: window.powercord?.styleManager?.addons,
            type: 'Theme'
         }
      ].filter(store => Boolean(store.entities));
   }

   get #core() {
      return {
         path: paths.root,
         name: 'Unbound',
         authors: contributors,
         type: 'Core'
      };
   }
};

module.exports = new Updater();
