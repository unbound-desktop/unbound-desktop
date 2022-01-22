const Addon = require('@structures/addon');
const Logger = require('@modules/logger');
const { resolve } = require('path');

module.exports = class Theme extends Addon {
   constructor(instance, data) {
      super(instance, data);

      this.logger = new Logger('Theme', data.name);
   }

   start(css) {
      if (css) {
         this.instance = css;
      }

      if (document.readyState === 'loading') {
         return window.addEventListener('load', this.apply.bind(this));
      }

      this.apply();
   }

   apply() {
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