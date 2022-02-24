/**
 * @name getNestedProp
 * @description Gets a nested prop from an object safely by returning null if nothing is found
 * @param {object} object - The object to get the nested prop from
 * @param {function} filter - The filter to run on the tree passed as the first argument
 * @return {any} Returns null if no prop is found or the prop if it's found.
 */

module.exports = (object, path) => {
   return path.split('.').reduce((parent, key) => {
      return parent && parent[key];
   }, object);
};