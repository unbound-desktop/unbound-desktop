const API = require('@structures/api');

const { bindAll, createStore, uuid } = require('@utilities');
const { create } = require('@patcher');

const Patcher = create('unbound-toasts');

class Toasts extends API {
   constructor() {
      super();

      this.promises = {
         cancelled: false,
         cancel: () => this.promises.cancelled = true
      };

      this.toasts = createStore();

      bindAll(this, ['send', 'close']);
   }

   start() {

   };

   send(options) {
      options.id ??= uuid(5);

      if (this.toasts.get(options.id)) {
         return this.send(Object.assign(options, { id: uuid(5) }));
      }

      this.toasts.set(options.id, options);

      return options.id;
   }

   close(id) {
      if (this.toasts.get(id)) {
         this.toasts.delete(id);
      }
   }

   stop() {
      this.promises.cancel();
      Patcher.unpatchAll();
   }
};

module.exports = new Toasts();