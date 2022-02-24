const sleep = require('@utilities/sleep');

/**
 * @name waitFor
 * @description Returns an element once it is found in the DOM
 * @param {string} selector - The query/selector to pass to document.querySelector
 * @return {Promise<HTMLElement>} Returns Promise<HTMLElement>
 */

module.exports = async (selector) => {
   let element = document.querySelector(selector);

   while (!element && (element = document.querySelector(selector))) {
      await sleep(1);
   };

   return element;
};