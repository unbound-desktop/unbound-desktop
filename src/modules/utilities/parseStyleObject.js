/**
 * @name parseStyleObject
 * @description Parses React-like style objects into a CSS string
 * @param {object} style - The object to turn into a CSS property string
 * @param {boolean} [line=false] - Newline each style
 * @return {string} Returns CSS properties to be put inside a selector
 */

module.exports = (style, line = false) => {
   if (!style || (typeof style !== 'object' && !Array.isArray(style))) {
      throw new TypeError('parseStyleObject\'s first argument must be of type object');
   }

   return Object.entries(style).map(([a, b]) => `${a}: ${b};`).join(line ? '\n' : ' ');
};