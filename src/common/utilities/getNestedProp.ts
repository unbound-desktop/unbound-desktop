/**
 * @name getNestedProp
 * @description Gets a nested prop from an object safely by returning null if nothing is found
 * @param {object} object - The object to get the nested prop from
 * @param {string} path - The path to the nested prop
 * @return {any} Returns null if no prop is found or the prop if it's found.
 */

function getNestedProp(object: Record<any, any>, path: string): any {
   return path.split('.').reduce((parent, key) => {
      return parent && parent[key];
   }, object);
};

export = getNestedProp;