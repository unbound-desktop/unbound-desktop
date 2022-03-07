process.nextTick(() => {
   const listeners = process.listeners('uncaughtException');
   const target = listeners.find(l => ~l.toString().indexOf('uncaughtExceptionHandler'));
   
   if (target) process.off('uncaughtException', target);
})