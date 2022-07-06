import findInTree, { findInTreeOptions } from './findInTree';

/**
 * @name findInReactTree
 * @description Traverses through a react tree
 * @param {(object|array)} tree - The tree to search through
 * @param {function} filter - The filter to run on the tree passed as the first argument
 * @param {object} options - Options to pass to findInTree
 * @return {any} Returns null if nothing is filtered or the value that is filtered.
 */

function findInReactTree(tree: Record<any, any> | any[], filter: (...args: any) => boolean = _ => _, options: findInTreeOptions = {}) {
  return findInTree(tree, filter, { walkable: ['props', 'children'], ...options });
};

export = findInReactTree;