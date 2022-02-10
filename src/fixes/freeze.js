const setNow = window.setImmediate;

window.setImmediate = function (callback, ...rest) {
   return setNow.apply(this, [(...args) => {
      try {
         callback(...args);
      } catch (e) {
         if (e) console.error('Failed to call callback.', e);
      }
   }, ...rest]);
};