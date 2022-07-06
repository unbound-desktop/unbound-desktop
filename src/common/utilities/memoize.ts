/**
 * @name memoize
 * @description Gives you a function which caches its return value on the first run.
 * @param {function} func - The function to memoize
 * @return {function} Returns the function with a cacheable value
 */

function memoize<T extends Fn>(func: T): T {
  let cache;

  return function (...args: any) {
    cache ??= func.apply(this, args);
    return cache;
  } as T;
};

export = memoize;