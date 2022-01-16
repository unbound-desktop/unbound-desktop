const Addon = require('@structures/addon');
const { logger } = require('@modules');
const { resolve } = require('path');

module.exports = class Theme extends Addon {
   constructor(instance, data) {
      super(instance, data);

      this.logger = new logger('Theme', data.name);
   }

   start() {
      const splash = this.data.splash ?? this.data.splashTheme;
      if (window.__SPLASH__ && splash) {
         this.instance = require(resolve(this.path, splash));
      }

      if (document.readyState === 'loading') {
         return window.onload = this.apply.bind(this);
      }

      this.apply();
   }

   apply() {
      console.log('applied');
      try {
         const stylesheet = document.createElement('style');
         stylesheet.id = this.id;
         stylesheet.innerHTML = this.instance;
         this.stylesheet = document.head.appendChild(stylesheet);
      } catch (e) {
         this.logger.error('Failed to apply theme', e);
      }
   }

   stop() {
      document.head.removeChild(this.stylesheet);
   }
};