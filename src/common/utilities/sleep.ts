/**
 * @name sleep
 * @description Allows functionality of a python-like sleep method
 * @param {number} time - The time to wait before resolving the promise.
 * @return {Promise<void>} Returns Promise<void>
 */

function sleep(time: number): Promise<void> {
  return new Promise(f => setTimeout(f, time));
}

export = sleep;