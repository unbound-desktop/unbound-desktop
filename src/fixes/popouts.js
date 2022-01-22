if (window?.opener?.popouts) {
   window.addEventListener('load', () => {
      window.opener.popouts.set(window.name, window);
   });

   window.addEventListener('beforeunload', () => {
      window.opener.popouts.delete(window.name);
   });
};