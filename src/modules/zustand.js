const { React } = require('@webpack/common');

module.exports = (state) => {
   const listeners = new Set();
   const API = Object.freeze({
      get listeners() {
         return listeners;
      },

      getState(factory = _ => _) {
         return factory(state);
      },

      setState(partial) {
         const partialState = typeof partial === 'function' ? partial(state) : partial;

         if (Object.is(state, partialState)) return;

         state = Object.assign({}, state, partialState);

         for (let i = 0; i < listeners.length; i++) {
            listener(state);
         }
      },

      addListener(listener) {
         if (listeners.has(listener)) return;
         listeners.add(listener);

         return () => listeners.delete(listener);
      },

      removeListener(listener) {
         return listeners.delete(listener);
      }
   });

   function useState(factory = _ => _) {
      const [, forceUpdate] = React.useReducer(e => e + 1, 0);

      React.useEffect(() => {
         const handler = () => forceUpdate();

         listeners.add(handler);

         return () => listeners.delete(handler);
      }, []);

      return API.getState(factory);
   }

   Object.assign(useState, API, {
      *[Symbol.iterator]() {
         yield useState;
         yield API;
      }
   });

   return useState;
};