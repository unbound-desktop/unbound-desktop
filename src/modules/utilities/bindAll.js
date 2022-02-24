/**
 * @name bindAll
 * @description Binds functions to the passed context.
 * @param {any} ctx - The context to bind the functions to
 * @param {array} names - The names of the functions that exist on the context
 */

module.exports = (ctx, names) => {
   if (!ctx || !['function', 'object'].includes(typeof ctx)) {
      throw new TypeError('bindAll\'s first argument must be of type function');
   } else if (!names || !Array.isArray(names)) {
      throw new TypeError('bindAll\'s second argument must be of type array');
   }

   names = names.filter(item => typeof item == 'string' && item != 'constructor');

   for (const item of names) {
      try {
         ctx[item] = ctx[item].bind(ctx);
      } catch (error) {
         throw new Error('one of the functions to bind does not exist or is not of type function');
      }
   }
};