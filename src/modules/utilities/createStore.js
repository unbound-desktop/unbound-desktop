/**
 * @name createStore
 * @description Creates a Flux store with the data provided
 * @param {object} data - The data to pass to the store (must be an object)
 * @return {object} Returns an object containing the ID, the initialized Flux store
 * & its data and functions that go along with it.
 */

const uuid = require('./uuid');

module.exports = (data) => {
   /* Require this here as require caches it and we don't have it before webpack inits so the client dies */
   const { Flux, Dispatcher } = require('@webpack/common');

   let storage = { ...(data ?? {}) };
   const id = uuid(10).toUpperCase();

   class Store extends Flux.Store {
      get(key, defaults) {
         return storage[key] ?? defaults;
      }

      set(key, value) {
         if (key === '*') {
            return storage = value;
         }

         if (value === void 0) {
            delete storage[key];
         } else {
            storage[key] = value;
         }

         this.emitChange();
      };

      delete(key) {
         this.set(key);
      }

      get storage() {
         return storage;
      }

      get id() {
         return id;
      }
   };

   const store = new Store(Dispatcher, {});
   return store;
};