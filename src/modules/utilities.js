/**
 * Most of these were taken from PC Compat.
 * @copyright https://github.com/Strencher
 * @url https://github.com/strencher-kernel/pc-compat/blob/dev/src/renderer/powercord/util.ts
 */

module.exports = new class Util {
   constructor() {
      this.bindAll(this, Reflect.ownKeys(this.__proto__));
   }

   sleep(time) {
      return new Promise(f => setTimeout(f, time));
   }

   async waitFor(selector) {
      let element = document.querySelector(selector);

      while (!element && (element = document.querySelector(selector))) {
         await this.sleep(1);
      };

      return element;
   }

   findInReactTree(tree, filter, options = {}) {
      return this.findInTree(tree, filter, { ...options, walkable: ['props', 'children'] });
   };

   getReactInstance(element) {
      return element['__reactFiber$'];
   };

   getOwnerInstance(node, filter = _ => true) {
      if (!node) return null;
      const fiber = getReactInstance(node);
      let current = fiber;

      const matches = () => filter(current?.stateNode);

      while (!matches()) {
         current = current?.return;
      }

      return current?.stateNode ?? null;
   };

   findInTree(tree = {}, filter = _ => _, { ignore = [], walkable = [], maxProperties = 100 } = {}) {
      let stack = [tree];
      const wrapFilter = function (...args) {
         try {
            return Reflect.apply(filter, this, args);
         } catch {
            return false;
         }
      };

      while (stack.length && maxProperties) {
         const node = stack.shift();
         if (wrapFilter(node)) return node;

         if (Array.isArray(node)) {
            stack.push(...node);
         } else if (typeof node === 'object' && node !== null) {
            if (walkable.length) {
               for (const key in node) {
                  const value = node[key];
                  if (~walkable.indexOf(key) && !~ignore.indexOf(key)) {
                     stack.push(value);
                  }
               }
            } else {
               for (const key in node) {
                  const value = node[key];
                  if (node && ~ignore.indexOf(key)) continue;

                  stack.push(value);
               }
            }
         }
         maxProperties--;
      }
   };

   uuid(length = 30) {
      let uuid = '';

      do {
         const random = Math.random() * 16 | 0;
         uuid += (uuid.length == 12 ? 4 : (uuid.length == 16 ? (random & 3 | 8) : random)).toString(16);
      } while (uuid.length < length);

      return uuid;
   }

   appendCSS(id, css) {
      const stylesheet = document.createElement('style');
      stylesheet.id = id ?? 'Unknown';
      stylesheet.innerHTML = css;
      return document.head.appendChild(stylesheet);
   }

   bindAll(ctx, array) {
      if (!ctx || !['function', 'object'].includes(typeof ctx)) {
         throw new TypeError('bindAll\'s first argument must be of type function');
      } else if (!array || !Array.isArray(array)) {
         throw new TypeError('bindAll\'s second argument must be of type array');
      }

      array = array.filter(item => typeof item == 'string' && item != 'constructor');

      for (const item of array) {
         try {
            ctx[item] = ctx[item].bind(ctx);
         } catch (error) {
            throw new Error('one of the functions to bind does not exist or is not of type function');
         }
      }
   }

   capitalize(string) {
      if (typeof string != 'string') throw new TypeError('capitalize\'s first argument must be of type string');

      return string.charAt(0).toUpperCase() + string.slice(1);
   }

   parseStyleObject(style, line = false) {
      if (!style || (typeof style !== 'object' && !Array.isArray(style))) {
         throw new TypeError('parseStyleObject\'s first argument must be of type object');
      }

      return Object.entries(style).map(([a, b]) => `${a}: ${b};`).join(line ? '\n' : ' ');
   }

   noop() { }
};