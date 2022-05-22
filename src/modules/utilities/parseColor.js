/**
 * @name parseColor
 * @description Allows functionality of a python-like sleep method
 * @param {string} color - A CSS parsable color string or a css variable name in :root.
 * @return {[number, number, number, number?]} Returns an array of the RGB(A) values.
 */

module.exports = (color) => {
   if (color.indexOf('--') === 0) {
      color = getComputedStyle(document.documentElement).getPropertyValue(color);
   }

   const sheet = new CSSStyleSheet();
   sheet.replaceSync(`target {color: ${color}}`);
   return sheet.cssRules[0].style.color.match(/[\.\d]+/g).map(Number);
};