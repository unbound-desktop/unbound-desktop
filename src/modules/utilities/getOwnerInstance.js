const getReactInstance = require('./getReactInstance');
const traverseType = require('./traverseType');

/**
 * @name getOwnerInstance
 * @description Gets the parent/owner instance the component belongs to.
 * @param {Element} node - The element to find the instance for
 * @param {function} filter - The filter to apply for the search
 * @return {object|void} Returns the owner instance, usually an object
 */
module.exports = (node, filter = _ => true) => {
   if (!node) return null;
   const fiber = getReactInstance(node);
   let current = fiber;

   const matches = () => {
      if (!current?.stateNode || typeof current.type === 'string') return false;
      const type = traverseType(current);
      if (!type) return false;

      return type && filter(current?.stateNode);
   };

   while (!matches()) {
      current = current?.return;
   }

   return current?.stateNode ?? null;
};