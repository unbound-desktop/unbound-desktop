const API = require('@structures/api');

const ToastsContainer = require('./components/ToastsContainer');

const { bindAll, createStore, uuid } = require('@utilities');
const { React, ReactDOM, Flux } = require('@webpack/common');
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
      this.container = document.createElement('div');
      this.container.className = 'unbound-toasts-container';

      bindAll(this, ['send', 'close']);
   }

   start() {
      const ConnectedToastsContainer = Flux.connectStores([this.toasts.store], () => { })(ToastsContainer);
      ReactDOM.render(<ConnectedToastsContainer toasts={this.toasts} />, this.container);
      document.body.appendChild(this.container);
   }

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
      this.container.remove();
      this.promises.cancel();
      Patcher.unpatchAll();
   }
};

module.exports = new Toasts();