const { bindAll, debounce } = require('@utilities');
const Addon = require('@structures/addon');
const Logger = require('@modules/logger');
const DOM = require('@utilities/dom');

module.exports = class Theme extends Addon {
   constructor(instance, data) {
      super(instance, data);

      this.logger = new Logger('Theme', data.name);
      this.settings = window.unbound?.apis?.settings?.makeStore?.(data.id);

      bindAll(this, ['apply', 'onSettingsChange']);

      this.onSettingsChange = debounce(this.onSettingsChange, 100);
   }

   start(css) {
      if (css) {
         this.instance = css;
      }

      /*
       * Try accessing settings, if not accessible due to
       * limitations on the splash screen, do nothing
       */
      try {
         const Settings = require('@api/settings');
         Settings.subscribe(this.data.id, this.onSettingsChange);
      } catch {  }

      if (document.readyState === 'loading') {
         return this.listener = window.addEventListener('load', this.apply);
      }

      this.apply();
   }

   onSettingsChange() {
      try {
         unbound.managers.themes.reload(this.data.id);
      } catch { }
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

      if (this.listener) {
         window.removeEventListener('load', this.listener);
      }

      /*
       * Try accessing settings, if not accessible due to
       * limitations on the splash screen, do nothing
       */
      try {
         const Settings = require('@api/settings');
         Settings.unsubscribe(this.data.id, this.onSettingsChange);
      } catch { }
   }
};