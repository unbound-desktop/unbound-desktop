const API = require('@structures/api');

const { bindAll, createStore, uuid } = require('@utilities');
const { create } = require('@patcher');

const toasts = createStore();
const Patcher = create('unbound-toasts');

module.exports = new class Toasts extends API {
   constructor() {
      super();

      this.promises = {
         cancelled: false,
         cancel: () => this.promises.cancelled = true
      };

      bindAll(this, ['send', 'close']);
   }

   start() {

   };

   send(options) {
      options.id ??= uuid(5);

      if (toasts.get(options.id)) {
         return this.send(Object.assign(options, { id: uuid(5) }));
      }

      toasts.set(options.id, options);

      return options.id;
   }

   close(id) {
      if (toasts.get(id)) {
         toasts.delete(id);
      }
   }

   stop() {
      this.promises.cancel();
      Patcher.unpatchAll();
   }
};
