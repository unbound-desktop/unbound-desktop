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

   const storage = { ...(data ?? {}) };
   const id = uuid(10).toUpperCase();

   const handlers = {
      get: (key, defaults) => storage[key] ?? defaults,
      set: (key, value) => Dispatcher.dirtyDispatch({
         type: `UNBOUND_FLUX_${id}_SET`,
         key,
         value
      }),
      delete: (key) => handlers.set(key)
   };

   const store = new Flux.Store(Dispatcher, {
      [`UNBOUND_FLUX_${id}_SET`]: ({ key, value }) => {
         if (value === void 0) {
            delete storage[key];
         } else {
            storage[key] = value;
         }
      }
   });

   return {
      ...handlers,
      store,
      storage,
      id,
   };
};