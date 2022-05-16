const { Locale: { Messages } } = require('@webpack/common');
const { Dispatcher } = require('@webpack/common');
const unboundStrings = require('@core/i18n');
const { getByProps } = require('@webpack');
const { bindAll } = require('@utilities');
const Locales = getByProps('getLocale');
const API = require('@structures/api');

class i18n extends API {
  constructor() {
    super();

    bindAll(this, ['updateLocale', 'parseObject']);

    this.locale = Locales.getLocale();
    this.unboundStrings = this.parseObject(unboundStrings);
  }

  /**
   * @private
   */
  updateLocale({ locale }) {
    this.locale = locale;
  }

  start() {
    Dispatcher.subscribe('I18N_LOAD_SUCCESS', this.updateLocale);
  }

  stop() {
    Dispatcher.unsubscribe('I18N_LOAD_SUCCESS', this.updateLocale);
  }

  /**
   * @name parseObject
   * @description Prases an object and returns a proxy that handles the locale checking for you.
   * @param {object} data An object containing the i18n strings.
   * @returns {object} A proxy that will return the string for whatever locale is currently set (by default en-US will be used).
   * 
   * @example
   * 
   * ```js
   * const i18n = require('@api/i18n');
   * 
   * const strings = i18n.parseObject({ 
   *   'en-US': { 
   *     GREETING: 'Hello' 
   *   }, 
   *   'fr': { 
   *     GREETING: 'Bonjour'
   *   } 
   * });
   * 
   * console.log(strings.GREETING); // 'Hello' or 'Bonjour'
   * ```
   * You can also set a proxy option to proxy Locale.Messages!
   * ```js
   * const i18n = require('@api/i18n');
   * 
   * const strings = i18n.parseObject({
   *  'proxy': {
   *     FISHING: 'APPLICATION_STORE_GENRE_FISHING'
   *   },
   *  'en-US': { 
   *     GREETING: 'Hello' 
   *   }, 
   *   'fr': { 
   *     GREETING: 'Bonjour'
   *   } 
   * });
   * 
   * console.log(strings.FISHING); // 'Fishing'
   * ```
   */
  parseObject(data) {
    if (!data || typeof data !== 'object') throw new TypeError('Argument "data" must be of type object!');
    if (!data['en-US']) throw new TypeError('Argument "data" must contain an entry for "en-US"!');

    const classCtx = this;
    return new Proxy(data, {
      get(target, prop) {
        return target[classCtx.locale]?.[prop]
          || target['en-US'][prop]
          || Messages[target.proxy?.[prop]];
      }
    });
  }
};

module.exports = new i18n();