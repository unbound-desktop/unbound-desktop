const API = require('@structures/api');

const ToastsContainer = require('./components/ToastsContainer');

const { bindAll, createStore, uuid } = require('@utilities');
const { React, ReactDOM, Flux } = require('@webpack/common');
const { create } = require('@patcher');

const Patcher = create('unbound-toasts');

class Toasts extends API {
   constructor() {
      super();

      this.toasts = createStore();
      this.container = document.createElement('div');
      this.container.className = 'unbound-toasts';

      bindAll(this, ['open', 'close']);
   }

   start() {
      const ConnectedToastsContainer = Flux.connectStores([this.toasts], () => { })(ToastsContainer);
      ReactDOM.render(<ConnectedToastsContainer manager={this} toasts={this.toasts} />, this.container);
      document.body.appendChild(this.container);
   }

   open(options) {
      const id = Date.now();
      this.toasts.set(id, options);

      return id;
   }

   close(id) {
      const toast = this.toasts.get(id);
      if (!toast) return;

      this.toasts.set(toast.id, { ...toast, closing: true });
   }

   closeAll() {
      for (const toast in this.toasts.storage) {
         this.close(toast);
      }
   }

   clear() {
      this.toasts.set('*', {});
   }

   stop() {
      this.container.remove();
      Patcher.unpatchAll();
   }
};

module.exports = new Toasts();