/**
 * @name uuid
 * @description Returns a UUID with the length provided (default: 30)
 * @param {number} [length=30] - The length of the randomized UUID
 * @return {string} Returns the randomized UUID.
 */

module.exports = (length) => {
   let uuid = '';

   do {
      const random = Math.random() * 16 | 0;
      uuid += (uuid.length == 12 ? 4 : (uuid.length == 16 ? (random & 3 | 8) : random)).toString(16);
   } while (uuid.length < length);

   return uuid;
};