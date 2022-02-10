const { Dispatcher, Flux } = require('@webpack/common');
const { bindAll } = require('@utilities');
const API = require('@structures/api');
const Store = require('./flux');

module.exports = new class Settings extends API {
   constructor() {
      super();

      bindAll(this, ['set', 'get', 'toggle']);
   }

   get settings() {
      return Store.getAll();
   }

   get store() {
      return Store;
   }

   set(file, setting, value) {
      if (!file || typeof file != 'string') {
         throw new TypeError('the first argument file must be of type string');
      } else if (!setting || typeof setting != 'string') {
         throw new TypeError('the second argument setting must be of type string');
      }

      return Dispatcher.dispatch({
         type: 'UNBOUND_SET_SETTING',
         file,
         setting,
         value
      });
   }

   get(file, setting, defaults) {
      if (!file || typeof file != 'string') {
         throw new TypeError('the first argument file must be of type string');
      } else if (!setting || typeof setting != 'string') {
         throw new TypeError('the second argument setting must be of type string');
      }

      return Store.getSetting(file, setting, defaults);
   }

   toggle(file, setting, defaults) {
      if (!file || typeof file != 'string') {
         throw new TypeError('the first argument file must be of type string');
      } else if (!setting || typeof setting != 'string') {
         throw new TypeError('the second argument setting must be of type string');
      } else if (!defaults || typeof defaults != 'boolean') {
         throw new TypeError('the third argument defaults must be of type boolean');
      }

      return Dispatcher.dispatch({
         type: 'UNBOUND_TOGGLE_SETTING',
         file,
         setting,
         defaults
      });
   }

   makeStore(file) {
      return {
         settings: Store.get(file),
         set: (key, value) => this.set(file, key, value),
         get: (key, defaults) => this.get(file, key, defaults),
         toggle: (key, defaults) => this.toggle(file, key, defaults)
      };
   }

   connectStores(file) {
      return Flux.connectStores([this.store], () => this.makeStore(file));
   }
};