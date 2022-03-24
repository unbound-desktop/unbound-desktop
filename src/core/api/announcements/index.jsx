const API = require('@structures/api');

const { bindAll, createStore, uuid, waitFor, getOwnerInstance, findInReactTree } = require('@utilities');
const { Flux, React } = require('@webpack/common');
const { getByProps } = require('@webpack');
const { create } = require('@patcher');

const announcements = createStore();
const Patcher = create('unbound-announcements');

const Container = require('./components/Container');

module.exports = new class Announcements extends API {
   constructor() {
      super();

      this.promises = {
         cancelled: false,
         cancel: () => this.promises.cancelled = true
      };

      bindAll(this, ['send', 'close']);
   }

   start() {
      this.patchBaseContainer();
      this.patchClasses();
   };

   async patchBaseContainer() {
      const { base } = getByProps('base', 'container') ?? { base: 'class-not-found' };
      const instance = getOwnerInstance(await waitFor(`.${base}`));
      if (this.promises.cancelled) return;

      try {
         const ConnectedContainer = Flux.connectStores([announcements.store], () => { })(Container);
         Patcher.after(instance?.props?.children, 'type', (_, args, res) => {
            try {
               const { children } = findInReactTree(res, r => r.className === base);
               children.unshift(<ConnectedContainer store={announcements} />);
            } catch (error) {
               return this.logger.error(error);
            }
         });

         instance.forceUpdate();
      } catch (e) {
         this.logger.error('Failed to patch announcements container', e);
      }
   }

   async patchClasses() {
      const classes = getByProps('notice', 'colorDefault', 'buttonMinor');
      if (~classes.notice.indexOf('unbound-announcement')) return;

      classes.notice += ' unbound-announcement';
   }

   send(options) {
      options.id ??= uuid(5);

      if (announcements.get(options.id)) {
         return this.send(Object.assign(options, { id: uuid(5) }));
      }

      announcements.set(options.id, options);

      return options.id;
   }

   close(id) {
      if (announcements.get(id)) {
         announcements.delete(id);
      }
   }

   stop() {
      this.promises.cancel();
      Patcher.unpatchAll();
   }
};
