import getReactInstance from './getReactInstance';
import traverseType from './traverseType';

/**
 * @name getOwnerInstance
 * @description Gets the parent/owner instance the component belongs to.
 * @param {Element} node - The element to find the instance for
 * @param {function} filter - The filter to apply for the search
 * @return {object|void} Returns the owner instance, usually an object
 */
function getOwnerInstace(node: Element, filter: (...args) => any = _ => true, stateNode: boolean = true) {
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

   return stateNode ? current?.stateNode : current;
};

export = getOwnerInstace;