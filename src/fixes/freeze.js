process.nextTick(() => {
   const listeners = process.listeners('uncaughtException');
   const target = listeners.find(l => ~l.toString().indexOf('uncaughtExceptionHandler'));
   process.off('uncaughtException', target);
})