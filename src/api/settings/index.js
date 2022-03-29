const { Dispatcher, Flux, React } = require('@webpack/common');
const { bindAll } = require('@utilities');
const API = require('@structures/api');
const Store = require('./flux');

class Settings extends API {
   constructor() {
      super();

      this.listeners = {};

      bindAll(this, ['set', 'get', 'toggle']);
   }

   get settings() {
      return Store.getAll();
   }

   get store() {
      return Store;
   }

   start() {
      const { UNBOUND_SET_SETTING, UNBOUND_TOGGLE_SETTING } = this;
      Dispatcher.subscribe('UNBOUND_SET_SETTING', UNBOUND_SET_SETTING);
      Dispatcher.subscribe('UNBOUND_TOGGLE_SETTING', UNBOUND_TOGGLE_SETTING);
   }

   stop() {
      this.listeners = {};

      const { UNBOUND_SET_SETTING, UNBOUND_TOGGLE_SETTING } = this;
      Dispatcher.unsubscribe('UNBOUND_SET_SETTING', UNBOUND_SET_SETTING);
      Dispatcher.unsubscribe('UNBOUND_TOGGLE_SETTING', UNBOUND_TOGGLE_SETTING);
   }

   UNBOUND_SET_SETTING = (args) => {
      return this.handleSettingsUpdate({ ...args, type: 'set' });
   };

   UNBOUND_TOGGLE_SETTING = (args) => {
      return this.handleSettingsUpdate({ ...args, type: 'toggle' });
   };

   handleSettingsUpdate({ file, type, ...args }) {
      const listeners = this.listeners[file];
      if (!listeners) return;

      for (const listener of listeners.values()) {
         listener({ ...args });
      }
   }

   set(file, setting, value) {
      if (!file || typeof file !== 'string') {
         throw new TypeError('the first argument file must be of type string');
      } else if (!setting || typeof setting !== 'string') {
         throw new TypeError('the second argument setting must be of type string');
      }

      return Dispatcher.dirtyDispatch({
         type: 'UNBOUND_SET_SETTING',
         file,
         setting,
         value
      });
   }

   get(file, setting, defaults) {
      if (!file || typeof file !== 'string') {
         throw new TypeError('the first argument file must be of type string');
      } else if (!setting || typeof setting !== 'string') {
         throw new TypeError('the second argument setting must be of type string');
      }

      return Store.getSetting(file, setting, defaults);
   }

   toggle(file, setting, defaults) {
      if (!file || typeof file !== 'string') {
         throw new TypeError('the first argument file must be of type string');
      } else if (!setting || typeof setting !== 'string') {
         throw new TypeError('the second argument setting must be of type string');
      } else if (!defaults || typeof defaults !== 'boolean') {
         throw new TypeError('the third argument defaults must be of type boolean');
      }

      return Dispatcher.dirtyDispatch({
         type: 'UNBOUND_TOGGLE_SETTING',
         file,
         setting,
         defaults
      });
   }

   connectComponent(component, file) {
      if (!component || typeof component !== 'function') {
         throw new TypeError('the first argument component must be of type function');
      } else if (!file || typeof file !== 'string') {
         throw new TypeError('the second argument file must be of type string');
      }

      const _this = this;
      return class extends React.Component {
         displayName = component.displayName;
         name = component.name;

         constructor() {
            super();

            this.state = {
               settings: Store.get(file)
            };
         }

         componentWillMount() {
            _this.subscribe(file, this.onChange.bind(this));
         }

         componentWillUnmount() {
            _this.unsubscribe(file, this.onChange.bind(this));
         }

         onChange() {
            this.setState({ settings: Store.get(file) });
         }

         render() {
            return React.createElement(component, {
               ...this.props,
               settings: _this.makeStore(file)
            });
         }
      };
   };

   makeStore(file) {
      if (!file || typeof file !== 'string') {
         throw new TypeError('the first argument file must be of type string');
      }

      return {
         settings: Store.get(file),
         set: (key, value) => this.set(file, key, value),
         get: (key, defaults) => this.get(file, key, defaults),
         toggle: (key, defaults) => this.toggle(file, key, defaults)
      };
   }

   subscribe(file, callback) {
      if (!file || typeof file !== 'string') {
         throw new TypeError('the first argument file must be of type string');
      } else if (!callback || typeof callback !== 'function') {
         throw new TypeError('the second argument callback must be of type function');
      }

      this.listeners[file] ??= new Set();
      this.listeners[file].add(callback);
   }

   unsubscribe(file, callback) {
      if (!file || typeof file !== 'string') {
         throw new TypeError('the first argument file must be of type string');
      } else if (!callback || typeof callback !== 'function') {
         throw new TypeError('the second argument callback must be of type function');
      }

      this.listeners[file]?.delete(callback);
      if (this.listeners[file]?.size === 0) {
         delete this.listeners[file];
      }
   }

   connectStores(file) {
      return Flux.connectStores([this.store], () => ({ settings: this.makeStore(file) }));
   }
};

module.exports = new Settings();