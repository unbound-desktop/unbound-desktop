const bindAll = require('./bindAll');
const memoize = require('./memoize');

const createHead = memoize(() => {
   const head = document.createElement('unbound-head');
   document.head.appendChild(head);

   return head;
});

class DOM {
   constructor() {
      this.elements = {
         script: {},
         style: {}
      };

      bindAll(this, [
         'appendStyle',
         'removeStyle',
         'appendScript',
         'removeScript'
      ]);
   }

   get head() {
      return createHead();
   }

   /**
    * @name appendStyle
    * @description Appends a style to the unbound's head.
    * @param {string} id - The unique identifier for this style.
    * @param {string} instance - The CSS/URL string to apply to the DOM.
    * @param {boolean} [url=false] - Whether to treat the css as a URL rather than a stylesheet.
    * @return {object} Returns an object containing the removal function and the DOM element.
   */
   appendStyle(id, instance, url = false) {
      let element;

      if (url) {
         element = document.createElement('link');
         element.rel = 'stylesheet';
         element.href = instance;
      } else {
         element = document.createElement('style');
         element.id = id;
         element.textContent = instance;
      }

      this.head.appendChild(element);
      this.elements.style[id] = element;

      return {
         element,
         remove: () => this.removeStyle(id)
      };
   }

   /**
    * @name appendScript
    * @description Appends a script to the unbound's head.
    * @param {string} id - The unique identifier for this script.
    * @param {string} instance - The URL of the script.
    * @return {object} Returns an object containing the removal function and the DOM element.
   */
   appendScript(id, url) {
      return new Promise((resolve, reject) => {
         const script = document.createElement('script');
         script.id = id;
         script.src = url;
         script.onerror = reject;
         script.onload = () => resolve({
            script,
            remove: () => this.removeScript(id)
         });

         this.head.appendChild(script);
         this.elements.script[id] = script;
      });
   }

   /**
    * @name removeStyle
    * @description Removes a style from the unbound's head.
    * @param {string} id - The unique identifier for the style.
   */
   removeStyle(id) {
      const element = this.#getElement('style', id);

      if (element) element.remove();
      delete this.elements.style[id];
   }

   /**
    * @name removeScript
    * @description Removes a script from the unbound's head.
    * @param {string} id - The unique identifier for the script.
   */
   removeScript(id) {
      const element = this.#getElement('script', id);

      if (element) element.remove();
      delete this.elements.script[id];
   }

   /**
    * @name #getElement
    * @description Finds an element from the unbound's head.
    * @param {string} type - The type of element to search.
    * @param {string} id - The unique identifier for the element.
    * @return {HTMLElement|void} Returns the found DOM element or null.
    * @private
   */
   #getElement(type, id) {
      const applied = this.elements[type][id];
      if (applied) return applied;

      const queried = this.head.querySelector(`${type}[id='${id}']`);
      if (queried) return queried;

      return null;
   }
};

module.exports = new DOM();