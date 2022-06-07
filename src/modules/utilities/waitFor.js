const sleep = require('./sleep');

/**
 * @name waitFor
 * @description Returns an element once it is found in the DOM
 * @param {string} selector - The query/selector to pass to document.querySelector
 * @param {number} [timeout=0] - The amount of time to wait before cancelling (0 is infinite)
 * @return {Promise<Element>} Returns Promise<Element>
 */

module.exports = async (selector, timeout = 0) => {
   const data = {
      element: document.querySelector(selector),
      cancelled: false,
      timeout: null
   };

   if (timeout > 0) {
      data.timeout = setTimeout(() => data.cancelled = true, timeout);
   }

   while (!data.element && !(data.element = document.querySelector(selector))) {
      await sleep(1);
      if (data.cancelled) break;
   };

   clearTimeout(data.timeout);

   return data.element;
};