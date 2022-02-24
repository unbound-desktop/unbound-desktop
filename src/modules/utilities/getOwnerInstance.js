const getReactInstance = require('@utilities/getReactInstance');
const getNestedType = require('@utilities/getNestedType');

/**
 * @name getOwnerInstance
 * @description Gets the parent/owner instance the component belongs to.
 * @param {HTMLElement} node - The element to find the instance for
 * @param {function} filter - The filter to apply for the search
 * @return {function} Returns the function with a cacheable value
 */
module.exports = (node, filter = _ => true) => {
   if (!node) return null;
   const fiber = getReactInstance(node);
   let current = fiber;

   const matches = () => {
      if (!current?.stateNode || typeof current.type === 'string') return false;
      const type = getNestedType(current);
      if (!type) return false;

      return type && filter(current?.stateNode);
   };

   while (!matches()) {
      current = current?.return;
   }

   return current?.stateNode ?? null;
};