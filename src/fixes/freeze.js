const setNow = window.setImmediate;

window.setImmediate = (callback, ...rest) => {
   return setNow((...args) => {
      try {
         callback(...args);
      } catch { }
   }, ...rest);
};