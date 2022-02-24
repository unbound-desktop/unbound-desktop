/**
 * @name createStore
 * @description Creates a Flux store with the data provided
 * @param {object} data - The data to pass to the store (must be an object)
 * @return {Flux.Store} Returns an initialized Flux store.
 */

module.exports = (data) => {
   // Require this here as we don't have it before webpack inits so the client dies
   // require caches it anyway
   const { Flux, Dispatcher } = require('@webpack/common');

   class Store extends Flux.Store {
      constructor(...args) {
         super(...args);

         this.store = { ...data };
      }

      get(key) {
         return this.store[key];
      }

      getAll() {
         return this.store;
      }
   };

   return new Store(Dispatcher, {});
};