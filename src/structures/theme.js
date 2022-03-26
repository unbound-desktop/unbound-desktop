const Addon = require('@structures/addon');
const { bindAll } = require('@utilities');
const Logger = require('@modules/logger');
const DOM = require('@utilities/dom');

module.exports = class Theme extends Addon {
   constructor(instance, data) {
      super(instance, data);

      this.logger = new Logger('Theme', data.name);
      this.settings = window.unbound?.apis?.settings?.makeStore?.(data.id);

      bindAll(this, ['apply']);
   }

   start(css) {
      if (css) {
         this.instance = css;
      }

      if (document.readyState === 'loading') {
         return window.addEventListener('load', this.apply);
      }

      this.apply();
   }

   apply() {
      try {
         this.stylesheet = DOM.appendStyle(this.data.id, this.instance);
      } catch (e) {
         this.logger.error('Failed to apply theme', e);
      }
   }

   stop() {
      if (this.stylesheet?.remove) {
         this.stylesheet.remove();
      }
   }
};